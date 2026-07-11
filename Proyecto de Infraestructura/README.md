# Proyecto de Infraestructura — Registro de Patentes

Sistema para registrar patentes de vehículos y consultar su detalle (hora de entrada, color, marca, modelo, etc.). Funciona sobre AWS y está pensado para, más adelante, incorporar detección automática con cámara + IA.

## Lógica principal

Cuando se consulta una patente:

1. Se busca primero en la base de datos (DynamoDB).
2. Si ya está registrada → se devuelve desde la base (`source: "db"`).
3. Si no está → se consulta la API externa, se guarda el resultado en la base y se devuelve (`source: "api"`).

Así, si el auto vuelve, no se vuelve a consultar la API.

## Stack

- **Backend:** Node.js + Express
- **API externa:** [Boostr](https://docs.boostr.cl/reference/car-plate) (patentes Chile)
- **Base de datos:** AWS DynamoDB
- **Infraestructura:** Terraform (Lambda + API Gateway + DynamoDB)
- **Frontend:** React (Vite)

## Estructura

```
.
├── backend/    API Express (routes → controllers → services → repositories)
├── frontend/   App React para ingresar patente y ver el detalle
├── infra/      Terraform (módulos: dynamodb, lambda, apigateway)
├── ai/         (futuro) detección con cámara + IA
└── docs/       documentación de arquitectura
```

## Cómo correr en local

### Backend
```bash
cd backend
cp .env.example .env   # completar valores
npm install
npm run dev            # http://localhost:3000
```

### Frontend
```bash
cd frontend
npm install
npm run dev            # http://localhost:5173 (proxy /api → backend)
```

### Infraestructura
```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
```

## Roadmap

- [x] Organización de carpetas y scaffolding
- [x] Integración con la API de Boostr (patentes Chile)
- [ ] Cargar la API KEY de Boostr y probar end-to-end
- [ ] Desplegar backend como Lambda
- [ ] Pantalla de historial de entradas
- [ ] (Futuro) Detección con cámara + IA
