export type ImportanceLevel = "Poco importante" | "Medianamente importante" | "Muy importante";
export type ImpactLevel = "Bajo impacto" | "Impacto medio" | "Alto impacto";
export type PriorityLevel =
  | "Prioridad máxima"
  | "Prioritario"
  | "Gestionar"
  | "Observar"
  | "Monitorear"
  | "Baja prioridad"
  | "No aplica";

export interface PriorityEvaluationResult {
  priority: PriorityLevel;
  priorityScore: number;
  interpretation: string;
  badgeVariant: "destructive" | "warning" | "amber" | "blue" | "purple" | "slate" | "secondary";
  badgeClass: string;
  badgeBg: string;
  dotColor: string;
  quadrantName: string;
  quadrantKey: "top_right" | "top_left" | "bottom_right" | "bottom_left" | "none";
  xScore: number; // 1 to 3
  yScore: number; // 1 to 3
  zScore: number; // Impact of venture 1 to 3
  recommendation: string;
}

export function scoreFromLevel(level?: string | null): number {
  if (!level) return 0;
  if (level === "Muy importante" || level === "Alto impacto" || level === "Alto") return 3;
  if (level === "Medianamente importante" || level === "Impacto medio" || level === "Medio") return 2;
  if (level === "Poco importante" || level === "Bajo impacto" || level === "Bajo") return 1;
  return 0;
}

