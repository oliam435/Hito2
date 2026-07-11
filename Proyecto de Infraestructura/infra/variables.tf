variable "aws_region" {
  description = "Región de AWS"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Prefijo para nombrar los recursos"
  type        = string
  default     = "patentes"
}

variable "environment" {
  description = "Entorno (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "owner" {
  description = "Responsable / equipo dueño de los recursos (tag de costos)"
  type        = string
  default     = "equipo-proyecto"
}

variable "alert_email" {
  description = "Email que recibe las alarmas de CloudWatch y las alertas de Budget"
  type        = string
  default     = "tu-email@ejemplo.com"
}

variable "monthly_budget_amount" {
  description = "Tope de gasto mensual en USD para el control de costos"
  type        = number
  default     = 10
}

variable "boostr_api_key" {
  description = "API key de Boostr (se inyecta como variable de entorno de la Lambda)"
  type        = string
  sensitive   = true
}
