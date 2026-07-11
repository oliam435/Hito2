locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

data "aws_caller_identity" "current" {}

# Empaqueta el backend (código + node_modules) en un zip para la Lambda.
# Requiere haber corrido `npm install` en backend/ antes del apply.
data "archive_file" "backend" {
  type        = "zip"
  source_dir  = "${path.root}/../backend"
  output_path = "${path.root}/backend.zip"
  excludes    = [".env", "scripts/create-table.js"]
}

# Tabla DynamoDB para las patentes
module "dynamodb" {
  source     = "./modules/dynamodb"
  table_name = "${local.name_prefix}-patentes"
}

# Función Lambda con el backend
module "lambda" {
  source             = "./modules/lambda"
  function_name      = "${local.name_prefix}-api"
  dynamodb_table_arn = module.dynamodb.table_arn
  dynamodb_table     = module.dynamodb.table_name
  lambda_zip         = data.archive_file.backend.output_path
  source_code_hash   = data.archive_file.backend.output_base64sha256
  boostr_api_key     = var.boostr_api_key
}

# API Gateway que expone la Lambda
module "apigateway" {
  source               = "./modules/apigateway"
  api_name             = "${local.name_prefix}-gateway"
  lambda_invoke_arn    = module.lambda.invoke_arn
  lambda_function_name = module.lambda.function_name
}

# Observabilidad: alarmas de CloudWatch + notificaciones por email (SNS)
module "monitoring" {
  source               = "./modules/monitoring"
  name_prefix          = local.name_prefix
  alert_email          = var.alert_email
  lambda_function_name = module.lambda.function_name
  api_id               = module.apigateway.api_id
  dynamodb_table       = module.dynamodb.table_name
}

# Control de costos (FinOps)
module "budget" {
  source         = "./modules/budget"
  name           = "${local.name_prefix}-budget"
  monthly_amount = var.monthly_budget_amount
  alert_email    = var.alert_email
  project_tag    = var.project_name
}

# Frontend: S3 + CloudFront para servir el React build
module "frontend" {
  source      = "./modules/frontend"
  bucket_name = "${local.name_prefix}-web-${data.aws_caller_identity.current.account_id}"
}
