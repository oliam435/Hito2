variable "name_prefix" { type = string }
variable "alert_email" { type = string }
variable "lambda_function_name" { type = string }
variable "api_id" { type = string }
variable "dynamodb_table" { type = string }

# --- Canal de notificación: SNS + suscripción por email ---
# Cuando una alarma se dispara, SNS envía un correo al responsable.
resource "aws_sns_topic" "alerts" {
  name = "${var.name_prefix}-alerts"
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# --- Alarma 1: errores en la Lambda ---
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "${var.name_prefix}-lambda-errores"
  alarm_description   = "La Lambda del backend está devolviendo errores."
  namespace           = "AWS/Lambda"
  metric_name         = "Errors"
  dimensions          = { FunctionName = var.lambda_function_name }
  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
}

# --- Alarma 2: latencia/duración alta de la Lambda ---
resource "aws_cloudwatch_metric_alarm" "lambda_duration" {
  alarm_name          = "${var.name_prefix}-lambda-duracion-alta"
  alarm_description   = "La Lambda tarda demasiado (posible problema con Boostr o DynamoDB)."
  namespace           = "AWS/Lambda"
  metric_name         = "Duration"
  dimensions          = { FunctionName = var.lambda_function_name }
  statistic           = "Average"
  period              = 300
  evaluation_periods  = 2
  threshold           = 10000 # 10 s (timeout de la Lambda es 15 s)
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}

# --- Alarma 3: errores 5xx en API Gateway ---
resource "aws_cloudwatch_metric_alarm" "api_5xx" {
  alarm_name          = "${var.name_prefix}-api-5xx"
  alarm_description   = "API Gateway está devolviendo errores 5xx a los usuarios."
  namespace           = "AWS/ApiGateway"
  metric_name         = "5xx"
  dimensions          = { ApiId = var.api_id }
  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}

# --- Alarma 4: throttling de lectura en DynamoDB ---
resource "aws_cloudwatch_metric_alarm" "dynamo_read_throttle" {
  alarm_name          = "${var.name_prefix}-dynamo-throttle-lectura"
  alarm_description   = "DynamoDB está limitando (throttling) las lecturas."
  namespace           = "AWS/DynamoDB"
  metric_name         = "ReadThrottleEvents"
  dimensions          = { TableName = var.dynamodb_table }
  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}

output "sns_topic_arn" { value = aws_sns_topic.alerts.arn }
