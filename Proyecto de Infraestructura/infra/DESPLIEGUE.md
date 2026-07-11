# Guía de despliegue en AWS (Hito 2)

Despliega todo el sistema en la nube: backend (Lambda + API Gateway + DynamoDB),
observabilidad (CloudWatch + SNS), costos (Budget) y frontend (S3 + CloudFront).

> Los comandos están en PowerShell (Windows). Ejecutá cada bloque en orden.

## Requisitos previos

- AWS CLI configurado. Verificalo:
  ```powershell
  aws sts get-caller-identity
  ```
  Debe mostrar tu cuenta. Si no, corré `aws configure`.
- Terraform y Node instalados.

## Paso 1 — Instalar dependencias del backend

El zip de la Lambda incluye `node_modules`, así que hay que instalarlas antes:

```powershell
cd backend
npm install
cd ..
```

## Paso 2 — Configurar variables de Terraform

```powershell
cd infra
copy terraform.tfvars.example terraform.tfvars
notepad terraform.tfvars
```

Completá en `terraform.tfvars`:
- `alert_email` — tu correo (recibe alarmas y avisos de Budget).
- `owner` — tu equipo.
- `boostr_api_key` — la misma key de `backend/.env`.

## Paso 3 — Desplegar la infraestructura

```powershell
terraform init
terraform apply
```

Revisá el plan y confirmá con `yes`. Crea DynamoDB, la Lambda con tu backend,
API Gateway, las alarmas, el Budget, el bucket S3 y la distribución CloudFront.
CloudFront tarda unos **5–15 minutos** en quedar disponible.

Al terminar, Terraform muestra los *outputs*. Los vas a usar abajo.

## Paso 4 — Confirmar el email de las alarmas

Vas a recibir un correo de AWS (asunto "AWS Notification - Subscription Confirmation").
Hacé clic en el enlace para activar las notificaciones por email.

## Paso 5 — Probar la API

```powershell
$api = terraform output -raw api_endpoint
curl "$api/health"
```

Debe responder `{"status":"ok"}`. Probá una patente real:

```powershell
curl "$api/api/patentes/GPDD74"
```

## Paso 6 — Construir y subir el frontend

```powershell
cd ../frontend

# Apunta el frontend a la API real (output de Terraform)
$env:VITE_API_URL = (terraform -chdir=../infra output -raw frontend_api_url)

npm install
npm run build

# Subir el build al bucket
$bucket = terraform -chdir=../infra output -raw web_bucket
aws s3 sync dist/ "s3://$bucket" --delete

# Invalidar la caché de CloudFront para ver los cambios al instante
$dist = terraform -chdir=../infra output -raw cloudfront_distribution_id
aws cloudfront create-invalidation --distribution-id $dist --paths "/*"
```

## Paso 7 — Abrir el sitio

```powershell
terraform -chdir=../infra output -raw cloudfront_domain
```

Abrí `https://<ese-dominio>` en el navegador. ¡Tu sistema está en la nube!

---

## Actualizar después

- **Cambios en el backend:** `terraform apply` en `infra/` (reconstruye el zip y actualiza la Lambda).
- **Cambios en el frontend:** repetí el Paso 6 (build → s3 sync → invalidación).

## Apagar todo (evitar costos)

```powershell
cd infra
terraform destroy
```

Elimina todos los recursos. El bucket tiene `force_destroy`, así que se borra aunque tenga archivos.

---

## Notas

- La Lambda usa la **tabla DynamoDB real** (no la local). El flujo DB-first sigue igual.
- La `boostr_api_key` viaja como variable de entorno de la Lambda; `terraform.tfvars` está en `.gitignore`.
- Las horas quedan en **UTC** en la nube. Si querés hora de Chile, se ajusta en el backend.
- Plan de Boostr: **100 consultas de patente por día**; las repetidas salen de DynamoDB y no gastan cuota.
