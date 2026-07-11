const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
} = require('@aws-sdk/lib-dynamodb');
const config = require('../config');

const client = new DynamoDBClient({
  region: config.aws.region,
  ...(config.aws.dynamoEndpoint
    ? {
        // DynamoDB Local: endpoint + credenciales dummy (evita que el SDK
        // se cuelgue buscando credenciales reales). En AWS se omiten y el
        // SDK toma las credenciales del entorno/rol automáticamente.
        endpoint: config.aws.dynamoEndpoint,
        credentials: { accessKeyId: 'local', secretAccessKey: 'local' },
      }
    : {}),
});
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});
const TABLE = config.aws.dynamoTable;

// Busca una patente por su clave primaria
async function findByPlate(patente) {
  const { Item } = await docClient.send(
    new GetCommand({ TableName: TABLE, Key: { patente } })
  );
  return Item || null;
}

// Guarda (o sobrescribe) un registro de patente
async function save(record) {
  await docClient.send(new PutCommand({ TableName: TABLE, Item: record }));
  return record;
}

// Lista todas las patentes registradas (uso simple; para producción paginar)
async function listAll() {
  const { Items } = await docClient.send(new ScanCommand({ TableName: TABLE }));
  return Items || [];
}

module.exports = { findByPlate, save, listAll };
