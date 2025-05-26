"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
	Producto,
	buscarProductosFlexible,
	autocompletarProductos,
} from "@/lib/api";

export default function BuscarPage() {
	const [query, setQuery] = useState("");
	const [sugerencias, setSugerencias] = useState<string[]>([]);
	const [resultados, setResultados] = useState<Producto[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const delayDebounce = setTimeout(() => {
			if (query.trim().length > 1) {
				autocompletarProductos(query)
					.then((s) => setSugerencias(s))
					.catch(() => setSugerencias([]));
			} else {
				setSugerencias([]);
			}
		}, 300);

		return () => clearTimeout(delayDebounce);
	}, [query]);

	const handleBuscar = async (texto: string = query) => {
		if (!texto.trim()) return;
		setLoading(true);
		try {
			const productos = await buscarProductosFlexible(texto);
			setResultados(productos);
		} catch (error) {
			console.error("Error al buscar productos:", error);
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

			<div className="max-w-2xl mx-auto mb-8 relative">
				<div className="flex gap-2">
					<input
						type="text"
						placeholder="Buscar por nombre o descripción..."
						className="flex-1 border p-2 rounded"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
					/>
					<button
						onClick={() => handleBuscar()}
						className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
					>
						Buscar
					</button>
				</div>
				{query.length > 1 && sugerencias.length > 0 && (
					<ul className="absolute bg-white shadow-md rounded mt-1 w-full z-10 max-h-40 overflow-y-auto border">
						{sugerencias.map((s, idx) => (
							<li
								key={idx}
								onClick={() => {
									setQuery(s);
									handleBuscar(s);
									setSugerencias([]);
								}}
								className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
							>
								{s}
							</li>
						))}
					</ul>
				)}
			</div>

			{loading && (
				<p className="text-center text-gray-600">
					Buscando productos...
				</p>
			)}

			{!loading && resultados.length === 0 && query && (
				<p className="text-center text-gray-500">
					No se encontraron productos.
				</p>
			)}

			{resultados.length > 0 && (
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
			)}
		</main>
	);
}
