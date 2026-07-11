// Crea la tabla `patentes` en DynamoDB (local o AWS según el endpoint).
// Uso: node scripts/create-table.js
require('dotenv').config();
const {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
} = require('@aws-sdk/client-dynamodb');
const { NodeHttpHandler } = require('@smithy/node-http-handler');
const http = require('http');

const TABLE = process.env.DYNAMODB_TABLE || 'patentes';
const endpoint = process.env.DYNAMODB_ENDPOINT || undefined;

console.log(`[1/4] Endpoint: ${endpoint || 'AWS (sin endpoint local)'} | Tabla: ${TABLE}`);

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  maxAttempts: 1, // sin reintentos: si falla, falla rápido (no se cuelga)
  // Timeouts cortos para no quedar esperando indefinidamente
  requestHandler: new NodeHttpHandler({
    // keepAlive:false evita el cuelgue de DynamoDB Local en Windows
    httpAgent: new http.Agent({ keepAlive: false }),
    connectionTimeout: 3000,
    requestTimeout: 8000,
  }),
  ...(endpoint
    ? {
        endpoint,
        credentials: { accessKeyId: 'local', secretAccessKey: 'local' },
      }
    : {}),
});

async function main() {
  console.log('[2/4] Verificando si la tabla ya existe...');
  try {
    await client.send(new DescribeTableCommand({ TableName: TABLE }));
    console.log(`[OK] La tabla "${TABLE}" ya existe. Nada que hacer.`);
    return;
  } catch (err) {
    if (err.name !== 'ResourceNotFoundException') throw err;
    console.log('[3/4] No existe. Creándola...');
  }

  await client.send(
    new CreateTableCommand({
      TableName: TABLE,
      BillingMode: 'PAY_PER_REQUEST',
      KeySchema: [{ AttributeName: 'patente', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'patente', AttributeType: 'S' }],
    })
  );
  console.log(`[4/4] Tabla "${TABLE}" creada en ${endpoint || 'AWS'}.`);
}

main()
  .then(() => process.exit(0)) // cierre explícito (evita cuelgue por sockets keep-alive)
  .catch((e) => {
    console.error('Error creando la tabla:', e.name, '-', e.message);
    process.exit(1);
  });
