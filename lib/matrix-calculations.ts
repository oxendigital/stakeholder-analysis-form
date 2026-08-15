export type ImportanceLevel =
  | "Poco importante"
  | "Medianamente importante"
  | "Muy importante";

export type ImpactLevel = "Bajo impacto" | "Impacto medio" | "Alto impacto";

export type PriorityLevel =
  | "Prioridad máxima"
  | "Prioritario"
  | "Gestionar"
  | "Observar"
  | "Monitorear"
  | "Baja prioridad"
  | "No aplica";

/**
 * Nivel visual (1 = más urgente, 4 = menos urgente). Los seis niveles de
 * prioridad del requerimiento se agrupan en cuatro tonos para que la lectura
 * en pantalla, en la matriz y en el PDF sea siempre la misma.
 */
export type PriorityTier = 1 | 2 | 3 | 4 | 0;

export interface PriorityEvaluationResult {
  priority: PriorityLevel;
  priorityScore: number;
  tier: PriorityTier;
  interpretation: string;
  /** Qué hacer, en una frase corta y accionable. */
  action: string;
  color: string;
  softBg: string;
  borderColor: string;
  chipClass: string;
  /** Alias mantenidos por compatibilidad con vistas previas. */
  dotColor: string;
  quadrantName: string;
  quadrantKey: "top_right" | "top_left" | "bottom_right" | "bottom_left" | "none";
  xScore: number; // Impacto del stakeholder sobre el emprendimiento (1 a 3)
  yScore: number; // Importancia para el emprendimiento (1 a 3)
  zScore: number; // Impacto del emprendimiento sobre el stakeholder (1 a 3)
  recommendation: string;
}

interface TierStyle {
  color: string;
  softBg: string;
  borderColor: string;
  chipClass: string;
}

/** Paleta sobria: cálido = urgente, frío = tranquilo. Se usa igual en web y PDF. */
export const TIER_STYLES: Record<Exclude<PriorityTier, 0>, TierStyle> = {
  1: {
    color: "#9B3B31",
    softBg: "#FBF1EF",
    borderColor: "#E8CFCA",
    chipClass: "bg-[#FBF1EF] text-[#8A342B] border-[#E8CFCA]",
  },
  2: {
    color: "#A9762B",
    softBg: "#FBF4E8",
    borderColor: "#EADAB9",
    chipClass: "bg-[#FBF4E8] text-[#8C6222] border-[#EADAB9]",
  },
  3: {
    color: "#3F6E86",
    softBg: "#EEF4F7",
    borderColor: "#CBDCE4",
    chipClass: "bg-[#EEF4F7] text-[#365E73] border-[#CBDCE4]",
  },
  4: {
    color: "#78857C",
    softBg: "#F2F4F2",
    borderColor: "#DCE1DC",
    chipClass: "bg-[#F2F4F2] text-[#5F6B63] border-[#DCE1DC]",
  },
};

const NEUTRAL_STYLE: TierStyle = {
  color: "#A8A29E",
  softBg: "#F5F5F4",
  borderColor: "#E7E5E4",
  chipClass: "bg-[#F5F5F4] text-[#78716C] border-[#E7E5E4]",
};

export function scoreFromLevel(level?: string | null): number {
  if (!level) return 0;
  if (level === "Muy importante" || level === "Alto impacto" || level === "Alto") return 3;
  if (level === "Medianamente importante" || level === "Impacto medio" || level === "Medio") return 2;
  if (level === "Poco importante" || level === "Bajo impacto" || level === "Bajo") return 1;
  return 0;
}

/** Etiqueta corta para ejes y tablas ("Alta", "Media", "Baja"). */
export function shortLevelLabel(level?: string | null): string {
  const score = scoreFromLevel(level);
  if (score === 3) return "Alto";
  if (score === 2) return "Medio";
  if (score === 1) return "Bajo";
  return "—";
}

interface PriorityRule {
  priority: PriorityLevel;
  priorityScore: number;
  tier: Exclude<PriorityTier, 0>;
  interpretation: string;
  action: string;
  quadrantName: string;
  quadrantKey: PriorityEvaluationResult["quadrantKey"];
}

/**
 * Tabla exacta del requerimiento (sección 9): la prioridad depende de la
 * Importancia (eje Y) y del Impacto del stakeholder sobre el emprendimiento (eje X).
 * La clave es `importancia_impacto`, ambos de 1 (bajo) a 3 (alto).
 */
