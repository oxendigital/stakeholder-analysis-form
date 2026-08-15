import jsPDF from "jspdf";
import {
  calculateStakeholderPriority,
  explainPriority,
  shortLevelLabel,
  GENERAL_RECOMMENDATIONS,
} from "@/lib/matrix-calculations";
import { plotStakeholders, MatrixPoint } from "@/lib/matrix-layout";

export interface ReportVenture {
  ventureName: string;
  entrepreneurName: string;
  industry: string;
  date: string;
  notes?: string;
}

export interface ReportAnswer {
  stakeholderKey: string;
  stakeholderName: string;
  category?: string;
  isRelated: boolean | null;
  importance: string | null;
  impactOnVenture: string | null;
  impactOfVenture: string | null;
  notes?: string;
}

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN_X = 16;
const MARGIN_TOP = 20;
const MARGIN_BOTTOM = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

const INK: RGB = [28, 25, 23];
const MUTED: RGB = [120, 113, 108];
const LINE: RGB = [225, 223, 221];
const BRAND: RGB = [46, 107, 82];
const SOFT: RGB = [247, 246, 244];

type RGB = [number, number, number];

function hexToRgb(hex: string): RGB {
  const value = hex.replace("#", "");
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

function formatDate(value: string): string {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value || "";
  return parsed.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Construye el informe en PDF dibujándolo con las primitivas de jsPDF (texto,
 * líneas y figuras). Se genera de forma vectorial a propósito: el texto queda
 * seleccionable, el peso del archivo es bajo y no depende de capturar el DOM,
 * que es frágil frente a los colores modernos de CSS.
 */
export function buildStakeholderReport(
  venture: ReportVenture,
  answers: ReportAnswer[]
): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const plotted = plotStakeholders(answers);
  const notRelated = answers.filter((a) => a.isRelated === false);

  let y = MARGIN_TOP;

  const ensureSpace = (height: number) => {
    if (y + height <= PAGE_HEIGHT - MARGIN_BOTTOM) return;
    doc.addPage();
    y = MARGIN_TOP;
  };

  const setText = (size: number, color: RGB = INK, style: "normal" | "bold" = "normal") => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
  };

  const sectionTitle = (title: string) => {
    ensureSpace(18);
    y += 4;
    setText(8, BRAND, "bold");
    doc.text(title.toUpperCase(), MARGIN_X, y);
    y += 2.5;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.2);
    doc.line(MARGIN_X, y, PAGE_WIDTH - MARGIN_X, y);
    y += 6;
  };

  const paragraph = (text: string, size = 9.5, color: RGB = INK, indent = 0) => {
    setText(size, color);
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH - indent) as string[];
    const lineHeight = size * 0.48;
    lines.forEach((line) => {
      ensureSpace(lineHeight);
      doc.text(line, MARGIN_X + indent, y);
      y += lineHeight;
    });
  };

  // ---------------------------------------------------------------- Portada
  setText(8, BRAND, "bold");
  doc.text("EMPRENDE CLIMA", MARGIN_X, y);
  y += 9;

  setText(20, INK, "bold");
  doc.text("Análisis de stakeholders", MARGIN_X, y);
  y += 8;

  setText(11, MUTED);
  const subtitle = doc.splitTextToSize(
    `${venture.ventureName || "Emprendimiento"} · ${formatDate(venture.date)}`,
    CONTENT_WIDTH
  ) as string[];
  subtitle.forEach((line) => {
    doc.text(line, MARGIN_X, y);
    y += 5.5;
  });

  y += 2;
  doc.setDrawColor(...BRAND);
  doc.setLineWidth(0.6);
  doc.line(MARGIN_X, y, MARGIN_X + 24, y);
  y += 8;

  // ------------------------------------------------- Datos del emprendimiento
  sectionTitle("1. Datos del emprendimiento");

  const fields: [string, string][] = [
    ["Emprendimiento", venture.ventureName || "-"],
    ["Emprendedor/a", venture.entrepreneurName || "-"],
    ["Rubro o actividad", venture.industry || "-"],
    ["Fecha", formatDate(venture.date)],
  ];

  fields.forEach(([label, value]) => {
    ensureSpace(7);
    setText(8.5, MUTED);
    doc.text(label, MARGIN_X, y);
    setText(10, INK);
    doc.text(doc.splitTextToSize(value, CONTENT_WIDTH - 45)[0], MARGIN_X + 45, y);
    y += 6.5;
  });

  if (venture.notes) {
    y += 1;
    setText(8.5, MUTED);
    doc.text("Descripción", MARGIN_X, y);
    const lines = doc.splitTextToSize(venture.notes, CONTENT_WIDTH - 45) as string[];
    setText(10, INK);
    lines.forEach((line, index) => {
      ensureSpace(5);
      doc.text(line, MARGIN_X + 45, y);
      if (index < lines.length - 1) y += 5;
    });
    y += 6.5;
  }

  // --------------------------------------------------------------- Resumen
  sectionTitle("2. Resumen");

  const counts = [
    {
      label: "Grupos identificados",
      value: plotted.length,
      color: INK,
    },
    {
      label: "Prioridad máxima",
      value: plotted.filter((p) => p.calc.priority === "Prioridad máxima").length,
      color: hexToRgb("#9B3B31"),
    },
    {
      label: "Prioritarios",
      value: plotted.filter((p) => p.calc.priority === "Prioritario").length,
      color: hexToRgb("#A9762B"),
    },
    {
      label: "Seguimiento",
      value: plotted.filter((p) =>
        ["Gestionar", "Observar", "Monitorear", "Baja prioridad"].includes(p.calc.priority)
      ).length,
      color: hexToRgb("#3F6E86"),
    },
  ];

  ensureSpace(24);
  const boxWidth = (CONTENT_WIDTH - 6) / 4;
  counts.forEach((item, index) => {
    const x = MARGIN_X + index * (boxWidth + 2);
    doc.setFillColor(...SOFT);
    doc.roundedRect(x, y, boxWidth, 20, 1.5, 1.5, "F");
    setText(18, item.color, "bold");
    doc.text(String(item.value), x + 4, y + 10);
    setText(7.5, MUTED);
    const label = doc.splitTextToSize(item.label, boxWidth - 8) as string[];
    doc.text(label[0], x + 4, y + 15.5);
    if (label[1]) doc.text(label[1], x + 4, y + 18.5);
  });
  y += 26;

  if (notRelated.length > 0) {
    paragraph(
      notRelated.length === 1
        ? "1 grupo consultado no tiene relación con el emprendimiento y quedó fuera del análisis."
        : `${notRelated.length} grupos consultados no tienen relación con el emprendimiento y quedaron fuera del análisis.`,
      9,
      MUTED
    );
    y += 2;
  }

  // ---------------------------------------------------------------- Matriz
  if (plotted.length > 0) {
    sectionTitle("3. Matriz de stakeholders");
    drawMatrix(doc, plotted, () => y, (next) => (y = next), ensureSpace);
  }

  // ---------------------------------------------------------------- Listado
  sectionTitle("4. Listado y nivel de prioridad");

  const columns = [
    { title: "#", width: 8 },
    { title: "Grupo de interés", width: 52 },
    { title: "Importancia", width: 24 },
    { title: "Impacto en ti", width: 24 },
    { title: "Tu impacto", width: 24 },
    { title: "Prioridad", width: 46 },
  ];

  const drawTableHeader = () => {
    ensureSpace(10);
    doc.setFillColor(...SOFT);
    doc.rect(MARGIN_X, y - 4, CONTENT_WIDTH, 7, "F");
    setText(7.5, MUTED, "bold");
    let x = MARGIN_X + 2;
    columns.forEach((column) => {
      doc.text(column.title.toUpperCase(), x, y);
      x += column.width;
    });
    y += 6;
  };

  drawTableHeader();

  plotted.forEach((item) => {
    // El nombre se dibuja en negrita: hay que medirlo con esa misma tipografía
    // o el texto se sale de su columna.
    setText(9, INK, "bold");
    const nameLines = doc.splitTextToSize(
      item.answer.stakeholderName,
      columns[1].width - 3
    ) as string[];
    const rowHeight = Math.max(7, nameLines.length * 4.2 + 3);

    if (y + rowHeight > PAGE_HEIGHT - MARGIN_BOTTOM) {
      doc.addPage();
      y = MARGIN_TOP;
      drawTableHeader();
    }

    let x = MARGIN_X + 2;

    setText(8.5, MUTED);
    doc.text(String(item.index), x, y);
    x += columns[0].width;

    setText(9, INK, "bold");
    nameLines.forEach((line, index) => {
      doc.text(line, x, y + index * 4.2);
    });
    x += columns[1].width;

    setText(9, INK);
    doc.text(shortLevelLabel(item.answer.importance), x, y);
    x += columns[2].width;
    doc.text(shortLevelLabel(item.answer.impactOnVenture), x, y);
    x += columns[3].width;
    doc.text(shortLevelLabel(item.answer.impactOfVenture), x, y);
    x += columns[4].width;

    doc.setFillColor(...hexToRgb(item.calc.color));
    doc.circle(x + 1.4, y - 1.2, 1.4, "F");
    setText(9, hexToRgb(item.calc.color), "bold");
    doc.text(item.calc.priority, x + 4.5, y);

    y += rowHeight;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.15);
    doc.line(MARGIN_X, y - 3.5, PAGE_WIDTH - MARGIN_X, y - 3.5);
  });

  y += 2;

  // ------------------------------------------------------- Recomendaciones
  sectionTitle("5. Qué hacer con cada grupo");

  plotted.forEach((item) => {
    ensureSpace(20);
    setText(10, INK, "bold");
    doc.text(`${item.index}. ${item.answer.stakeholderName}`, MARGIN_X, y);

    setText(9, hexToRgb(item.calc.color), "bold");
    doc.text(item.calc.priority, PAGE_WIDTH - MARGIN_X, y, { align: "right" });
    y += 5;

    paragraph(explainPriority(item.calc), 8.5, MUTED);
    y += 1;
    paragraph(item.calc.recommendation, 9, [70, 66, 62]);

    if (item.answer.notes) {
      paragraph(`Tu nota: ${item.answer.notes}`, 8.5, MUTED);
    }
    y += 4;
  });

  // ------------------------------------------------ Recomendaciones generales
  sectionTitle("6. Recomendaciones generales");

  GENERAL_RECOMMENDATIONS.forEach((recommendation) => {
    ensureSpace(10);
    doc.setFillColor(...BRAND);
    doc.circle(MARGIN_X + 1, y - 1.2, 0.8, "F");
    paragraph(recommendation, 9, [70, 66, 62], 5);
    y += 2.5;
  });

  // ------------------------------------------------------ Grupos sin relación
  if (notRelated.length > 0) {
    sectionTitle("7. Grupos sin relación con el emprendimiento");
    paragraph(notRelated.map((a) => a.stakeholderName).join(", ") + ".", 9, MUTED);
  }

  // ------------------------------------------------------------ Pie de página
  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.2);
    doc.line(MARGIN_X, PAGE_HEIGHT - 14, PAGE_WIDTH - MARGIN_X, PAGE_HEIGHT - 14);
    setText(7.5, MUTED);
    doc.text("Emprende Clima · Análisis de stakeholders", MARGIN_X, PAGE_HEIGHT - 10);
    doc.text(`${page} / ${totalPages}`, PAGE_WIDTH - MARGIN_X, PAGE_HEIGHT - 10, {
      align: "right",
    });
  }

  return doc;
}

