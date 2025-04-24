resource "aws_s3_bucket" "test_bucket" {
  bucket = "my-terraform-test-bucket-${random_id.suffix.hex}"

  tags = {
    Name    = "TerraformTest"
    Project = "iadialog"
  }
}

resource "random_id" "suffix" {
  byte_length = 4
}

output "s3_bucket_name" {
  value = aws_s3_bucket.test_bucket.id
}
