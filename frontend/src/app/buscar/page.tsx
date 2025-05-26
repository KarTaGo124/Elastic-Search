"use client";

import { useState } from "react";
import Link from "next/link";
import { Producto, buscarProductos } from "@/lib/api";

export default function BuscarPage() {
	const [query, setQuery] = useState("");
	const [resultados, setResultados] = useState<Producto[]>([]);
	const [loading, setLoading] = useState(false);
	const [nextKey, setNextKey] = useState<string | null>(null);

	const handleBuscar = async () => {
		if (!query.trim()) return;
		setLoading(true);
		try {
			const { items, nextKey } = await buscarProductos(query);
			setResultados(items);
			setNextKey(nextKey);
		} catch (error) {
			console.error("Error al buscar productos:", error);
		} finally {
			setLoading(false);
		}
	};

	const cargarMas = async () => {
		if (!nextKey) return;
		setLoading(true);
		try {
			const { items, nextKey: newKey } = await buscarProductos(
				query,
				nextKey
			);
			setResultados((prev) => [...prev, ...items]);
			setNextKey(newKey);
		} catch (error) {
			console.error("Error cargando más resultados:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="min-h-screen p-6 bg-gray-50">
			<h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
				🔍 Buscar Productos
			</h1>

			<Link
				href="/"
				className="inline-block bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-900"
			>
				🏠 Volver al inicio
			</Link>

			<div className="max-w-2xl mx-auto flex gap-2 mb-8">
				<input
					type="text"
					placeholder="Buscar por nombre o descripción..."
					className="flex-1 border p-2 rounded"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
				/>
				<button
					onClick={handleBuscar}
					className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
				>
					Buscar
				</button>
			</div>

			{loading && (
				<p className="text-center text-gray-600">
					Buscando productos...
				</p>
			)}

			{!loading && resultados.length === 0 && (
				<p className="text-center text-gray-500">
					No se encontraron productos.
				</p>
			)}

			{resultados.length > 0 && (
				<>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{resultados.map((prod) => (
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
							</div>
						))}
					</div>

					{nextKey && (
						<div className="flex justify-center mt-6">
							<button
								onClick={cargarMas}
								className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
							>
								Cargar más
							</button>
						</div>
					)}
				</>
			)}
		</main>
	);
}
