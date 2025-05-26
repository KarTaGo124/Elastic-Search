// data/generateData.js

import AWS from "aws-sdk";
import { faker } from "@faker-js/faker";
import chunk from "lodash.chunk";

AWS.config.update({ region: "us-east-1" });

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "productos";
const TOTAL_ITEMS = 10000;

function generarProducto() {
  return {
    PutRequest: {
      Item: {
        product_id: faker.string.uuid(),
        nombre: faker.commerce.productName(),
        descripcion: faker.commerce.productDescription(),
        precio: Number(faker.commerce.price({ min: 10, max: 999, dec: 2 })),
      },
    },
  };
}

async function insertarEnBatch(items) {
  const params = {
    RequestItems: {
      [TABLE_NAME]: items,
    },
  };

  try {
    await dynamodb.batchWrite(params).promise();
    console.log(`✅ Insertados ${items.length} productos.`);
  } catch (err) {
    console.error("❌ Error al insertar batch:", err);
  }
}

async function main() {
  console.log(`Generando ${TOTAL_ITEMS} productos...`);
  const productos = Array.from({ length: TOTAL_ITEMS }, generarProducto);
  const batches = chunk(productos, 25); // DynamoDB solo acepta 25 por batchWrite

  console.log(`Insertando en ${batches.length} lotes de 25...`);
  for (let i = 0; i < batches.length; i++) {
    await insertarEnBatch(batches[i]);
  }
  console.log("✅ Inserción completa");
}

main();
