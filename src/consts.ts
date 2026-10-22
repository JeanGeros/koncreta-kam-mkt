export const SITE_TITLE = 'Koncreta Prefabricados';
export const SITE_DESCRIPTION =
	'Fabricamos soluciones de hormigón 100% a la medida. Plantas en Antofagasta y Pozo Almonte.';

export const ORGANIZACION = {
	nombre: 'Koncreta Prefabricados',
	url: 'https://www.koncretaprefabricados.cl',
	descripcion: SITE_DESCRIPTION,
	telefono: '+56983984326',
	direccion: {
		calle: 'Segunda Avenida 1351',
		comuna: 'San Miguel',
		region: 'RM',
		codigoPostal: '7810340',
	},
	plantas: ['Antofagasta', 'Pozo Almonte'],
} as const;

// ponytail: la CDN de Vercel sirve estas páginas hasta 5 min sin invocar la función;
// los cambios del admin tardan hasta 5 min en verse. Bajar s-maxage si molesta.
export const CDN_CACHE = 'public, s-maxage=300, stale-while-revalidate=86400';
