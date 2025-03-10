variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "martinmazzini.com"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "iadialog"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "container_port" {
  description = "Port exposed by the docker image to redirect traffic to"
  default     = 5000
}

variable "container_cpu" {
  description = "Container CPU units to provision (1024 units = 1 CPU)"
  default     = 256
}

variable "container_memory" {
  description = "Container memory in MiB"
  default     = 512
}

variable "desired_count" {
  description = "Number of docker containers to run"
  default     = 1
} 