variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "allowed_ssh_cidr" {
  type    = string
  default = "0.0.0.0/0"
}

variable "instance_type" {
  type    = string
  default = "t2.micro"
}

variable "app_port" {
  type    = number
  default = 5000
  description = "Internal port inside container"
}

variable "ecr_repo_name" {
  type    = string
  default = "iagram"
}

variable "bucket_name" {
  type        = string
  description = "S3 bucket the app will read/write"
  default = "iagram-images"
}

variable "dynamodb_table_name" {
  type        = string
  description = "iagram-data"
}
