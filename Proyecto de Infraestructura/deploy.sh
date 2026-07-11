#!/usr/bin/env bash
# deploy.sh — Despliegue completo a AWS con un solo comando (Linux / Mac / Git Bash)
#   Uso:  ./deploy.sh
#   Requiere: AWS CLI configurado, Terraform y Node instalados.
#   Despliega el frontend SIN login. Para incluir login: export VITE_REQUIRE_LOGIN=true antes de correr.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> 1/5  Dependencias del backend (para el zip de la Lambda)..."
cd "$ROOT/backend" && [ -d node_modules ] || npm install

echo "==> 2/5  Infraestructura (terraform apply)..."
cd "$ROOT/infra"
terraform init -input=false >/dev/null
terraform apply -auto-approve
API_URL=$(terraform output -raw frontend_api_url)
BUCKET=$(terraform output -raw web_bucket)
DIST=$(terraform output -raw cloudfront_distribution_id)
DOMAIN=$(terraform output -raw cloudfront_domain)

echo "==> 3/5  Construyendo el frontend..."
cd "$ROOT/frontend" && [ -d node_modules ] || npm install
VITE_API_URL="$API_URL" npm run build

echo "==> 4/5  Subiendo el sitio a S3..."
aws s3 sync dist/ "s3://$BUCKET" --delete

echo "==> 5/5  Invalidando la cache de CloudFront..."
aws cloudfront create-invalidation --distribution-id "$DIST" --paths "/*" >/dev/null

echo ""
echo "Despliegue completo."
echo "Tu sitio: https://$DOMAIN"