export function calculateStakeholderPriority(
  importance?: ImportanceLevel | string | null,
  impactOnVenture?: ImpactLevel | string | null,
  impactOfVenture?: ImpactLevel | string | null,
  stakeholderName?: string
): PriorityEvaluationResult {
  if (!importance || !impactOnVenture) {
    return {
      priority: "No aplica",
      priorityScore: 0,
      interpretation: "Sin relación o no evaluado",
      badgeVariant: "secondary",
      badgeClass: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300",
      badgeBg: "#F4F4F5",
      dotColor: "#71717A",
      quadrantName: "No evaluado",
      quadrantKey: "none",
      xScore: 0,
      yScore: 0,
      zScore: 0,
      recommendation: "Este stakeholder no tiene relación activa con el emprendimiento actualmente.",
    };
  }

  const yVal = scoreFromLevel(importance); // 1 = Baja, 2 = Media, 3 = Alta
  const xVal = scoreFromLevel(impactOnVenture); // 1 = Bajo, 2 = Medio, 3 = Alto
  const zVal = scoreFromLevel(impactOfVenture); // 1 = Bajo, 2 = Medio, 3 = Alto

  // Priority matrix mapping exact from requirement document:
  // Alta (3) + Alto (3) => Prioridad máxima (Stakeholder crítico para gestionar)
  // Alta (3) + Medio (2) => Prioritario (Requiere atención y seguimiento)
  // Alta (3) + Bajo (1) => Gestionar (Importante, aunque su capacidad de impacto es menor)
  // Media (2) + Alto (3) => Prioritario (Puede afectar significativamente al negocio)
  // Media (2) + Medio (2) => Gestionar (Requiere seguimiento)
  // Media (2) + Bajo (1) => Monitorear (Mantener observado)
  // Baja (1) + Alto (3) => Observar (Puede generar impactos relevantes)
  // Baja (1) + Medio (2) => Monitorear (Seguimiento ocasional)
  // Baja (1) + Bajo (1) => Baja prioridad (Mantener identificado)

  let priority: PriorityLevel = "Baja prioridad";
  let priorityScore = 1;
  let interpretation = "Mantener identificado";
  let badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300";
  let badgeBg = "#10B981";
  let dotColor = "#059669";
  let badgeVariant: PriorityEvaluationResult["badgeVariant"] = "slate";
  let quadrantName = "Bajo esfuerzo / Monitoreo básico";
  let quadrantKey: PriorityEvaluationResult["quadrantKey"] = "bottom_left";

  if (yVal === 3 && xVal === 3) {
    priority = "Prioridad máxima";
    priorityScore = 6;
    interpretation = "Stakeholder crítico para gestionar";
    badgeClass = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300";
    badgeBg = "#F43F5E";
    dotColor = "#E11D48";
    badgeVariant = "destructive";
    quadrantName = "Gestionar de cerca / Alianza crítica";
    quadrantKey = "top_right";
  } else if (yVal === 3 && xVal === 2) {
    priority = "Prioritario";
    priorityScore = 5;
    interpretation = "Requiere atención y seguimiento";
    badgeClass = "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300";
    badgeBg = "#F59E0B";
    dotColor = "#D97706";
    badgeVariant = "warning";
    quadrantName = "Gestionar de cerca / Mantener satisfecho";
    quadrantKey = "top_right";
  } else if (yVal === 3 && xVal === 1) {
    priority = "Gestionar";
    priorityScore = 4;
    interpretation = "Importante, aunque su capacidad de impacto es menor";
    badgeClass = "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300";
    badgeBg = "#EAB308";
    dotColor = "#CA8A04";
    badgeVariant = "amber";
    quadrantName = "Mantener satisfecho / Colaboración";
    quadrantKey = "top_left";
  } else if (yVal === 2 && xVal === 3) {
    priority = "Prioritario";
    priorityScore = 5;
    interpretation = "Puede afectar significativamente al negocio";
    badgeClass = "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300";
    badgeBg = "#F59E0B";
    dotColor = "#D97706";
    badgeVariant = "warning";
    quadrantName = "Mantener informado y vigilante";
    quadrantKey = "bottom_right";
  } else if (yVal === 2 && xVal === 2) {
    priority = "Gestionar";
    priorityScore = 4;
    interpretation = "Requiere seguimiento regular";
    badgeClass = "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300";
    badgeBg = "#EAB308";
    dotColor = "#CA8A04";
    badgeVariant = "amber";
    quadrantName = "Gestionar con esfuerzo moderado";
    quadrantKey = "top_right";
  } else if (yVal === 2 && xVal === 1) {
    priority = "Monitorear";
    priorityScore = 2;
    interpretation = "Mantener observado";
    badgeClass = "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300";
    badgeBg = "#0EA5E9";
    dotColor = "#0284C7";
    badgeVariant = "blue";
    quadrantName = "Monitorear periódicamente";
    quadrantKey = "bottom_left";
  } else if (yVal === 1 && xVal === 3) {
    priority = "Observar";
    priorityScore = 3;
    interpretation = "Puede generar impactos relevantes";
    badgeClass = "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300";
    badgeBg = "#A855F7";
    dotColor = "#9333EA";
    badgeVariant = "purple";
    quadrantName = "Mantener informado / Prevenir riesgos";
    quadrantKey = "bottom_right";
  } else if (yVal === 1 && xVal === 2) {
    priority = "Monitorear";
    priorityScore = 2;
    interpretation = "Seguimiento ocasional";
    badgeClass = "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300";
    badgeBg = "#0EA5E9";
    dotColor = "#0284C7";
    badgeVariant = "blue";
    quadrantName = "Monitoreo con bajo esfuerzo";
    quadrantKey = "bottom_left";
  } else {
    // 1 and 1
    priority = "Baja prioridad";
    priorityScore = 1;
    interpretation = "Mantener identificado";
    badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300";
    badgeBg = "#10B981";
    dotColor = "#059669";
    badgeVariant = "slate";
    quadrantName = "Bajo esfuerzo / Registro preventivo";
    quadrantKey = "bottom_left";
  }

  // Build tailored recommendation:
  const recommendation = generateTailoredRecommendation(
    stakeholderName || "Este stakeholder",
    priority,
    importance,
    impactOnVenture,
    impactOfVenture
  );

  return {
    priority,
    priorityScore,
    interpretation,
    badgeVariant,
    badgeClass,
    badgeBg,
    dotColor,
    quadrantName,
    quadrantKey,
    xScore: xVal,
    yScore: yVal,
    zScore: zVal,
    recommendation,
  };
}

