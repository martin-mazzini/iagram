terraform {
  backend "s3" {
    bucket         = "iadialog-terraform-state"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    profile        = "terraform" # matches AWS profile
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.4"
    }
  }
  required_version = ">= 1.2.0"
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project = "iadialog"
    }
  }
}

# Data source for availability zones
data "aws_availability_zones" "available" {
  state = "available"
} 


module "ec2" {
  source        = "./ec2"
  aws_region    = var.aws_region
  instance_type = var.instance_type
  app_port      = var.app_port
  ecr_repo_name = var.ecr_repo_name
  bucket_name   = var.bucket_name
  dynamodb_table_name = var.dynamodb_table_name
  ssh_key_name  = var.ssh_key_name

}
