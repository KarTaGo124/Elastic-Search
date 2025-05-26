export interface Producto {
	product_id: string;
	nombre: string;
	descripcion: string;
	precio: number;
}

const BASE_URL = "https://rvmm46ysej.execute-api.us-east-1.amazonaws.com/dev";

export async function fetchProductos(
	limit = 10,
	startKey?: string
): Promise<{ items: Producto[]; nextKey: string | null }> {
	const url = new URL(`${BASE_URL}/producto`);
	url.searchParams.set("limit", limit.toString());
	if (startKey) url.searchParams.set("startKey", startKey);

	const res = await fetch(url.toString());
	console.log("Fetching products from:", url.toString());
	if (!res.ok) throw new Error("Error al obtener productos");

	const data = await res.json();

	if (!data.items || !Array.isArray(data.items)) {
		throw new Error("La respuesta del backend no contiene 'items'");
	}

	return {
		items: data.items,
		nextKey: data.nextKey || null,
	};
}

export async function buscarProductos(
	query: string,
	startKey?: string,
	limit = 10
): Promise<{ items: Producto[]; nextKey: string | null }> {
	const url = new URL(`${BASE_URL}/buscar`);
	url.searchParams.set("q", query);
	url.searchParams.set("limit", limit.toString());
	if (startKey) url.searchParams.set("startKey", startKey);

	const res = await fetch(url.toString());
	if (!res.ok) throw new Error("Error al buscar productos");

	const data = await res.json();
	return {
		items: data.items,
		nextKey: data.nextKey || null,
	};
}

export async function crearProducto(producto: Omit<Producto, "product_id">) {
	const res = await fetch(`${BASE_URL}/producto`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(producto),
	});
	if (!res.ok) throw new Error("Error al crear producto");
	return res.json();
}

export async function eliminarProducto(id: string): Promise<void> {
	const res = await fetch(`${BASE_URL}/producto/${id}`, {
		method: "DELETE",
	});
	if (!res.ok) throw new Error("Error al eliminar producto");
}
