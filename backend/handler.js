import AWS from "aws-sdk";

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "productos"; // Puedes cambiarlo si usas otra tabla

export async function crearProducto(event) {
  const producto = JSON.parse(event.body);

  const item = {
    product_id: producto.product_id,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: producto.precio,
  };

  await dynamodb.put({
    TableName: TABLE_NAME,
    Item: item
  }).promise();

  return {
    statusCode: 201,
    body: JSON.stringify({ mensaje: "Producto creado", producto: item }),
  };
}

export async function obtenerProductos() {
  const result = await dynamodb.scan({ TableName: TABLE_NAME }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result.Items),
  };
}

export async function buscarProducto(event) {
  const query = event.queryStringParameters?.q?.toLowerCase() || "";
  const result = await dynamodb.scan({ TableName: TABLE_NAME }).promise();

  const filtrados = (result.Items || []).filter(
    (item) =>
      item.nombre?.toLowerCase().includes(query) ||
      item.descripcion?.toLowerCase().includes(query)
  );

  return {
    statusCode: 200,
    body: JSON.stringify(filtrados),
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
    body: JSON.stringify({ mensaje: "Producto eliminado", id }),
  };
}
