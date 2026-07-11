variable "table_name" { type = string }
variable "tags" {
  type    = map(string)
  default = {}
}

resource "aws_dynamodb_table" "patentes" {
  name         = var.table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "patente"

  attribute {
    name = "patente"
    type = "S"
  }

  tags = var.tags
}

output "table_name" { value = aws_dynamodb_table.patentes.name }
output "table_arn" { value = aws_dynamodb_table.patentes.arn }
