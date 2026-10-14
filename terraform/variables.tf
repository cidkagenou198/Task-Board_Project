variable "aws_region" {
  description = "AWS deployment region"
  type        = string
  default     = "ap-south-1"
}

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "taskboard-eks"
}

variable "environment" {
  description = "Environment tier"
  type        = string
  default     = "dev"
}
