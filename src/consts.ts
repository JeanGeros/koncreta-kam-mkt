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
