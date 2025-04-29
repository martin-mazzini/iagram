#!/bin/bash
dnf update -y
dnf install -y docker
systemctl enable --now docker
usermod -aG docker ec2-user

# Install nginx and certbot
dnf install -y nginx certbot python3-certbot-nginx

# Configure nginx as reverse proxy
cat > /etc/nginx/conf.d/app.conf << 'EOF'
server {
    listen 80;
    server_name iagram.net www.iagram.net;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Start and enable nginx
systemctl enable --now nginx
nginx -s reload

# Install CloudWatch Logs agent
dnf install -y amazon-cloudwatch-agent
cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << 'EOF'
{
  "agent": {
    "metrics_collection_interval": 60,
    "run_as_user": "root"
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/lib/docker/containers/*/*-json.log",
            "log_group_name": "/ec2/iagram-docker-logs",
            "log_stream_name": "{instance_id}-{container_name}",
            "timezone": "UTC"
          }
        ]
      }
    }
  }
}
EOF

# Start CloudWatch agent with config
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json -s

# Configure Docker logging driver
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

# Restart Docker to apply logging configuration
systemctl restart docker

# Create .env file
cat > /home/ec2-user/.env << 'EOF'
${env_file_content}
EOF

# login to ECR & pull latest image on every boot
aws ecr get-login-password --region ${region} \
  | docker login --username AWS --password-stdin ${account}.dkr.ecr.${region}.amazonaws.com

docker rm -f myapp || true
docker pull ${account}.dkr.ecr.${region}.amazonaws.com/${repo}:latest

docker run -d --name myapp -p 127.0.0.1:5000:${port} \
  --restart unless-stopped \
  --env-file /home/ec2-user/.env \
  ${account}.dkr.ecr.${region}.amazonaws.com/${repo}:latest

# Obtain SSL certificate
certbot --nginx --redirect -d iagram.net -d www.iagram.net --non-interactive --agree-tos --register-unsafely-without-email

# Set up automatic renewal
echo "0 0 * * * root certbot renew --quiet --deploy-hook 'systemctl reload nginx'" > /etc/cron.d/certbot-renew
