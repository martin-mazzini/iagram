variable "aws_region" {
  type    = string
  description = "AWS region to deploy resources"
}

variable "instance_type" {
  type    = string
  description = "EC2 instance type"
}

variable "app_port" {
  type    = number
  description = "Internal port inside container"
}

variable "ecr_repo_name" {
  type    = string
  description = "Name of the ECR repository"
}

variable "bucket_name" {
  type        = string
  description = "S3 bucket the app will read/write"
}

variable "dynamodb_table_name" {
  type        = string
  description = "DynamoDB table the app will read/write"
}

variable "ssh_key_name" {
  type        = string
  description = "Name of the SSH key pair to use for EC2 instance"
}
