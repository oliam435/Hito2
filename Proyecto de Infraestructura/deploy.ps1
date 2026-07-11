# deploy.ps1 — Despliegue completo a AWS con un solo comando (Windows / PowerShell)
#   Uso:  .\deploy.ps1
#   Requiere: AWS CLI configurado, Terraform y Node instalados.
#   Despliega el frontend SIN login. Para incluir login: $env:VITE_REQUIRE_LOGIN="true" antes de correr.

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host "==> 1/5  Dependencias del backend (para el zip de la Lambda)..." -ForegroundColor Cyan
Push-Location "$root\backend"
if (-not (Test-Path node_modules)) { npm install }
Pop-Location

Write-Host "==> 2/5  Infraestructura (terraform apply)..." -ForegroundColor Cyan
Push-Location "$root\infra"
terraform init -input=false | Out-Null
terraform apply -auto-approve
$apiUrl = (terraform output -raw frontend_api_url)
$bucket = (terraform output -raw web_bucket)
$distId = (terraform output -raw cloudfront_distribution_id)
$domain = (terraform output -raw cloudfront_domain)
Pop-Location

Write-Host "==> 3/5  Construyendo el frontend..." -ForegroundColor Cyan
Push-Location "$root\frontend"
if (-not (Test-Path node_modules)) { npm install }
if (-not $env:VITE_REQUIRE_LOGIN) { Remove-Item Env:\VITE_REQUIRE_LOGIN -ErrorAction SilentlyContinue }
$env:VITE_API_URL = $apiUrl
npm run build

Write-Host "==> 4/5  Subiendo el sitio a S3..." -ForegroundColor Cyan
aws s3 sync dist/ "s3://$bucket" --delete

Write-Host "==> 5/5  Invalidando la cache de CloudFront..." -ForegroundColor Cyan
aws cloudfront create-invalidation --distribution-id $distId --paths "/*" | Out-Null
Pop-Location

Write-Host ""
Write-Host "Despliegue completo." -ForegroundColor Green
Write-Host "Tu sitio: https://$domain" -ForegroundColor Green
Write-Host "(La invalidacion de CloudFront puede tardar 1-2 minutos en propagar.)"
