variable "function_name" { type = string }
variable "dynamodb_table_arn" { type = string }
variable "dynamodb_table" { type = string }
variable "lambda_zip" { type = string }
variable "source_code_hash" { type = string }
variable "boostr_api_key" {
  type      = string
  sensitive = true
}
variable "boostr_base_url" {
  type    = string
  default = "https://api.boostr.cl"
}
variable "boostr_include" {
  type    = string
  default = "owner"
}
variable "tags" {
  type    = map(string)
  default = {}
}

# Rol de ejecución de la Lambda
resource "aws_iam_role" "lambda_exec" {
  name = "${var.function_name}-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
  tags = var.tags
}

# Permisos básicos de logs (CloudWatch)
resource "aws_iam_role_policy_attachment" "logs" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Permisos mínimos sobre la tabla DynamoDB
resource "aws_iam_role_policy" "dynamo" {
  name = "${var.function_name}-dynamo"
  role = aws_iam_role.lambda_exec.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:Scan", "dynamodb:Query"]
      Resource = [var.dynamodb_table_arn]
    }]
  })
}

# Función Lambda con el backend real (zip construido por Terraform)
resource "aws_lambda_function" "api" {
  function_name    = var.function_name
  role             = aws_iam_role.lambda_exec.arn
  handler          = "lambda.handler"
  runtime          = "nodejs20.x"
  filename         = var.lambda_zip
  source_code_hash = var.source_code_hash
  timeout          = 15
  memory_size      = 256

  environment {
    variables = {
      DYNAMODB_TABLE  = var.dynamodb_table
      BOOSTR_API_KEY  = var.boostr_api_key
      BOOSTR_BASE_URL = var.boostr_base_url
      BOOSTR_INCLUDE  = var.boostr_include
    }
  }

  tags = var.tags
}

output "function_name" { value = aws_lambda_function.api.function_name }
output "invoke_arn" { value = aws_lambda_function.api.invoke_arn }
