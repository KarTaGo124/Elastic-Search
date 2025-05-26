import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "productos";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*", // ✅ Para evitar errores de CORS
};

export async function crearProducto(event) {
  const producto = JSON.parse(event.body);

  const item = {
    product_id: uuidv4(),
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: producto.precio,
  };

  await dynamodb.put({
    TableName: TABLE_NAME,
    Item: item,
  }).promise();

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

export async function buscarProductos(event) {
  const query = event.queryStringParameters?.q?.toLowerCase() || "";
  const limit = Number(event.queryStringParameters?.limit) || 10;
  const startKey = event.queryStringParameters?.startKey
    ? JSON.parse(decodeURIComponent(event.queryStringParameters.startKey))
    : undefined;

  const scanParams = {
    TableName: TABLE_NAME,
    Limit: limit,
    ExclusiveStartKey: startKey,
  };

  const result = await dynamodb.scan(scanParams).promise();

  const filtrados = (result.Items || []).filter(
    (item) =>
      item.nombre?.toLowerCase().includes(query) ||
      item.descripcion?.toLowerCase().includes(query)
  );

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      items: filtrados,
      nextKey: result.LastEvaluatedKey
        ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey))
        : null,
    }),
  };
}

export async function eliminarProducto(event) {
  const { id } = event.pathParameters;

  await dynamodb.delete({
    TableName: TABLE_NAME,
    Key: { product_id: id },
  }).promise();

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ mensaje: "Producto eliminado", id }),
  };
}