function generateTailoredRecommendation(
  name: string,
  priority: PriorityLevel,
  importance: string,
  impactOnVenture: string,
  impactOfVenture?: string | null
): string {
  const nameLower = name.toLowerCase();

  if (nameLower.includes("cliente")) {
    if (priority === "Prioridad máxima" || priority === "Prioritario") {
      return "Los clientes son un stakeholder crítico para tu emprendimiento. Tienen una alta importancia para el funcionamiento del negocio y pueden generar un impacto significativo sobre sus resultados. Se recomienda mantener una comunicación permanente, medir su satisfacción periódica, co-diseñar soluciones sostenibles y considerar sus opiniones en la toma de decisiones estratégicas.";
    }
    return "Mantener canales de retroalimentación claros y transparentes sobre los beneficios ambientales y de valor de tu propuesta comercial.";
  }

  if (nameLower.includes("trabajador") || nameLower.includes("colaborador") || nameLower.includes("equipo")) {
    if (priority === "Prioridad máxima" || priority === "Prioritario") {
      return "Tu equipo humano es el motor operativo y el principal embajador de tu propósito climático. Es fundamental asegurar condiciones laborales justas, un clima de seguridad y capacitación constante en procesos sostenibles para potenciar el compromiso y la retención del talento.";
    }
    return "Fomentar espacios de escucha activa, ergonomía laboral y reconocimiento a los aportes en sostenibilidad del equipo.";
  }

  if (nameLower.includes("proveedor")) {
    if (priority === "Prioridad máxima" || priority === "Prioritario") {
      return "Tus proveedores determinan la calidad, trazabilidad y huella ambiental de tu cadena de valor. Establece relaciones de confianza a largo plazo, define criterios de compras sustentables y genera acuerdos de abastecimiento local o circular para blindar tu operación.";
    }
    return "Verificar periódicamente tiempos de entrega, alternativas de insumos ecológicos y condiciones comerciales justas.";
  }

  if (nameLower.includes("medioambiente") || nameLower.includes("ambiente") || nameLower.includes("planeta")) {
    if (impactOfVenture === "Alto impacto" || priority === "Prioridad máxima") {
      return "El medioambiente es el pilar central de Emprende Clima. Tu emprendimiento genera y recibe un alto impacto ecológico. Es prioritario cuantificar tus métricas de impacto positivo (CO2 evitado, residuos revalorizados, agua ahorrada) y utilizarlas como ventaja competitiva transparente.";
    }
    return "Monitorear continuamente la gestión de residuos, eficiencia energética y materiales para asegurar un ciclo de vida limpio.";
  }

  if (nameLower.includes("socio") || nameLower.includes("propietario") || nameLower.includes("inversor")) {
    return "Mantener alineamiento periódico sobre los objetivos financieros y de impacto socioambiental. Informar con transparencia el avance de metas y riesgos.";
  }

  if (nameLower.includes("banco") || nameLower.includes("financier")) {
    return "Construir un historial crediticio sólido y preparar documentación con indicadores de sostenibilidad para postular a fondos públicos (Corfo/Sercotec) y líneas de financiamiento verde con tasas preferenciales.";
  }

  if (nameLower.includes("comunidad") || nameLower.includes("vecin")) {
    return "Generar instancias de diálogo temprano y canales abiertos para resolver inquietudes. Tu legitimidad territorial y licencia social para operar dependen de una relación armónica y transparente con el entorno inmediato.";
  }

  if (nameLower.includes("regulador") || nameLower.includes("estado") || nameLower.includes("municip")) {
    return "Mantener al día la matriz de cumplimiento normativo (permisos, patentes, Ley REP, sanidad). Anticípate a futuras regulaciones ambientales que puedan abrir oportunidades de compras públicas.";
  }

  if (nameLower.includes("organizaciones sociales") || nameLower.includes("ong")) {
    return "Explorar alianzas de co-creación, validación comunitaria y visibilidad en campañas de sensibilización ciudadana.";
  }

  if (nameLower.includes("educacional") || nameLower.includes("universidad")) {
    return "Vincular el emprendimiento a tesistas, prácticas profesionales y convocatorias de I+D aplicada para testear mejoras técnicas en tus productos o servicios.";
  }

  if (nameLower.includes("gremial") || nameLower.includes("asociaci")) {
    return "Participar activamente en redes sectoriales para fortalecer tu red de contactos, generar compras asociativas e influir en políticas públicas del sector verde.";
  }

  if (nameLower.includes("competidor")) {
    return "Monitorear movimientos de precios, innovaciones en empaques o certificaciones de la competencia para destacar tu propuesta de valor y atributos climáticos únicos.";
  }

  // Generic fallback based on priority
  if (priority === "Prioridad máxima") {
    return `${name} es un stakeholder crítico para tu negocio. Requiere una estrategia activa de gestión, contacto directo periódico y análisis conjunto de riesgos y oportunidades operativas.`;
  }
  if (priority === "Prioritario") {
    return `${name} requiere atención preferente y seguimiento estructurado. Mantén comunicación fluida para prevenir contingencias y aprovechar sinergias.`;
  }
  if (priority === "Gestionar") {
    return `${name} es importante para la estabilidad del negocio. Gestiona sus expectativas de manera planificada sin sobrecargar recursos.`;
  }
  if (priority === "Observar") {
    return `${name} puede generar impactos significativos aunque su importancia actual sea moderada. Mantén radares de alerta temprana ante cambios en su comportamiento.`;
  }
  if (priority === "Monitorear") {
    return `${name} requiere monitoreo periódico y comunicación oportuna cuando ocurran hitos relevantes en el emprendimiento.`;
  }

  return `${name} se mantiene identificado con bajo requerimiento de gestión activa. Revisa periódicamente si su rol cambia en etapas futuras de crecimiento.`;
}
