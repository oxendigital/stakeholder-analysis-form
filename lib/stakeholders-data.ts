export type StakeholderCategory =
  | "Cadena de valor"
  | "Equipo y propiedad"
  | "Regulación y financiamiento"
  | "Comunidad"
  | "Entorno natural"
  | "Mercado"
  | "Otro";

export type TripleImpactDimension = "Personas" | "Planeta" | "Prosperidad" | "Transversal";

export interface DefaultStakeholderItem {
  id: string;
  name: string;
  category: StakeholderCategory;
  tripleImpactDimension: TripleImpactDimension;
  iconName: string;
  /** Una frase en lenguaje simple: quiénes son. */
  shortDescription: string;
  /** Ejemplos concretos para que el emprendedor se ubique rápido. */
  examples: string[];
}

/** Los 14 grupos de interés definidos en el requerimiento, en ese mismo orden. */
export const DEFAULT_STAKEHOLDERS: DefaultStakeholderItem[] = [
  {
    id: "clientes",
    name: "Clientes",
    category: "Cadena de valor",
    tripleImpactDimension: "Personas",
    iconName: "Users",
    shortDescription: "Las personas o empresas que compran o usan lo que ofreces.",
    examples: ["Consumidores finales", "Otras empresas", "Distribuidores"],
  },
  {
    id: "trabajadores",
    name: "Trabajadores y colaboradores",
    category: "Equipo y propiedad",
    tripleImpactDimension: "Personas",
    iconName: "Briefcase",
    shortDescription: "Quienes trabajan contigo en el día a día del negocio.",
    examples: ["Empleados", "Practicantes", "Personas que contratas por servicio"],
  },
  {
    id: "proveedores",
    name: "Proveedores",
    category: "Cadena de valor",
    tripleImpactDimension: "Prosperidad",
    iconName: "Truck",
    shortDescription: "Quienes te venden insumos, materiales, equipos o servicios.",
    examples: ["Productores locales", "Distribuidores", "Transportistas"],
  },
  {
    id: "socios",
    name: "Socios o propietarios",
    category: "Equipo y propiedad",
    tripleImpactDimension: "Prosperidad",
    iconName: "Handshake",
    shortDescription: "Las personas dueñas del negocio o que invirtieron en él.",
    examples: ["Socios fundadores", "Inversionistas", "Familiares que aportaron capital"],
  },
  {
    id: "competidores",
    name: "Competidores",
    category: "Mercado",
    tripleImpactDimension: "Prosperidad",
    iconName: "TrendingUp",
    shortDescription: "Otros negocios que ofrecen algo parecido o que te reemplazan.",
    examples: ["Competencia directa", "Alternativas tradicionales", "Negocios nuevos"],
  },
  {
    id: "bancos_financieras",
    name: "Bancos e instituciones financieras",
    category: "Regulación y financiamiento",
    tripleImpactDimension: "Prosperidad",
    iconName: "Landmark",
    shortDescription: "Quienes te prestan dinero o financian el crecimiento del negocio.",
    examples: ["Bancos", "Cooperativas", "Fondos públicos de fomento"],
  },
  {
    id: "estado_municipalidad",
    name: "Estado y municipalidad",
    category: "Regulación y financiamiento",
    tripleImpactDimension: "Personas",
    iconName: "Building2",
    shortDescription: "Los organismos públicos que dan permisos, patentes o apoyos.",
    examples: ["Municipalidad", "Gobierno regional", "Ministerios"],
  },
  {
    id: "organismos_reguladores",
    name: "Organismos reguladores",
    category: "Regulación y financiamiento",
    tripleImpactDimension: "Transversal",
    iconName: "ShieldAlert",
    shortDescription: "Los que fiscalizan que cumplas las normas de tu actividad.",
    examples: ["Salud", "Medio ambiente", "Trabajo", "Impuestos"],
  },
  {
    id: "comunidad_vecinos",
    name: "Comunidad y vecinos",
    category: "Comunidad",
    tripleImpactDimension: "Personas",
    iconName: "Home",
    shortDescription: "Las personas que viven o trabajan cerca de donde operas.",
    examples: ["Junta de vecinos", "Barrio", "Comercio cercano"],
  },
  {
    id: "organizaciones_sociales",
    name: "Organizaciones sociales",
    category: "Comunidad",
    tripleImpactDimension: "Personas",
    iconName: "HeartHandshake",
    shortDescription: "Fundaciones, ONG y agrupaciones con las que puedes aliarte.",
    examples: ["ONG", "Fundaciones", "Agrupaciones de voluntariado"],
  },
  {
    id: "instituciones_educacionales",
    name: "Instituciones educacionales",
    category: "Comunidad",
    tripleImpactDimension: "Transversal",
    iconName: "GraduationCap",
    shortDescription: "Universidades, institutos y colegios de tu zona.",
    examples: ["Universidades", "Institutos técnicos", "Liceos"],
  },
  {
    id: "asociaciones_gremiales",
    name: "Asociaciones gremiales",
    category: "Mercado",
    tripleImpactDimension: "Prosperidad",
    iconName: "Network",
    shortDescription: "Redes y cámaras que agrupan a negocios como el tuyo.",
    examples: ["Cámara de comercio", "Asociación de emprendedores", "Redes del rubro"],
  },
  {
    id: "medioambiente",
    name: "Medioambiente",
    category: "Entorno natural",
    tripleImpactDimension: "Planeta",
    iconName: "Leaf",
    shortDescription: "El agua, el aire, el suelo y la naturaleza donde operas.",
    examples: ["Agua", "Aire", "Suelo", "Flora y fauna"],
  },
  {
    id: "otros",
    name: "Otros",
    category: "Otro",
    tripleImpactDimension: "Transversal",
    iconName: "PlusCircle",
    shortDescription:
      "¿Hay alguien más importante que no esté en la lista? Escribe su nombre aquí.",
    examples: ["Medios de comunicación", "Líderes locales", "Aliados tecnológicos"],
  },
];

