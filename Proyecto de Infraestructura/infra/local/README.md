# Entorno local con DynamoDB Local

Levanta una base DynamoDB en tu máquina (vía Docker) para probar el backend sin tocar AWS.

## 1. Levantar DynamoDB Local

Desde esta carpeta (`infra/local`):

```bash
docker compose up -d
```

Esto inicia dos contenedores:

- **dynamodb-local** → la base, en `http://localhost:8000`
- **dynamodb-admin** → UI web para ver las tablas, en `http://localhost:8001`

Para detenerlo: `docker compose down` (agregá `-v` para borrar también los datos).

## 2. Configurar el backend

En la carpeta `backend`, copiá el ejemplo de variables y dejá el endpoint local:

```bash
cd ../../backend
cp .env.example .env
```

En `.env`, asegurate de tener:

```
DYNAMODB_ENDPOINT=http://127.0.0.1:8000
DYNAMODB_TABLE=patentes
```

> En Windows usá `127.0.0.1` y **no** `localhost`: este último puede resolver a
> IPv6 (`::1`) y dejar el script colgado al conectar con DynamoDB Local.

(La `BOOSTR_API_KEY` la completás cuando te llegue; sin ella el backend usa datos mock.)

## 3. Crear la tabla

```bash
npm install
npm run create-table
```

Deberías ver: `Tabla "patentes" creada en http://localhost:8000`.

## 4. Probar el flujo

```bash
npm run dev
```

En otra terminal:

```bash
# Primera vez: no está en DB -> consulta la API (o mock) y guarda
curl http://localhost:3000/api/patentes/GPDD74

# Segunda vez: ya está -> sale de la base ("source":"db")
curl http://localhost:3000/api/patentes/GPDD74

# Historial completo
curl http://localhost:3000/api/patentes
```

Fijate en el campo `"source"`: `"api"` la primera vez, `"db"` la segunda.
También podés abrir `http://localhost:8001` para ver el registro guardado en la tabla.
