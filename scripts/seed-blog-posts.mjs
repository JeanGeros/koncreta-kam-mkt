// Migra los 4 posts reales que estaban enlazados al sitio Wix viejo.
// Ejecutar una sola vez: node --env-file=.env.local scripts/seed-blog-posts.mjs

import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', prepare: false });

const posts = [
	{
		title:
			'Reflexiones del 1° Congreso Nacional de Cemento y Hormigón: sostenibilidad, innovación y productividad como eje del futuro',
		category: 'industria',
		excerpt:
			'El 12 de noviembre asistimos al Primer Congreso Nacional del Cemento y Hormigón, organizado por el Centro UC y patrocinado por el Instituto del Cemento y Hormigón de Chile (ICH), un espacio que reunió a la academia y a las principales empresas del sector.',
		hero_image_url: '/img/k-14dd9010.jpg',
		hero_image_alt: 'Reflexiones del 1° Congreso Nacional de Cemento y Hormigón, sostenibilidad e innovación',
		featured: true,
		published_at: '2025-11-20T12:00:00Z',
		content: `**El 12 de noviembre tuvimos la oportunidad de asistir al Primer Congreso Nacional del Cemento y Hormigón, organizado por el Centro UC de la Pontificia Universidad Católica de Chile y patrocinado por el Instituto del Cemento y Hormigón de Chile (ICH). Una instancia que reunió a la academia, el mundo de la investigación y a las principales empresas de la industria, creando un espacio valioso para mirar hacia dónde avanza el sector.**

**Lo más relevante es que todo el congreso giró en torno a tres pilares fundamentales: sostenibilidad, innovación y productividad, todos alineados con la meta global de reducir la huella de carbono y avanzar hacia el Net Zero.**

## Sostenibilidad: el compromiso que cruza toda la industria

Uno de los puntos más enfatizados fue cómo la industria del cemento y el hormigón está replanteando sus procesos para disminuir su impacto ambiental. Se abordó el desarrollo de nuevos aditivos y agregados, tanto orgánicos como inorgánicos, que permiten reutilizar subproductos del proceso de fabricación y reducir las emisiones de carbono en cada etapa.

Desde la exposición del FICEM (Federación Interamericana del Cemento) se destacó la importancia del cemento en el desarrollo urbano y económico de la región, pero también el desafío urgente de integrar prácticas sostenibles que estén en línea con los compromisos globales de descarbonización.

## Innovación: tecnologías que transforman la construcción

La innovación tecnológica fue otro eje clave. La impresión 3D aplicada al hormigón se presentó como una herramienta con gran potencial para responder a las necesidades de vivienda en Chile, además de optimizar procesos en prefabricados mediante la reducción del uso de moldes y tiempos de producción.

## Productividad: eficiencia como estándar

A nivel de productividad, la industria está avanzando hacia procesos más eficientes, capaces de aumentar el rendimiento sin comprometer la calidad. Nuevas formulaciones, aditivos optimizados y mejoras en los procesos permiten responder a las exigencias del mercado actual y futuro.

## Nuestra mirada como Koncreta Prefabricados

Como empresa, nos sentimos plenamente alineados con los desafíos expuestos. Compartimos la necesidad de avanzar hacia procesos cada vez más sostenibles, optimizando residuos, reduciendo emisiones y manteniendo siempre nuestro compromiso con la calidad, la seguridad y la entrega a tiempo.

Estamos disponibles para colaborar en iniciativas, investigaciones y proyectos que integren al sector público, universidades y empresas privadas. Creemos firmemente que el futuro del hormigón se construye en conjunto.

## Innovaciones presentadas por empresas del sector

Algunas de las soluciones mencionadas durante el evento reflejan el avance real de la industria:

- **Cementos Melón**: presentó productos con enfoque sostenible, incluyendo hormigones Net Zero y nuevas aplicaciones pensadas para responder a las necesidades de clientes que buscan reducir su impacto ambiental.
- **Zika**: destacó su línea de aditivos orientados a mejorar la eficiencia de los procesos y desarrollar productos que reduzcan el uso de clínker y fortalezcan los estándares de la industria.
- **Cementos Polpaico**: reforzó su compromiso con productos y procesos capaces de degradar gases de efecto invernadero y el uso de insumos no orgánicos para disminuir la huella de carbono bajo la normativa nacional.
- **Rafasur**: compartió su tecnología basada en impregnantes orgánicos que aumentan significativamente la durabilidad del hormigón.
- **Cementos BioBio**: presentó soluciones orientadas a potenciar la productividad y eficiencia de los proyectos de sus clientes, integrando tecnología y enfoque sustentable.

## Un encuentro que marca dirección

En general, fue una instancia muy positiva para conectar visiones, contrastar avances y entender hacia dónde se mueve la industria. La articulación entre empresas, academia e investigación es clave para acelerar el cambio que todos buscamos: una industria del hormigón más eficiente, más innovadora y, por sobre todo, más sostenible.`,
	},
	{
		title: 'Koncreta y la nueva era del Hormigón Prefabricado',
		category: 'innovacion',
		excerpt:
			'Estamos a la vanguardia de la evolución del hormigón prefabricado, adaptándonos a las tendencias que están redefiniendo la industria de la construcción.',
		hero_image_url: '/img/k-45cb7ef0.jpg',
		hero_image_alt: 'Koncreta y la nueva era del Hormigón Prefabricado',
		featured: false,
		published_at: '2025-06-09T12:00:00Z',
		content: `En Koncreta, estamos a la vanguardia de la evolución del hormigón prefabricado, adaptándonos continuamente a las tendencias emergentes que están redefiniendo la industria de la construcción. Este artículo explora cómo integramos innovación y sostenibilidad para ofrecer soluciones de hormigón prefabricado que satisfacen las necesidades actuales y futuras de nuestros clientes.

## Innovaciones tecnológicas en prefabricación en Koncreta

La tecnología es un motor clave en nuestra operación en Koncreta. Implementamos herramientas avanzadas como la impresión 3D y la inteligencia artificial para mejorar tanto el diseño como la producción de nuestros elementos prefabricados, asegurando precisión y eficiencia en cada proyecto.

### Impresión 3D en hormigón

En Koncreta, exploramos el potencial de la impresión 3D para crear estructuras de hormigón con diseños complejos y personalizados. Esta tecnología nos permite ofrecer a nuestros clientes soluciones arquitectónicas innovadoras que combinan funcionalidad y estética.

### Inteligencia artificial y automatización

Utilizamos inteligencia artificial para optimizar nuestros procesos de diseño y producción. Los algoritmos avanzados nos ayudan a anticipar y resolver posibles problemas, mejorando la calidad del producto final y minimizando el desperdicio.

## Compromiso con la sostenibilidad

La sostenibilidad es un pilar fundamental en Koncreta. Estamos comprometidos con el desarrollo de materiales avanzados y prácticas que minimicen nuestro impacto ambiental, desde el uso de hormigones ecológicos hasta la implementación de economía circular en nuestros procesos.

### Hormigones ecológicos

Nuestros hormigones incorporan aditivos reciclados y fórmulas de bajo carbono, garantizando no solo sostenibilidad sino también una mayor durabilidad y resistencia en las estructuras.

### Economía circular

En Koncreta, promovemos la reutilización y reciclaje de materiales, alineándonos con los principios de la economía circular para optimizar recursos y reducir residuos, beneficiando tanto al medio ambiente como a nuestros clientes.

## Diseño modular y personalización en Koncreta

Ofrecemos soluciones modulares que permiten una construcción rápida y adaptable. Nuestra capacidad para personalizar en masa significa que podemos satisfacer las necesidades específicas de cada proyecto sin comprometer la eficiencia.

### Personalización en masa

Gracias a nuestros procesos optimizados, podemos proporcionar productos prefabricados que se adaptan a los requisitos únicos de cada cliente, manteniendo altos estándares de calidad y eficiencia.

## El futuro de la infraestructura con hormigón prefabricado y Koncreta

En Koncreta, miramos hacia el futuro con un enfoque en la creación de infraestructuras sostenibles y resilientes. Con el respaldo de tecnologías avanzadas y materiales innovadores, estamos preparados para enfrentar los desafíos de la urbanización y el cambio climático.

Koncreta se encuentra en la cúspide de una revolución en el hormigón prefabricado, impulsada por la innovación y la sostenibilidad. Mantenerse al día con estas tendencias es esencial para ingenieros y arquitectos que buscan aprovechar al máximo las oportunidades que ofrecemos.

Si estás interesado en conocer cómo las tendencias en hormigón prefabricado pueden beneficiar tus proyectos, no dudes en contactarnos. Nuestro equipo de expertos está listo para ayudarte a implementar soluciones innovadoras y sostenibles.`,
	},
	{
		title: 'Cómo la prefabricación aumenta la sostenibilidad en proyectos de infraestructura',
		category: 'sostenibilidad',
		excerpt:
			'La prefabricación está redefiniendo la sostenibilidad en infraestructura: cómo los elementos prefabricados contribuyen a prácticas más ecológicas y eficientes.',
		hero_image_url: '/img/k-8451b9e6.jpg',
		hero_image_alt: 'Cómo la prefabricación aumenta la sostenibilidad en proyectos de infraestructura',
		featured: false,
		published_at: '2025-06-06T12:00:00Z',
		content: `La prefabricación es una técnica revolucionaria que está redefiniendo la sostenibilidad en proyectos de infraestructura. Este artículo aborda cómo el uso de elementos prefabricados de hormigón contribuye a prácticas más ecológicas, eficientes y responsables en la construcción de infraestructuras modernas.

## Menor impacto ambiental en el sitio de construcción

Al trasladar gran parte del proceso de construcción a instalaciones de fabricación, se reduce la perturbación en el sitio de obra. Esto no solo disminuye el ruido y las emisiones, sino que también protege los ecosistemas locales al minimizar el impacto físico sobre el terreno.

## Ahorro energético y su impacto en Koncreta

La prefabricación no solo reduce el tiempo de construcción, sino que también disminuye significativamente el consumo energético asociado a la creación de infraestructuras. En Koncreta, hemos optimizado nuestros procesos de producción para asegurar que cada elemento prefabricado se fabrique con la máxima eficiencia energética posible.

El uso de maquinaria avanzada y técnicas automatizadas permite que nuestras plantas operen con un consumo mínimo de energía, lo que se traduce en una huella de carbono reducida. Además, los componentes prefabricados diseñados en nuestras instalaciones están optimizados para mejorar la eficiencia energética de las estructuras donde se instalan, contribuyendo a la sostenibilidad a largo plazo.

En Koncreta, creemos que cada paso hacia la eficiencia energética es un paso hacia un futuro más sostenible. Por ello, estamos comprometidos a seguir innovando en nuestras prácticas de prefabricación para ofrecer productos que no solo cumplan con los estándares más altos de calidad, sino que también promuevan el ahorro energético en cada proyecto.

## Transporte optimizado

El transporte eficiente de componentes prefabricados desde la planta hasta el sitio de construcción contribuye a reducir las emisiones de CO2. La planificación cuidadosa y la logística optimizada aseguran que se minimicen los viajes y se maximice la carga, promoviendo un enfoque más sostenible en el transporte.

## Innovación en materiales y diseño

La prefabricación permite la incorporación de materiales innovadores y soluciones de diseño que mejoran la sostenibilidad. Desde el uso de hormigones reciclados hasta la implementación de tecnologías avanzadas de aislamiento, las posibilidades para aumentar la sostenibilidad son amplias.

La prefabricación no solo mejora la eficiencia y calidad de los proyectos de infraestructura, sino que también juega un papel crucial en la promoción de prácticas sostenibles. Adoptar esta técnica es esencial para construir un futuro más ecológico y responsable en el sector de la construcción.

Si estás interesado en cómo la prefabricación puede aumentar la sostenibilidad de tus proyectos de infraestructura, no dudes en contactarnos en Koncreta. Nuestro equipo de expertos está listo para ayudarte a implementar soluciones innovadoras y sostenibles. ¡Contáctanos!`,
	},
	{
		title: 'Transformación digital en la construcción: el futuro del hormigón prefabricado',
		category: 'tecnologia',
		excerpt:
			'La transformación digital está redefiniendo la construcción: cómo la digitalización mejora la eficiencia, precisión y sostenibilidad del hormigón prefabricado.',
		hero_image_url: '/img/k-d403133a.jpg',
		hero_image_alt: 'Transformación digital en la construcción: el futuro del hormigón prefabricado',
		featured: false,
		published_at: '2025-06-04T12:00:00Z',
		content: `La transformación digital está redefiniendo el paisaje de la construcción, y el hormigón prefabricado juega un papel crucial en este cambio. Este artículo explora cómo la digitalización está mejorando la eficiencia, precisión y sostenibilidad en el uso del hormigón prefabricado, estableciendo un nuevo estándar para el futuro de la industria.

## La digitalización en el proceso de diseño

La adopción de herramientas digitales como el BIM (Building Information Modeling) ha revolucionado el diseño y planificación de proyectos con hormigón prefabricado. BIM permite crear modelos 3D detallados que facilitan la visualización, coordinación y detección de conflictos antes de la construcción, mejorando la precisión y reduciendo errores.

## Automatización en la producción

Las tecnologías automatizadas están optimizando la fabricación de componentes prefabricados. Sistemas robóticos y maquinaria avanzada aseguran una producción más rápida y precisa, reduciendo tiempos de entrega y mejorando la calidad del producto final.

## Integración de IoT y sensores

El uso de dispositivos IoT (Internet de las Cosas) y sensores inteligentes está transformando el monitoreo y mantenimiento de las infraestructuras de hormigón prefabricado. Estos dispositivos recopilan datos en tiempo real sobre el estado y rendimiento de las estructuras, permitiendo un mantenimiento predictivo y reduciendo el riesgo de fallos.

## Sostenibilidad mejorada

La digitalización contribuye a prácticas más sostenibles en la prefabricación de hormigón, optimizando el uso de materiales y minimizando el desperdicio. Además, facilita el diseño de estructuras más eficientes energéticamente, lo que reduce el impacto ambiental a lo largo de su ciclo de vida.

## Comunicación y colaboración efectiva

Las plataformas digitales han mejorado la comunicación y colaboración entre equipos de diseño, producción y construcción, eliminando silos de información y asegurando que todos los involucrados estén alineados. Esto no solo acelera el proceso, sino que también mejora la calidad del proyecto final.

## El camino hacia la Construcción 4.0

El hormigón prefabricado es una pieza clave en la transición hacia la Construcción 4.0, donde la digitalización y la automatización se combinan para crear un sector más eficiente, seguro y sostenible. A medida que las tecnologías continúan evolucionando, las posibilidades para el hormigón prefabricado son prácticamente ilimitadas.

La transformación digital está impulsando el futuro del hormigón prefabricado, ofreciendo mejoras significativas en eficiencia, sostenibilidad y calidad. Para ingenieros y arquitectos, adoptar estas innovaciones es crucial para mantenerse competitivos en la industria en constante evolución.

Si deseas conocer más sobre cómo la digitalización puede potenciar tus proyectos con hormigón prefabricado, nuestro equipo está preparado para guiarte en este emocionante viaje hacia el futuro de la construcción. ¡Contáctanos hoy para descubrir más!`,
	},
];

function slugify(title) {
	return title
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

for (const p of posts) {
	const slug = slugify(p.title);
	await sql`
		INSERT INTO blog_posts (title, slug, category, excerpt, content, hero_image_url, hero_image_alt, featured, published, published_at)
		VALUES (${p.title}, ${slug}, ${p.category}, ${p.excerpt}, ${p.content},
		        ${p.hero_image_url}, ${p.hero_image_alt}, ${p.featured}, true, ${p.published_at})
		ON CONFLICT (slug) DO NOTHING
	`;
	console.log(`✓ ${p.title}`);
}

console.log(`Listo: ${posts.length} posts procesados.`);
await sql.end();