function drawMatrix(
  doc: jsPDF,
  plotted: MatrixPoint<ReportAnswer>[],
  getY: () => number,
  setY: (value: number) => void,
  ensureSpace: (height: number) => void
) {
  const plotWidth = 130;
  const plotHeight = 92;
  const axisGutter = 20;
  const totalHeight = plotHeight + 16;

  ensureSpace(totalHeight);
  const top = getY();
  const left = MARGIN_X + axisGutter;
  const cellWidth = plotWidth / 3;
  const cellHeight = plotHeight / 3;

  // Casillas teñidas según la prioridad que representa cada combinación
  const importanceLevels = ["Muy importante", "Medianamente importante", "Poco importante"];
  const impactLevels = ["Bajo impacto", "Impacto medio", "Alto impacto"];

  importanceLevels.forEach((importance, row) => {
    impactLevels.forEach((impact, column) => {
      const calc = calculateStakeholderPriority(importance, impact);
      doc.setFillColor(...hexToRgb(calc.softBg));
      doc.rect(
        left + column * cellWidth,
        top + row * cellHeight,
        cellWidth,
        cellHeight,
        "F"
      );
    });
  });

  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.2);
  for (let i = 0; i <= 3; i += 1) {
    doc.line(left + i * cellWidth, top, left + i * cellWidth, top + plotHeight);
    doc.line(left, top + i * cellHeight, left + plotWidth, top + i * cellHeight);
  }

  // Etiquetas de los ejes
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);

  ["Alta", "Media", "Baja"].forEach((label, row) => {
    doc.text(label, left - 2, top + row * cellHeight + cellHeight / 2 + 1, {
      align: "right",
    });
  });

  ["Bajo", "Medio", "Alto"].forEach((label, column) => {
    doc.text(label, left + column * cellWidth + cellWidth / 2, top + plotHeight + 4.5, {
      align: "center",
    });
  });

  doc.setFontSize(7);
  doc.text("IMPORTANCIA", MARGIN_X - 2, top + plotHeight / 2, {
    align: "center",
    angle: 90,
  });
  doc.text("IMPACTO SOBRE TU NEGOCIO", left + plotWidth / 2, top + plotHeight + 10, {
    align: "center",
  });

  // Puntos numerados
  plotted.forEach((item) => {
    const cx = left + (item.left / 100) * plotWidth;
    const cy = top + (item.top / 100) * plotHeight;

    doc.setFillColor(...hexToRgb(item.calc.color));
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.circle(cx, cy, 3.1, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(String(item.index), cx, cy + 1.1, { align: "center" });
  });

  setY(top + totalHeight);
}

export function reportFileName(ventureName: string): string {
  const safeName = (ventureName || "emprendimiento")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return `analisis-stakeholders-${safeName || "emprendimiento"}.pdf`;
}
