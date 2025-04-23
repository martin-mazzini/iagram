# Route53 configuration for iagram.net
resource "aws_route53_zone" "main" {
  name = "iagram.net"
}

# A record pointing to the Elastic IP
resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "www.iagram.net"
  type    = "A"
  ttl     = "300"
  records = [module.ec2.elastic_ip]
}

# A record for the root domain
resource "aws_route53_record" "root" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "iagram.net"
  type    = "A"
  ttl     = "300"
  records = [module.ec2.elastic_ip]
} 