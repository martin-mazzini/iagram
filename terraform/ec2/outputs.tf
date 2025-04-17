# outputs.tf
output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.app.id
}

output "public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_eip.app_ip.public_ip
}

output "instance_profile_name" {
  description = "Name of the instance profile"
  value       = aws_iam_instance_profile.app.name
}