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