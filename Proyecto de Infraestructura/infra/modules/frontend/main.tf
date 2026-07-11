variable "bucket_name" { type = string }
variable "tags" {
  type    = map(string)
  default = {}
}

# --- Bucket S3 privado para el sitio estático (React build) ---
resource "aws_s3_bucket" "web" {
  bucket        = var.bucket_name
  force_destroy = true # permite 'terraform destroy' aunque tenga archivos
  tags          = var.tags
}

# El bucket no es público: solo CloudFront puede leerlo (vía OAC).
resource "aws_s3_bucket_public_access_block" "web" {
  bucket                  = aws_s3_bucket.web.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# --- CloudFront: CDN que sirve el sitio por HTTPS ---
resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "${var.bucket_name}-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "web" {
  enabled             = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100" # Norteamérica y Europa (más barato)
  comment             = var.bucket_name

  origin {
    domain_name              = aws_s3_bucket.web.bucket_regional_domain_name
    origin_id                = "s3-web"
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }

  default_cache_behavior {
    target_origin_id       = "s3-web"
    viewer_protocol_policy  = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    # Política administrada "CachingOptimized" de AWS
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  # SPA: cualquier ruta no encontrada devuelve index.html
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = var.tags
}

# Política del bucket: permite solo a esta distribución de CloudFront leer los objetos.
resource "aws_s3_bucket_policy" "web" {
  bucket = aws_s3_bucket.web.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "AllowCloudFrontRead"
      Effect    = "Allow"
      Principal = { Service = "cloudfront.amazonaws.com" }
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.web.arn}/*"
      Condition = {
        StringEquals = {
          "AWS:SourceArn" = aws_cloudfront_distribution.web.arn
        }
      }
    }]
  })
}

output "bucket_name" { value = aws_s3_bucket.web.bucket }
output "cloudfront_domain" { value = aws_cloudfront_distribution.web.domain_name }
output "distribution_id" { value = aws_cloudfront_distribution.web.id }
