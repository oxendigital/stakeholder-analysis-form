export interface DefaultStakeholderItem {
  id: string;
  name: string;
  category: "Cadena de Valor" | "Interno" | "Gobernanza y Regulación" | "Comunidad y Sociedad" | "Planeta y Ecosistema" | "Mercado" | "General";
  tripleImpactDimension: "Personas" | "Planeta" | "Prosperidad" | "Transversal";
  iconName: string;
  shortDescription: string;
  examples: string[];
  climateContext: string;
}

export const DEFAULT_STAKEHOLDERS: DefaultStakeholderItem[] = [
  {
    id: "clientes",
    name: "Clientes",
    category: "Cadena de Valor",
    tripleImpactDimension: "Personas",
    iconName: "Users",
    shortDescription: "Personas o empresas que compran o utilizan tus productos o servicios sostenibles.",
    examples: ["Consumidores finales", "Empresas B2B", "Distribuidores", "Compradores públicos"],
    climateContext: "Cada vez valoran más la trazabilidad ecológica, el ecodiseño y el compromiso climático."
  },
  {
    id: "trabajadores",
    name: "Trabajadores y colaboradores",
    category: "Interno",
    tripleImpactDimension: "Personas",
    iconName: "Briefcase",
    shortDescription: "Equipo humano que hace posible la operación diaria y el crecimiento del proyecto.",
    examples: ["Empleados contratados", "Practicantes", "Asesores técnicos", "Contratistas regulares"],
    climateContext: "Clave para la cultura de sostenibilidad interna, seguridad laboral y sentido de propósito."
  },
  {
    id: "proveedores",
    name: "Proveedores",
    category: "Cadena de Valor",
    tripleImpactDimension: "Prosperidad",
    iconName: "Truck",
    shortDescription: "Quienes suministran materias primas, insumos, maquinaria, tecnología o servicios logísticos.",
    examples: ["Productores locales", "Distribuidores de insumos", "Transportistas", "Servicios de nube"],
    climateContext: "Determinan gran parte de la huella de carbono de alcance 3 y la circularidad de insumos."
  },
  {
    id: "socios",
    name: "Socios o propietarios",
    category: "Interno",
    tripleImpactDimension: "Prosperidad",
    iconName: "Handshake",
    shortDescription: "Cofundadores, accionistas, inversores o miembros del directorio del negocio.",
    examples: ["Socios fundadores", "Inversionistas ángel", "Fondos de capital", "Familiares socios"],
    climateContext: "Definen la visión estratégica, alineación de valores y reinversión de utilidades en impacto."
  },
  {
    id: "competidores",
    name: "Competidores",
    category: "Mercado",
    tripleImpactDimension: "Prosperidad",
    iconName: "TrendingUp",
    shortDescription: "Otras empresas u opciones que ofrecen soluciones parecidas o alternativas en tu mercado.",
    examples: ["Competidores directos", "Sustitutos tradicionales no sostenibles", "Nuevos entrantes"],
    climateContext: "Permiten benchmarking, identificar ventajas competitivas verdes y fomentar la innovación."
  },
  {
    id: "bancos_financieras",
    name: "Bancos e instituciones financieras",
    category: "Gobernanza y Regulación",
    tripleImpactDimension: "Prosperidad",
    iconName: "Landmark",
    shortDescription: "Entidades que otorgan financiamiento, créditos verdes, cuentas o subsidios de fomento.",
    examples: ["Banca comercial", "Corfo / Sercotec / Fondos", "Cooperativas de ahorro", "Fintechs verdes"],
    climateContext: "Cada vez exigen mayores criterios ESG y criterios climáticos para tasas preferenciales."
  },
  {
    id: "estado_municipalidad",
    name: "Estado y municipalidad",
    category: "Gobernanza y Regulación",
    tripleImpactDimension: "Personas",
    iconName: "Building2",
    shortDescription: "Organismos públicos locales y nacionales que otorgan patentes, permisos o incentivos.",
    examples: ["Municipalidad local", "Gobierno Regional", "Ministerios sectoriales", "Servicios de rentas"],
    climateContext: "Impulsan políticas de compras públicas sustentables, reciclaje comunal y zonas de desarrollo."
  },
  {
    id: "organismos_reguladores",
    name: "Organismos reguladores",
    category: "Gobernanza y Regulación",
    tripleImpactDimension: "Transversal",
    iconName: "ShieldAlert",
    shortDescription: "Entidades que fiscalizan el cumplimiento normativo ambiental, sanitario, laboral y tributario.",
    examples: ["Superintendencia del Medio Ambiente", "Seremi de Salud", "Dirección del Trabajo", "SII"],
    climateContext: "Aseguran cumplimiento de Ley REP, normas de emisiones, residuos peligrosos y condiciones laborales."
  },
  {
    id: "comunidad_vecinos",
    name: "Comunidad y vecinos",
    category: "Comunidad y Sociedad",
    tripleImpactDimension: "Personas",
    iconName: "Home",
    shortDescription: "Personas, barrios y familias que habitan en el entorno donde operas o produces.",
    examples: ["Juntas de vecinos", "Comunidades aledañas", "Comercio de barrio", "Poblaciones locales"],
    climateContext: "Otorgan la licencia social para operar y son los primeros receptores de externalidades."
  },
  {
    id: "organizaciones_sociales",
    name: "Organizaciones sociales",
    category: "Comunidad y Sociedad",
    tripleImpactDimension: "Personas",
    iconName: "HeartHandshake",
    shortDescription: "ONGs, fundaciones comunitarias, colectivos ambientales y agrupaciones ciudadanas.",
    examples: ["ONGs ambientales", "Fundaciones sociales", "Colectivos de voluntariado", "Mesas de trabajo"],
    climateContext: "Potenciales aliados estratégicos para proyectos de impacto territorial y validación social."
  },
  {
    id: "instituciones_educacionales",
    name: "Instituciones educacionales",
    category: "Comunidad y Sociedad",
    tripleImpactDimension: "Transversal",
    iconName: "GraduationCap",
    shortDescription: "Universidades, institutos técnicos, centros de I+D y colegios de tu ecosistema.",
    examples: ["Universidades regionales", "Centros de I+D", "Institutos profesionales", "Escuelas técnicas"],
    climateContext: "Fuente de talento, transferencia tecnológica, tesistas y laboratorios de pruebas."
  },
  {
    id: "asociaciones_gremiales",
    name: "Asociaciones gremiales",
    category: "Mercado",
    tripleImpactDimension: "Prosperidad",
    iconName: "Network",
    shortDescription: "Cámaras de comercio, asociaciones de emprendedores y redes de economía circular.",
    examples: ["Cámara Regional de Comercio", "Asociación de Empresas B", "Redes gremiales de sustentabilidad"],
    climateContext: "Facilitan networking, incidencia gremial, compras conjuntas y visibilidad sectorial."
  },
  {
    id: "medioambiente",
    name: "Medioambiente",
    category: "Planeta y Ecosistema",
    tripleImpactDimension: "Planeta",
    iconName: "Leaf",
    shortDescription: "Los ecosistemas naturales, recursos hídricos, calidad del aire, suelo y biodiversidad.",
    examples: ["Cuenca hídrica local", "Flora y fauna nativa", "Calidad del aire / emisiones", "Gestión de residuos"],
    climateContext: "El stakeholder silencioso fundamental. Tu emprendimiento debe protegerlo y regenerarlo."
  },
  {
    id: "otros",
    name: "Otros",
    category: "General",
    tripleImpactDimension: "Transversal",
    iconName: "PlusCircle",
    shortDescription: "Cualquier otro actor relevante específico para tu modelo de negocio particular.",
    examples: ["Medios de comunicación", "Influencers", "Líderes de opinión", "Aliados tecnológicos"],
    climateContext: "Personaliza según las particularidades de tu sector o territorio."
  }
];

