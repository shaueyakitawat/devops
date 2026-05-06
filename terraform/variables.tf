variable "aws_region" {
  description = "The AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "ssh_key_name" {
  description = "Name of the SSH keypair in AWS to allow login"
  type        = string
  default     = "moneymitra-deploy-key"
}
