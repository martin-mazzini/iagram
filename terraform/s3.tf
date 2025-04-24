resource "aws_s3_bucket" "images" {
  bucket = var.bucket_name

  tags = {
    Name    = "IADialog Images"
    Project = "iadialog"
  }
}

# Enable versioning for the bucket
resource "aws_s3_bucket_versioning" "images" {
  bucket = aws_s3_bucket.images.id
  versioning_configuration {
    status = "Enabled"
  }
} 