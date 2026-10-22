// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import icon from 'astro-icon';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://www.koncretaprefabricados.cl',
	output: 'server',
	adapter: vercel(),
	security: {
		actionBodySizeLimit: 35 * 1024 * 1024,
	},
	redirects: {
		'/prefabricados': { status: 301, destination: '/servicios' },
		'/about-2': { status: 301, destination: '/proyectos' },
		// URLs del WordPress antiguo: Vercel las redirige en el borde, sin invocar la función.
		'/post/novedades-tecnologicas-en-prefabricados-de-hormigon-tendencias-para-2025': { status: 301, destination: '/blog/tendencias-2025-2026-en-prefabricados-de-hormigon-bim-automatizacion-y-materiales-inteligentes' },
		'/post/reflexiones-del-1-congreso-nacional-de-cemento-y-hormigon-sostenibilidad-innovacion-y-productivid': { status: 301, destination: '/blog/reflexiones-del-1-congreso-nacional-de-cemento-y-hormigon-sostenibilidad-innovacion-y-productividad-como-eje-del-futuro' },
		'/post/transporte-eficiente-de-piezas-prefabricadas-como-lo-hacemos-en-koncreta': { status: 301, destination: '/blog/transporte-eficiente-de-piezas-prefabricadas-como-lo-hacemos-en-koncreta' },
		'/post/hormigon-prefabricado-para-acelerar-tiempos-de-construccion-ahorra-tiempo-y-costos': { status: 301, destination: '/blog/hormigon-prefabricado-como-reducir-hasta-un-40-los-tiempos-de-obra-en-chile' },
		'/post/como-puedes-mejorar-el-valor-de-tu-prefabricado-mas-alla-de-la-resistencia-optimizacion-y-eficienc': { status: 301, destination: '/blog/como-aumentar-el-valor-de-tus-prefabricados-de-hormigon-mas-alla-de-la-resistencia' },
		'/post/por-que-los-prefabricados-de-hormigon-son-clave-en-la-construccion-moderna': { status: 301, destination: '/blog/por-que-el-hormigon-prefabricado-es-clave-en-la-infraestructura-moderna-de-chile' },
		'/post/factores-clave-en-el-diseno-y-fabricacion-de-prefabricados-de-hormigon': { status: 301, destination: '/blog/factores-clave-en-el-diseno-y-fabricacion-de-prefabricados-de-hormigon' },
		'/post/koncreta-y-la-nueva-era-del-hormigon-prefabricado': { status: 301, destination: '/blog/koncreta-y-la-nueva-era-del-hormigon-prefabricado' },
		'/post/la-evolucion-del-hormigon-prefabricado-tendencias-para-el-futuro': { status: 301, destination: '/blog/evolucion-del-hormigon-prefabricado-historia-estado-actual-y-tendencias-futuras' },
		'/post/innovacion-en-hormigon-prefabricado-conoce-las-ultimas-tendencias-con-koncreta': { status: 301, destination: '/blog/innovacion-en-hormigon-prefabricado-conoce-las-ultimas-tendencias-con-koncreta' },
		'/post/beneficios-y-aplicaciones-de-los-prefabricados-de-hormigon-descubre-como-optimizar-tus-proyectos-c': { status: 301, destination: '/blog/prefabricados-de-hormigon-beneficios-tipos-y-aplicaciones-en-proyectos-de-chile' },
		'/post/arquitectura-y-urbanismo-la-evolucion-del-prefabricado-en-la-construccion-moderna': { status: 301, destination: '/blog/arquitectura-y-urbanismo-la-evolucion-del-prefabricado-en-la-construccion-moderna' },
		'/post/sostenibilidad-en-la-construccion-prefabricados-de-hormigon-como-clave-para-reducir-la-huella-de-ca': { status: 301, destination: '/blog/prefabricados-de-hormigon-y-huella-de-carbono-cuanto-co-se-ahorra-vs-construccion-tradicional' },
		'/post/el-impacto-del-hormigon-prefabricado-en-la-eficiencia-de-la-construccion': { status: 301, destination: '/blog/hormigon-prefabricado-su-impacto-real-en-la-eficiencia-y-costos-de-construccion' },
		'/post/recomendaciones-tecnicas-para-maximizar-la-eficiencia-en-proyectos-con-prefabricados-de-hormigon': { status: 301, destination: '/blog/recomendaciones-tecnicas-para-maximizar-la-eficiencia-en-proyectos-con-prefabricados-de-hormigon' },
		'/post/reutilizando-tubos-cilindricos-koncreta-transforma-restos-de-hormigon-prefabricado-en-piezas-sosten': { status: 301, destination: '/blog/economia-circular-en-hormigon-koncreta-reutiliza-tubos-para-crear-piezas-sostenibles' },
		'/post/hormigon-prefabricado-o-construccion-tradicional-cual-es-mas-rentable': { status: 301, destination: '/blog/hormigon-prefabricado-o-construccion-tradicional-cual-es-mas-rentable' },
		'/post/transformacion-digital-en-la-construccion-el-futuro-del-hormigon-prefabricado': { status: 301, destination: '/blog/transformacion-digital-en-la-construccion-el-futuro-del-hormigon-prefabricado' },
		'/post/por-que-las-constructoras-lideres-estan-apostando-por-los-prefabricados-de-hormigon-el-uso-de-hormi': { status: 301, destination: '/blog/por-que-las-constructoras-lideres-de-chile-eligen-el-hormigon-prefabricado' },
		'/post/maquinarias-y-equipos-que-optimizan-la-produccion-y-montaje-de-prefabricados-de-hormigon': { status: 301, destination: '/blog/maquinaria-para-prefabricados-de-hormigon-equipos-que-optimizan-produccion-y-montaje' },
		'/post/como-la-prefabricacion-aumenta-la-sostenibilidad-en-proyectos-de-infraestructura': { status: 301, destination: '/blog/como-la-prefabricacion-aumenta-la-sostenibilidad-en-proyectos-de-infraestructura' },
		'/post/innovaciones-en-impresion-3d-de-hormigon-prefabricado-y-su-impacto-en-la-construccion-una-tecnologi': { status: 301, destination: '/blog/innovacion-en-hormigon-prefabricado-tendencias-que-lideran-la-construccion-en-chile' },
		'/post/como-elegir-al-proveedor-adecuado-de-prefabricados-de-hormigon-para-su-proyecto': { status: 301, destination: '/blog/como-elegir-al-proveedor-adecuado-de-prefabricados-de-hormigon-para-su-proyecto' },
		'/post/cuales-son-las-ventajas-del-hormigon-prefabricado-en-la-construccion-moderna': { status: 301, destination: '/blog/7-ventajas-del-hormigon-prefabricado-que-reducen-costos-en-obras-en-chile' },
		'/post/prefabricadosdehormigon': { status: 301, destination: '/blog/por-que-elegir-prefabricados-de-hormigon-para-su-construccion-ventajas-y-aplicaciones' },
		'/post/[...slug]': { status: 301, destination: '/blog' },
	},
	integrations: [mdx(), sitemap({ filter: (page) => !page.includes('/admin') }), icon()],
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Atkinson',
			cssVariable: '--font-atkinson',
			fallbacks: ['sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/atkinson-regular.woff'],
						weight: 400,
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/atkinson-bold.woff'],
						weight: 700,
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
	],
});