/** Ejemplo listo para mostrar en la presentación. */
export const DEMO_VENTURE = {
  ventureName: "EcoPack Circular",
  entrepreneurName: "Valentina Henríquez",
  industry: "Reciclaje y economía circular",
  date: new Date().toISOString().split("T")[0],
  notes: "Envases biodegradables hechos con descartes agrícolas de la zona.",
  responses: [
    {
      stakeholderKey: "clientes",
      isRelated: true,
      importance: "Muy importante",
      impactOnVenture: "Alto impacto",
      impactOfVenture: "Alto impacto",
      notes: "Marcas de alimentos y tiendas online que buscan envases compostables.",
    },
    {
      stakeholderKey: "trabajadores",
      isRelated: true,
      importance: "Muy importante",
      impactOnVenture: "Alto impacto",
      impactOfVenture: "Alto impacto",
      notes: "8 personas en planta y 3 en diseño.",
    },
    {
      stakeholderKey: "proveedores",
      isRelated: true,
      importance: "Muy importante",
      impactOnVenture: "Alto impacto",
      impactOfVenture: "Impacto medio",
      notes: "Agricultores locales que aportan rastrojo y cáscaras.",
    },
    {
      stakeholderKey: "socios",
      isRelated: true,
      importance: "Muy importante",
      impactOnVenture: "Impacto medio",
      impactOfVenture: "Alto impacto",
      notes: "Dos socias fundadoras y un inversionista.",
    },
    {
      stakeholderKey: "competidores",
      isRelated: true,
      importance: "Medianamente importante",
      impactOnVenture: "Impacto medio",
      impactOfVenture: "Bajo impacto",
      notes: "Fabricantes de envases plásticos y de cartón.",
    },
    {
      stakeholderKey: "bancos_financieras",
      isRelated: true,
      importance: "Muy importante",
      impactOnVenture: "Alto impacto",
      impactOfVenture: "Impacto medio",
      notes: "Postulación a crédito verde y fondos de fomento.",
    },
    {
      stakeholderKey: "estado_municipalidad",
      isRelated: true,
      importance: "Medianamente importante",
      impactOnVenture: "Alto impacto",
      impactOfVenture: "Impacto medio",
      notes: "Permisos de funcionamiento y trabajo con la oficina de medio ambiente.",
    },
    {
      stakeholderKey: "organismos_reguladores",
      isRelated: true,
      importance: "Muy importante",
      impactOnVenture: "Alto impacto",
      impactOfVenture: "Bajo impacto",
      notes: "Resolución sanitaria y normativa de envases.",
    },
    {
      stakeholderKey: "comunidad_vecinos",
      isRelated: true,
      importance: "Medianamente importante",
      impactOnVenture: "Impacto medio",
      impactOfVenture: "Alto impacto",
      notes: "Vecinos del centro de acopio: sin olores ni ruido.",
    },
    {
      stakeholderKey: "organizaciones_sociales",
      isRelated: true,
      importance: "Poco importante",
      impactOnVenture: "Bajo impacto",
      impactOfVenture: "Impacto medio",
      notes: "Fundación de recicladores de base.",
    },
    {
      stakeholderKey: "instituciones_educacionales",
      isRelated: true,
      importance: "Medianamente importante",
      impactOnVenture: "Impacto medio",
      impactOfVenture: "Impacto medio",
      notes: "Convenio con una universidad para pruebas de biodegradabilidad.",
    },
    {
      stakeholderKey: "asociaciones_gremiales",
      isRelated: true,
      importance: "Poco importante",
      impactOnVenture: "Bajo impacto",
      impactOfVenture: "Bajo impacto",
      notes: "Participación en una red de emprendedores.",
    },
    {
      stakeholderKey: "medioambiente",
      isRelated: true,
      importance: "Muy importante",
      impactOnVenture: "Alto impacto",
      impactOfVenture: "Alto impacto",
      notes: "Se evitan 40 toneladas de plástico nuevo al año.",
    },
    {
      stakeholderKey: "otros",
      isRelated: false,
      importance: null,
      impactOnVenture: null,
      impactOfVenture: null,
      notes: "",
    },
  ],
};
