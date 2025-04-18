variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}


variable "ecr_repo_name" {
  type    = string
  description = "Name of the ECR repository"
  default = "iagram"
}

variable "instance_type" {
  type        = string
  description = "EC2 instance type"
  default     = "t2.micro"
}

variable "app_port" {
  type        = number
  description = "Port on which the application runs"
  default     = 5000
}

variable "bucket_name" {
  type        = string
  description = "Name of the S3 bucket for images"
  default     = "iagram-images"
}

variable "dynamodb_table_name" {
  type        = string
  description = "Name of the DynamoDB table"
  default     = "iagram-data"
}