const PRIORITY_RULES: Record<string, PriorityRule> = {
  "3_3": {
    priority: "Prioridad máxima",
    priorityScore: 6,
    tier: 1,
    interpretation: "Stakeholder crítico para gestionar",
    action: "Habla con ellos de forma constante y planificada.",
    quadrantName: "Gestionar de cerca",
    quadrantKey: "top_right",
  },
  "3_2": {
    priority: "Prioritario",
    priorityScore: 5,
    tier: 2,
    interpretation: "Requiere atención y seguimiento",
    action: "Mantén contacto regular y anticipa sus necesidades.",
    quadrantName: "Mantener satisfecho",
    quadrantKey: "top_right",
  },
  "3_1": {
    priority: "Gestionar",
    priorityScore: 4,
    tier: 3,
    interpretation: "Importante, aunque su capacidad de impacto es menor",
    action: "Cuida la relación sin destinarle demasiados recursos.",
    quadrantName: "Mantener satisfecho",
    quadrantKey: "top_left",
  },
  "2_3": {
    priority: "Prioritario",
    priorityScore: 5,
    tier: 2,
    interpretation: "Puede afectar significativamente al negocio",
    action: "Mantenlo informado: puede cambiar el rumbo del negocio.",
    quadrantName: "Mantener informado",
    quadrantKey: "bottom_right",
  },
  "2_2": {
    priority: "Gestionar",
    priorityScore: 4,
    tier: 3,
    interpretation: "Requiere seguimiento",
    action: "Revisa la relación cada cierto tiempo.",
    quadrantName: "Gestionar con esfuerzo moderado",
    quadrantKey: "bottom_left",
  },
  "2_1": {
    priority: "Monitorear",
    priorityScore: 2,
    tier: 4,
    interpretation: "Mantener observado",
    action: "Basta con revisarlo de vez en cuando.",
    quadrantName: "Monitorear",
    quadrantKey: "bottom_left",
  },
  "1_3": {
    priority: "Observar",
    priorityScore: 3,
    tier: 3,
    interpretation: "Puede generar impactos relevantes",
    action: "Vigílalo: hoy pesa poco, pero puede impactar fuerte.",
    quadrantName: "Mantener informado",
    quadrantKey: "bottom_right",
  },
  "1_2": {
    priority: "Monitorear",
    priorityScore: 2,
    tier: 4,
    interpretation: "Seguimiento ocasional",
    action: "Revísalo cuando ocurran cambios importantes.",
    quadrantName: "Monitorear",
    quadrantKey: "bottom_left",
  },
  "1_1": {
    priority: "Baja prioridad",
    priorityScore: 1,
    tier: 4,
    interpretation: "Mantener identificado",
    action: "Déjalo registrado y sigue adelante.",
    quadrantName: "Bajo esfuerzo",
    quadrantKey: "bottom_left",
  },
};

export function calculateStakeholderPriority(
  importance?: ImportanceLevel | string | null,
  impactOnVenture?: ImpactLevel | string | null,
  impactOfVenture?: ImpactLevel | string | null,
  stakeholderName?: string
): PriorityEvaluationResult {
  const yVal = scoreFromLevel(importance); // Importancia
  const xVal = scoreFromLevel(impactOnVenture); // Impacto sobre el emprendimiento
  const zVal = scoreFromLevel(impactOfVenture); // Impacto del emprendimiento

  const rule = PRIORITY_RULES[`${yVal}_${xVal}`];

  if (!rule) {
    return {
      priority: "No aplica",
      priorityScore: 0,
      tier: 0,
      interpretation: "Sin relación o sin evaluar",
      action: "No requiere gestión por ahora.",
      ...NEUTRAL_STYLE,
      dotColor: NEUTRAL_STYLE.color,
      quadrantName: "No evaluado",
      quadrantKey: "none",
      xScore: xVal,
      yScore: yVal,
      zScore: zVal,
      recommendation:
        "Este grupo de interés no tiene relación activa con el emprendimiento en este momento.",
    };
  }

  const style = TIER_STYLES[rule.tier];

  return {
    priority: rule.priority,
    priorityScore: rule.priorityScore,
    tier: rule.tier,
    interpretation: rule.interpretation,
    action: rule.action,
    ...style,
    dotColor: style.color,
    quadrantName: rule.quadrantName,
    quadrantKey: rule.quadrantKey,
    xScore: xVal,
    yScore: yVal,
    zScore: zVal,
    recommendation: generateTailoredRecommendation(
      stakeholderName || "Este grupo de interés",
      rule.priority,
      impactOfVenture
    ),
  };
}

const HIGH_PRIORITIES: PriorityLevel[] = ["Prioridad máxima", "Prioritario"];

