output "dynamodb_table_name" {
  description = "Nombre de la tabla DynamoDB"
  value       = module.dynamodb.table_name
}

output "api_endpoint" {
  description = "URL pública de la API (API Gateway)"
  value       = module.apigateway.api_endpoint
}

output "frontend_api_url" {
  description = "Valor exacto para VITE_API_URL al construir el frontend"
  value       = "${trimsuffix(module.apigateway.api_endpoint, "/")}/api"
}

output "lambda_function_name" {
  description = "Nombre de la función Lambda"
  value       = module.lambda.function_name
}

output "alerts_sns_topic_arn" {
  description = "Tópico SNS que recibe las alarmas de CloudWatch"
  value       = module.monitoring.sns_topic_arn
}

output "budget_name" {
  description = "Nombre del Budget de control de costos"
  value       = module.budget.budget_name
}

output "web_bucket" {
  description = "Bucket S3 donde se sube el frontend"
  value       = module.frontend.bucket_name
}

output "cloudfront_domain" {
  description = "Dominio público del sitio (CloudFront)"
  value       = module.frontend.cloudfront_domain
}

output "cloudfront_distribution_id" {
  description = "ID de la distribución CloudFront (para invalidar caché)"
  value       = module.frontend.distribution_id
}
