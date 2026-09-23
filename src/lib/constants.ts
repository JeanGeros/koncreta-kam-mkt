// Transcritas de la planilla de Drive (columna CATEGORIA). Ordenadas por
// cantidad de proyectos: las de un solo item quedan al final del filtro.
export const PROJECT_CATEGORIES = [
	'Fundaciones',
	'Cámaras',
	'Cerco perimetral',
	'Otras piezas',
	'Canaletas',
	'Dados',
	'Fundaciones y Canaletas',
	'Tapas',
] as const;

export const BLOG_CATEGORIES = [
	{ value: 'industria', label: 'Industria & eventos' },
	{ value: 'innovacion', label: 'Innovación' },
	{ value: 'sostenibilidad', label: 'Sostenibilidad' },
	{ value: 'tecnologia', label: 'Tecnología' },
] as const;
