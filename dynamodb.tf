resource "aws_dynamodb_table" "social_media_table" {
  name           = "SocialMediaTable"
  billing_mode   = "PAY_PER_REQUEST"  # This is more cost-effective for the free tier
  hash_key       = "PK"
  range_key      = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name = "SocialMediaTable"
  }

  # Free tier eligible
  # DynamoDB free tier includes 25 GB of storage
} 