#!/bin/bash
dnf update -y
dnf install -y docker
systemctl enable --now docker
usermod -aG docker ec2-user

# login to ECR & pull latest image on every boot
aws ecr get-login-password --region ${region} \
  | docker login --username AWS --password-stdin ${account}.dkr.ecr.${region}.amazonaws.com

docker rm -f myapp || true
docker pull ${account}.dkr.ecr.${region}.amazonaws.com/${repo}:latest

docker run -d --name myapp -p 80:${port} \
  --restart unless-stopped \
  --env AWS_REGION=${region} \
  --env DYNAMODB_TABLE=${dynamodb_table} \
  --env S3_BUCKET=${bucket} \
  ${account}.dkr.ecr.${region}.amazonaws.com/${repo}:latest
