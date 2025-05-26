import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { Client } from "@elastic/elasticsearch";

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "productos";

const elasticClient = new Client({
  node: "http://3.90.171.235:9200",
  headers: {
    accept: "application/vnd.elasticsearch+json; compatible-with=8",
    "content-type": "application/vnd.elasticsearch+json; compatible-with=8",
  },
});

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

export async function crearProducto(event) {
  const producto = JSON.parse(event.body);
  const item = {
    product_id: uuidv4(),
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: producto.precio,
  };

  await dynamodb.put({ TableName: TABLE_NAME, Item: item }).promise();

  await elasticClient.index({
    index: "productos",
    id: item.product_id,
    document: item,
  });

  return {
    statusCode: 201,
    headers: corsHeaders,
    body: JSON.stringify({ mensaje: "Producto creado", producto: item }),
  };
}

export async function obtenerProductos(event) {
  const queryParams = event?.queryStringParameters || {};
  const limit = Number(queryParams.limit) || 10;
  const startKey = queryParams.startKey
    ? JSON.parse(decodeURIComponent(queryParams.startKey))
    : undefined;

  const params = {
    TableName: TABLE_NAME,
    Limit: limit,
    ExclusiveStartKey: startKey,
  };

  const result = await dynamodb.scan(params).promise();

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      items: result.Items,
      nextKey: result.LastEvaluatedKey
        ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey))
        : null,
    }),
  };
}

export async function buscarProductosFlexible(event) {
  const query = event.queryStringParameters?.q?.toLowerCase() || "";

  const { hits } = await elasticClient.search({
    index: "productos",
    size: 10,
    query: {
      bool: {
        should: [
          { match_phrase: { nombre: query } },
          { match_phrase: { descripcion: query } },
          { fuzzy: { nombre: { value: query, fuzziness: "AUTO" } } },
          { prefix: { nombre: query } },
        ],
      },
    },
  });

  const productos = hits.hits.map((hit) => ({
    product_id: hit._id,
    ...hit._source,
  }));

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify(productos),
  };
}

export async function eliminarProducto(event) {
  const { id } = event.pathParameters;

  await dynamodb.delete({
    TableName: TABLE_NAME,
    Key: { product_id: id },
  }).promise();

  await elasticClient.delete({
    index: "productos",
    id,
  }).catch((err) => {
    console.warn("⚠️ No se encontró en Elasticsearch:", err.meta?.body?.error);
  });

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ mensaje: "Producto eliminado", id }),
  };
}

export async function autocompletar(event) {
  const texto = event.queryStringParameters?.q || "";

  const { hits } = await elasticClient.search({
    index: "productos",
    size: 5,
    query: {
      match_phrase_prefix: {
        nombre: texto,
      },
    },
  });

  const sugerencias = hits.hits.map((hit) => hit._source.nombre);
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify(sugerencias),
  };
}
