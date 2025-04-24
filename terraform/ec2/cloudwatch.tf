# CloudWatch Log Group for Docker container logs
resource "aws_cloudwatch_log_group" "docker_logs" {
  name              = "/ec2/iagram-docker-logs"
  retention_in_days = 30
}

# IAM policy for CloudWatch Logs
resource "aws_iam_role_policy" "cloudwatch_logs" {
  name   = "cloudwatch-logs-policy"
  role   = aws_iam_role.ec2_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams"
        ]
        Resource = "${aws_cloudwatch_log_group.docker_logs.arn}:*"
      }
    ]
  })
} 