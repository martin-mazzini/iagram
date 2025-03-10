terraform {
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
}

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "app_name" {
  description = "Name of the application"
  type        = string
  default     = "iadialog"
}

variable "environment" {
  description = "Environment (e.g., prod, dev, staging)"
  type        = string
  default     = "prod"
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "martinmazzini.com"
}

# Data source for ACM certificate
data "aws_acm_certificate" "domain_cert" {
  domain   = var.domain_name
  statuses = ["ISSUED"]
} 