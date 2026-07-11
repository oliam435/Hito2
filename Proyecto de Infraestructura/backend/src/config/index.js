// Configuración central leída desde variables de entorno
module.exports = {
  port: process.env.PORT || 3000,
  // Zona horaria para agrupar las estadísticas (horas, días, períodos).
  timezone: process.env.APP_TIMEZONE || 'America/Santiago',
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    dynamoTable: process.env.DYNAMODB_TABLE || 'patentes',
    dynamoEndpoint: process.env.DYNAMODB_ENDPOINT || undefined,
  },
  // API de Boostr (patentes Chile) — https://docs.boostr.cl/reference/car-plate
  boostr: {
    baseUrl: process.env.BOOSTR_BASE_URL || 'https://api.boostr.cl',
    apiKey: process.env.BOOSTR_API_KEY,
    include: process.env.BOOSTR_INCLUDE || 'owner', // info extra del dueño
  },
};
