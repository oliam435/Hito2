# Arquitectura

## Flujo de una consulta

```
Usuario (React)
   │  GET /api/patentes/:patente
   ▼
API Gateway ──► Lambda (Express) ──► ¿está en DynamoDB?
                                        │
                          ┌─────────────┴─────────────┐
                         sí                            no
                          │                             │
                  devuelve (source:db)        consulta API externa
                                                        │
                                              guarda en DynamoDB
                                                        │
                                              devuelve (source:api)
```

## Capas del backend

- **routes/** define los endpoints.
- **controllers/** validan/normalizan la entrada y arman la respuesta.
- **services/** contienen la lógica de negocio (DB-first, fallback API).
- **repositories/** acceso a DynamoDB.
- **utils/middlewares** logging y manejo de errores.

## Modelo de datos (DynamoDB)

Tabla `patentes`, clave primaria `patente` (string, normalizada en mayúsculas).

| Campo       | Tipo   | Descripción                        |
|-------------|--------|------------------------------------|
| patente     | string | Clave primaria                     |
| marca       | string | Marca del auto                     |
| modelo      | string | Modelo del auto                    |
| color       | string | Color del auto                     |
| horaEntrada | string | ISO timestamp de la 1ª entrada     |
| raw         | map    | Respuesta cruda de la API externa  |

## Despliegue de la Lambda

El módulo `infra/modules/lambda` crea la función con un `placeholder.zip`. El código real
se empaqueta desde `backend/` (incluyendo un `lambda.js` con el handler que envuelve Express,
p. ej. con `serverless-http`) y se sube vía pipeline de CI/CD. El `lifecycle.ignore_changes`
evita que Terraform sobrescriba ese código en cada `apply`.

## Futuro: detección con cámara + IA

La carpeta `ai/` queda reservada para el módulo de visión por computadora que detectará
patentes desde una cámara y llamará al mismo endpoint del backend. No forma parte de esta fase.
