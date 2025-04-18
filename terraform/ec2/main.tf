terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

data "aws_caller_identity" "this" {}
data "aws_region"          "this" {}

locals {
  account_id = data.aws_caller_identity.this.account_id
}

# ---------- IAM ----------
resource "aws_iam_role" "ec2_role" {
  name               = "ec2-iagram-app-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json
}

data "aws_iam_policy_document" "ec2_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
     principals {
      type = "Service"
      identifiers = [
        "ec2.amazonaws.com"
      ]
    }
  }
}

resource "aws_iam_role_policy" "inline" {
  role   = aws_iam_role.ec2_role.id
  name   = "iagram-inline"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid      = "S3Access"
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:ListBucket"]
        Resource = [
          "arn:aws:s3:::${var.bucket_name}",
          "arn:aws:s3:::${var.bucket_name}/*"
        ]
      },
      {
        Sid      = "DynamoDBAccess"
        Effect   = "Allow"
        Action   = ["dynamodb:*"]
        Resource = "arn:aws:dynamodb:${var.aws_region}:${local.account_id}:table/${var.dynamodb_table_name}"
      },
      {
        Sid      = "ECRAccess"
        Effect   = "Allow"
        Action   = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:GetRepositoryPolicy",
          "ecr:DescribeRepositories",
          "ecr:ListImages",
          "ecr:BatchGetImage"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "app" {
  name = "ec2-iagram-app-profile"
  role = aws_iam_role.ec2_role.name
}

# ---------- Networking ----------
resource "aws_security_group" "app_sg" {
  name        = "ec2-iagram-app-sg"
  description = "Allow SSH + HTTP"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description      = "HTTP"
    from_port        = 80
    to_port          = 80
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = []
    prefix_list_ids  = []
    security_groups  = []
    self             = false
  }

  egress {
    description      = "Allow all outbound traffic"
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = []
    prefix_list_ids  = []
    security_groups  = []
    self             = false
  }
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "public" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# ---------- Elastic IP ----------
resource "aws_eip" "app_ip" {
  instance = aws_instance.app.id
  domain = "vpc"
  depends_on = [data.aws_internet_gateway.default]
}


data "aws_internet_gateway" "default" {
  filter {
    name   = "attachment.vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# ---------- EC2 ----------
data "template_file" "user_data" {
  template = file("${path.module}/user_data.sh")
  vars = {
    region         = var.aws_region
    account        = local.account_id
    repo           = var.ecr_repo_name
    port           = var.app_port
    bucket         = var.bucket_name
    dynamodb_table = var.dynamodb_table_name
  }
}

resource "aws_instance" "app" {
  ami           = data.aws_ami.al2023.id
  instance_type = var.instance_type
  subnet_id     = data.aws_subnets.public.ids[0]

  vpc_security_group_ids = [aws_security_group.app_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.app.name

  user_data              = data.template_file.user_data.rendered

  tags = { Name = "iagram-node-app" }
}

data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-kernel-6.1-x86_64*"]
  }
}
