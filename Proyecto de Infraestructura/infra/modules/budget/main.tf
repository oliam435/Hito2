variable "name" { type = string }
variable "monthly_amount" { type = number }
variable "alert_email" { type = string }
variable "project_tag" { type = string }

# Budget mensual filtrado por el tag del proyecto.
# Avisa por email al llegar al 80% (proyectado) y al 100% (real) del tope.
resource "aws_budgets_budget" "monthly" {
  name         = var.name
  budget_type  = "COST"
  limit_amount = tostring(var.monthly_amount)
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  # Solo cuenta el gasto etiquetado con este proyecto (FinOps por tags).
  # Formato requerido por AWS: "user:<TagKey>$<TagValue>".
  cost_filter {
    name   = "TagKeyValue"
    values = [format("user:Project$%s", var.project_tag)]
  }

  # Alerta temprana: 80% según la proyección del mes
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = [var.alert_email]
  }

  # Alerta dura: 100% del gasto real
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.alert_email]
  }
}

output "budget_name" { value = aws_budgets_budget.monthly.name }
