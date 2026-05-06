provider "aws" {
  region = var.aws_region
}

# 1. Create a Virtual Private Cloud (VPC)
resource "aws_vpc" "moneymitra_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "MoneyMitra-VPC"
  }
}

# 2. Create an EC2 Instance for the Docker Compose Stack
resource "aws_instance" "moneymitra_server" {
  ami           = "ami-0c55b159cbfafe1f0" # Ubuntu 22.04 LTS (Example)
  instance_type = "t3.large"              # Enough RAM for Jenkins, SonarQube, etc.
  key_name      = var.ssh_key_name

  tags = {
    Name = "MoneyMitra-Production-Server"
  }

  # Ensure the server is assigned a public IP
  associate_public_ip_address = true
}

# 3. Output the IP address so Ansible can use it
output "server_public_ip" {
  value = aws_instance.moneymitra_server.public_ip
}