function generateTailoredRecommendation(
  name: string,
  priority: PriorityLevel,
  impactOfVenture?: string | null
): string {
  const n = name.toLowerCase();
  const isHigh = HIGH_PRIORITIES.includes(priority);

  if (n.includes("cliente")) {
    return isHigh
      ? "Tus clientes son clave y pueden cambiar los resultados del negocio. Habla con ellos seguido, pregúntales qué necesitan y usa sus comentarios para tomar decisiones."
      : "Mantén abiertos los canales para escuchar a tus clientes y explicarles con claridad qué hace distinta a tu propuesta.";
  }

  if (n.includes("trabajador") || n.includes("colaborador") || n.includes("equipo")) {
    return isHigh
      ? "Tu equipo sostiene la operación del día a día. Asegura condiciones de trabajo justas, comunica hacia dónde va el negocio y capacítalo en las prácticas que quieres instalar."
      : "Genera espacios de conversación con tu equipo y reconoce sus aportes al proyecto.";
  }

  if (n.includes("proveedor")) {
    return isHigh
      ? "Tus proveedores definen la calidad y el costo de lo que entregas. Trabaja con acuerdos claros, ten alternativas para no depender de uno solo y prioriza proveedores locales o de menor impacto ambiental."
      : "Revisa cada cierto tiempo precios, plazos de entrega y alternativas de insumos más sostenibles.";
  }

  if (n.includes("medioambiente") || n.includes("ambiente") || n.includes("planeta")) {
    return impactOfVenture === "Alto impacto" || isHigh
      ? "El medioambiente recibe un impacto alto de tu operación. Mide lo que puedas (residuos, agua, energía, emisiones), reduce lo que sea evitable y comunica esos avances con datos concretos."
      : "Revisa periódicamente cómo manejas residuos, agua y energía para evitar impactos que hoy no ves.";
  }

  if (n.includes("socio") || n.includes("propietario") || n.includes("inversor")) {
    return "Mantén reuniones periódicas con tus socios o inversionistas para alinear metas, mostrar avances con transparencia y anticipar riesgos antes de que aparezcan.";
  }

  if (n.includes("banco") || n.includes("financier")) {
    return "Ordena tus números y tu historial de pagos. Tener la documentación al día te abre créditos, fondos públicos y mejores condiciones de financiamiento.";
  }

  if (n.includes("comunidad") || n.includes("vecin")) {
    return "Conversa temprano con tus vecinos y ten un canal claro para recibir inquietudes. Una buena relación con el entorno es lo que te permite operar sin conflictos.";
  }

  if (n.includes("regulador") || n.includes("estado") || n.includes("municip")) {
    return "Ten al día permisos, patentes y obligaciones. Cumplir a tiempo evita multas y te permite postular a programas de apoyo y compras públicas.";
  }

  if (n.includes("organizaciones sociales") || n.includes("ong") || n.includes("fundaci")) {
    return "Explora alianzas para llegar a más personas, validar tu propuesta en el territorio y sumar credibilidad a lo que haces.";
  }

  if (n.includes("educacional") || n.includes("universidad") || n.includes("instituto")) {
    return "Acércate a universidades o institutos para conseguir practicantes, apoyo técnico y pruebas que mejoren tu producto o servicio.";
  }

  if (n.includes("gremial") || n.includes("asociaci") || n.includes("cámara")) {
    return "Participa en redes del rubro: te dan contactos, información del mercado y más peso al momento de negociar.";
  }

  if (n.includes("competidor")) {
    return "Observa qué hacen tus competidores en precios, productos y comunicación para afinar lo que hace única a tu propuesta.";
  }

  if (priority === "Prioridad máxima") {
    return `${name} es determinante para tu negocio. Define quién se hace cargo de esa relación y con qué frecuencia van a conversar.`;
  }
  if (priority === "Prioritario") {
    return `${name} necesita atención preferente. Mantén una comunicación fluida para evitar sorpresas y aprovechar oportunidades.`;
  }
  if (priority === "Gestionar") {
    return `${name} aporta estabilidad al negocio. Gestiona la relación de forma planificada, sin sobrecargar tus recursos.`;
  }
  if (priority === "Observar") {
    return `${name} podría generar impactos importantes aunque hoy no sea central. Mantente atento a cambios en su comportamiento.`;
  }
  if (priority === "Monitorear") {
    return `${name} requiere seguimiento ocasional. Contáctalo cuando ocurra algo relevante en el emprendimiento.`;
  }

  return `${name} queda identificado con baja necesidad de gestión. Revisa más adelante si su rol cambia.`;
}

/**
 * Explica en una frase por qué un stakeholder quedó en ese nivel de prioridad,
 * nombrando las dos variables que lo determinan (sección 10 del requerimiento).
 */
export function explainPriority(result: PriorityEvaluationResult): string {
  if (result.tier === 0) return "";

  const importancia = result.yScore === 3 ? "alta" : result.yScore === 2 ? "media" : "baja";
  const impacto = result.xScore === 3 ? "alto" : result.xScore === 2 ? "medio" : "bajo";

  return `Queda en “${result.priority}” porque su importancia para tu emprendimiento es ${importancia} y el impacto que puede generar sobre él es ${impacto}.`;
}

/** Recomendaciones generales del informe (sección 12 del requerimiento). */
export const GENERAL_RECOMMENDATIONS: string[] = [
  "Empieza por los stakeholders de prioridad máxima: son pocos y concentran la mayor parte del riesgo y de las oportunidades.",
  "Define para cada uno quién se hace cargo de la relación y cada cuánto tiempo van a conversar.",
  "Escucha antes de comunicar: pregunta qué esperan de tu emprendimiento y anota los compromisos que asumes.",
  "Revisa este análisis al menos una vez al año, o cada vez que tu negocio cambie de tamaño, de rubro o de lugar.",
  "Presta atención especial a los grupos sobre los que tu negocio genera un impacto alto: ahí está tu responsabilidad y también tu mejor historia que contar.",
];
