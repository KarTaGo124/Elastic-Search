
import AWS from "aws-sdk";
import { faker } from "@faker-js/faker";
import chunk from "lodash.chunk";
import { Client } from "@elastic/elasticsearch";

AWS.config.update({ region: "us-east-1" });

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "productos";
const TOTAL_ITEMS = 10000;
const BATCH_SIZE = 25;
const ES_INDEX = "productos";

const esClient = new Client({
  node: "http://3.90.171.235:9200",
  headers: {
    'accept': 'application/vnd.elasticsearch+json; compatible-with=8',
    'content-type': 'application/json'
  }
});

function generarProducto() {
  const product = {
    product_id: faker.string.uuid(),
    nombre: faker.commerce.productName(),
    descripcion: faker.commerce.productDescription(),
    precio: Number(faker.commerce.price({ min: 10, max: 999, dec: 2 })),
  };

  return {
    dynamo: {
      PutRequest: { Item: product },
    },
    elastic: [
      { index: { _index: ES_INDEX, _id: product.product_id } },
      product,
    ],
  };
}

async function insertarEnDynamoBatch(items) {
  const params = {
    RequestItems: {
      [TABLE_NAME]: items.map((i) => i.dynamo),
    },
  };

  try {
    await dynamodb.batchWrite(params).promise();
    console.log(`✅ DynamoDB: Insertados ${items.length} productos.`);
  } catch (err) {
    console.error("❌ Error al insertar en DynamoDB:", err);
  }
}

async function insertarEnElasticBatch(items) {
  const body = items.flatMap((i) => i.elastic);

  try {
    const res = await esClient.bulk({ refresh: false, body });
    if (res.errors) {
      console.error("❌ Errores en bulk insert a Elasticsearch", res);
    } else {
      console.log(`✅ Elasticsearch: Insertados ${items.length} productos.`);
    }
  } catch (err) {
    console.error("❌ Error al insertar en Elasticsearch:", err);
  }
}

async function main() {
  console.log(`🚀 Generando ${TOTAL_ITEMS} productos...`);
  const productos = Array.from({ length: TOTAL_ITEMS }, generarProducto);
  const batches = chunk(productos, BATCH_SIZE);

  console.log(`📦 Insertando en ${batches.length} lotes de ${BATCH_SIZE}...
`);

  for (let i = 0; i < batches.length; i++) {
    console.log(`🔄 Lote ${i + 1}/${batches.length}`);
    await insertarEnDynamoBatch(batches[i]);
    await insertarEnElasticBatch(batches[i]);
    await new Promise((r) => setTimeout(r, 200));
  }

  await esClient.indices.refresh({ index: ES_INDEX });
  console.log("✅ Inserción completa y refresh de índice hecho");
}

main();
