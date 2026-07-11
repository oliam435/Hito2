# destroy.ps1 — Elimina TODOS los recursos de AWS (limpieza / cleanup)
#   Uso:  .\destroy.ps1
#   Úsalo al terminar para no generar costos. Para volver: .\deploy.ps1

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host "==> Destruyendo la infraestructura en AWS..." -ForegroundColor Yellow
Push-Location "$root\infra"
terraform destroy -auto-approve
Pop-Location

Write-Host ""
Write-Host "Recursos eliminados. Ya no se generan costos." -ForegroundColor Green
