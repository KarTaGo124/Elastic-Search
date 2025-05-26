"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
	Producto,
	fetchProductos,
	crearProducto,
	eliminarProducto,
} from "../lib/api";

export default function HomePage() {
	const [productos, setProductos] = useState<Producto[]>([]);
	const [nextKey, setNextKey] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [form, setForm] = useState<Omit<Producto, "product_id">>({
		nombre: "",
		descripcion: "",
		precio: 0,
	});

	useEffect(() => {
		cargarProductos();
	}, []);

	const cargarProductos = async (append = false) => {
		try {
			const { items, nextKey: newNextKey } = await fetchProductos(
				6,
				append ? nextKey || undefined : undefined
			);
			setProductos((prev) => (append ? [...prev, ...items] : items));
			setNextKey(newNextKey);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await crearProducto(form);
			setForm({ nombre: "", descripcion: "", precio: 0 });
			await cargarProductos(); // reinicia
		} catch (error) {
			console.error(error);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await eliminarProducto(id);
			await cargarProductos();
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<main className="min-h-screen p-6 bg-gray-50">
			<h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
				🛒 Gestión de Productos
			</h1>

			<div className="text-center mb-6">
				<Link
					href="/buscar"
					className="inline-block bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-900"
				>
					🔍 Ir al buscador
				</Link>
			</div>

			<form
				onSubmit={handleSubmit}
				className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md mb-10"
			>
				<h2 className="text-xl font-semibold mb-4">
					Agregar nuevo producto
				</h2>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<input
						type="text"
						placeholder="Nombre"
						className="border p-2 rounded"
						value={form.nombre}
						onChange={(e) =>
							setForm({ ...form, nombre: e.target.value })
						}
						required
					/>
					<input
						type="number"
						placeholder="Precio"
						className="border p-2 rounded"
						value={form.precio}
						onChange={(e) =>
							setForm({ ...form, precio: Number(e.target.value) })
						}
						required
					/>
					<input
						type="text"
						placeholder="Descripción"
						className="border p-2 rounded col-span-full"
						value={form.descripcion}
						onChange={(e) =>
							setForm({ ...form, descripcion: e.target.value })
						}
						required
					/>
				</div>

				<button
					type="submit"
					className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
				>
					Crear Producto
				</button>
			</form>

			{loading ? (
				<p className="text-center text-gray-600">
					Cargando productos...
				</p>
			) : productos.length === 0 ? (
				<p className="text-center text-gray-500">
					No hay productos disponibles.
				</p>
			) : (
				<div className="flex flex-col items-center gap-6">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
						{productos.map((prod) => (
							<div
								key={prod.product_id}
								className="bg-white border shadow-sm rounded-xl p-4 hover:shadow-md transition"
							>
								<h2 className="text-lg font-semibold text-gray-900">
									{prod.nombre}
								</h2>
								<p className="text-sm text-gray-700 mb-2">
									{prod.descripcion}
								</p>
								<p className="font-bold text-blue-600">
									S/. {prod.precio}
								</p>
								<p className="text-xs text-gray-400">
									ID: {prod.product_id}
								</p>
								<button
									onClick={() =>
										handleDelete(prod.product_id)
									}
									className="mt-2 text-sm text-red-600 hover:underline"
								>
									Eliminar
								</button>
							</div>
						))}
					</div>

					{nextKey && (
						<button
							onClick={() => cargarProductos(true)}
							className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
						>
							Cargar más
						</button>
					)}
				</div>
			)}
		</main>
	);
}