export const DEMO_VENTURE = {
  ventureName: "EcoPack Circular SpA",
  entrepreneurName: "Valentina Henríquez",
  industry: "Reciclaje & Economía Circular",
  date: new Date().toISOString().split("T")[0],
  notes: "Producción de embalajes biodegradables a partir de descartes agrícolas locales.",
  responses: [
    {
      stakeholderKey: "clientes",
      stakeholderName: "Clientes",
      isRelated: true,
      importance: "Muy importante",
      impactOnVenture: "Alto impacto",
      impactOfVenture: "Alto impacto",
      notes: "Empresas de e-commerce y marcas de alimentos que buscan empaques compostables."
    },
    {
      stakeholderKey: "trabajadores",
      stakeholderName: "Trabajadores y colaboradores",
      isRelated: true,
      importance: "Muy importante",
      impactOnVenture: "Alto impacto",
      impactOfVenture: "Alto impacto",
      notes: "8 operarios de planta y 3 profesionales de diseño industrial."
    },
    {
      stakeholderKey: "proveedores",
      stakeholderName: "Proveedores",
      isRelated: true,
      importance: "Muy importante",
      impactOnVenture: "Alto impacto",
      impactOfVenture: "Impacto medio",
      notes: "Agricultores locales proveedores de rastrojo y cáscaras."
    },
    {
      stakeholderKey: "socios",
      stakeholderName: "Socios o propietarios",
      isRelated: true,
      importance: "Muy importante",
      impactOnVenture: "Impacto medio",
      impactOfVenture: "Alto impacto",
      notes: "2 socias fundadoras y 1 inversor ángel."
    },
    {
      stakeholderKey: "competidores",
      stakeholderName: "Competidores",
      isRelated: true,
      importance: "Medianamente importante",
      impactOnVenture: "Impacto medio",
      impactOfVenture: "Bajo impacto",
      notes: "Fabricantes tradicionales de plumavit y cartón reciclado."
    },
    {
      stakeholderKey: "bancos_financieras",
      stakeholderName: "Bancos e instituciones financieras",
      isRelated: true,
      importance: "Muy importante",
      impactOnVenture: "Alto impacto",
      impactOfVenture: "Impacto medio",
      notes: "Postulando a crédito verde Corfo y fondos Semilla Expande."
    },
    {
      stakeholderKey: "estado_municipalidad",
      stakeholderName: "Estado y municipalidad",
      isRelated: true,
      importance: "Medianamente importante",
      impactOnVenture: "Alto impacto",
      impactOfVenture: "Impacto medio",
      notes: "Permisos de funcionamiento y alianzas con la oficina de medio ambiente municipal."
    },
    {
      stakeholderKey: "organismos_reguladores",
      stakeholderName: "Organismos reguladores",
      isRelated: true,
      importance: "Muy importante",
      impactOnVenture: "Alto impacto",
      impactOfVenture: "Bajo impacto",
      notes: "Cumplimiento de resolución sanitaria y Ley REP de envases."
    },
    {
      stakeholderKey: "comunidad_vecinos",
      stakeholderName: "Comunidad y vecinos",
      isRelated: true,
      importance: "Medianamente importante",
      impactOnVenture: "Impacto medio",
      impactOfVenture: "Alto impacto",
      notes: "Vecindario contiguo al centro de acopio; cero olores y baja emisión acústica."
    },
    {
      stakeholderKey: "organizaciones_sociales",
      stakeholderName: "Organizaciones sociales",
      isRelated: true,
      importance: "Poco importante",
      impactOnVenture: "Bajo impacto",
      impactOfVenture: "Impacto medio",
      notes: "Fundación de recicladores de base con quienes coordinamos charlas."
    },
    {
      stakeholderKey: "instituciones_educacionales",
      stakeholderName: "Instituciones educacionales",
      isRelated: true,
      importance: "Medianamente importante",
      impactOnVenture: "Impacto medio",
      impactOfVenture: "Impacto medio",
      notes: "Convenio con Universidad técnica para ensayos de biodegradabilidad."
    },
    {
      stakeholderKey: "asociaciones_gremiales",
      stakeholderName: "Asociaciones gremiales",
      isRelated: true,
      importance: "Poco importante",
      impactOnVenture: "Bajo impacto",
      impactOfVenture: "Bajo impacto",
      notes: "Participación en gremio de emprendedores de triple impacto."
    },
    {
      stakeholderKey: "medioambiente",
      stakeholderName: "Medioambiente",
      isRelated: true,
      importance: "Muy importante",
      impactOnVenture: "Alto impacto",
      impactOfVenture: "Alto impacto",
      notes: "Reducción directa de 40 toneladas de plástico virgen al año."
    }
  ]
};
