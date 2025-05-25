const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  DeleteCommand
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "us-east-1" });
const ddb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "productos";

module.exports.crearProducto = async (event) => {
  const producto = JSON.parse(event.body);
  const item = {
    product_id: producto.product_id,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: producto.precio,
  };

  await ddb.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: item,
  }));

  return {
    statusCode: 201,
    body: JSON.stringify({ mensaje: "Producto creado", producto: item }),
  };
};

module.exports.obtenerProductos = async () => {
  const result = await ddb.send(new ScanCommand({ TableName: TABLE_NAME }));

  return {
    statusCode: 200,
    body: JSON.stringify(result.Items),
  };
};

module.exports.buscarProducto = async (event) => {
  const query = event.queryStringParameters?.q?.toLowerCase() || "";
  const result = await ddb.send(new ScanCommand({ TableName: TABLE_NAME }));

  const filtrados = (result.Items || []).filter(
    (item) =>
      item.nombre?.toLowerCase().includes(query) ||
      item.descripcion?.toLowerCase().includes(query)
  );

  return {
    statusCode: 200,
    body: JSON.stringify(filtrados),
  };
};

module.exports.eliminarProducto = async (event) => {
  const { id } = event.pathParameters;

  await ddb.send(new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { product_id: id },
  }));

  return {
    statusCode: 200,
    body: JSON.stringify({ mensaje: "Producto eliminado", id }),
  };
};
