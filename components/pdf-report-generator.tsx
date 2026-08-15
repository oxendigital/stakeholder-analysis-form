"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Printer, CheckCircle2, Loader2, Sparkles, Leaf, FileText } from "lucide-react";
import { VentureData } from "./venture-initial-form";
import { StakeholderAnswer } from "./stakeholder-wizard";
import { calculateStakeholderPriority, scoreFromLevel } from "@/lib/matrix-calculations";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface PdfReportGeneratorProps {
  venture: VentureData;
  answers: StakeholderAnswer[];
}

export function PdfReportGenerator({ venture, answers }: PdfReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Active stakeholders sorted by priority descending
  const activeStakeholders = answers
    .filter((a) => a.isRelated === true && a.importance && a.impactOnVenture)
    .map((a) => ({
      ...a,
      calc: calculateStakeholderPriority(
        a.importance,
        a.impactOnVenture,
        a.impactOfVenture,
        a.stakeholderName
      ),
    }))
    .sort((a, b) => b.calc.priorityScore - a.calc.priorityScore);

  const nonRelatedStakeholders = answers.filter((a) => a.isRelated === false);

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);

    try {
      const element = reportRef.current;
      
      // Render canvas at high scale for crisp text and crisp charts
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add remaining pages if multi-page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const safeVentureName = (venture.ventureName || "Emprendimiento")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .toLowerCase();
      pdf.save(`Informe_Stakeholders_${safeVentureName}_Emprende_Clima.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      // Fallback to native print
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNativePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 print:hidden">
        <div>
          <h4 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <FileText className="size-4 text-emerald-600" />
            <span>Descarga de Informe en PDF</span>
          </h4>
          <p className="text-xs text-muted-foreground">
            Documento formal con membrete de Emprende Clima, datos del emprendedor, matriz 2D y tabla de prioridades.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleNativePrint}
            className="text-xs font-semibold"
          >
            <Printer className="size-3.5 mr-1.5" />
            Imprimir
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold shadow-md"
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                Generando PDF...
              </>
            ) : (
              <>
                <Download className="size-3.5 mr-1.5" />
                Descargar resultados en PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Printable Document Container (Styled clean for both PDF rendering and Print CSS) */}
      <div
        ref={reportRef}
        id="printable-report"
        className="mx-auto max-w-[850px] bg-white p-8 sm:p-10 text-zinc-900 shadow-xl border border-zinc-200 rounded-2xl print:border-none print:shadow-none print:p-0 print:m-0"
      >
        {/* Document Header */}
        <div className="border-b-2 border-emerald-700 pb-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-700 text-white">
                <Leaf className="size-7" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-emerald-950 uppercase">
                  INFORME DE ANÁLISIS DE STAKEHOLDERS
                </h1>
                <p className="text-xs font-semibold text-emerald-700">
                  Herramienta para Emprendedores · Emprende Clima
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-900">
                Documento Oficial
              </span>
              <p className="text-[11px] text-zinc-500 mt-1">
                Fecha: <strong>{venture.date || new Date().toLocaleDateString()}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Datos del Emprendimiento */}
        <div className="mt-6 rounded-xl bg-zinc-50 p-4 border border-zinc-200/80">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-3">
            1. Datos del Emprendimiento y Emprendedor
          </h2>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-zinc-500 block">Nombre del emprendimiento:</span>
              <strong className="text-sm font-bold text-zinc-900">{venture.ventureName}</strong>
            </div>
            <div>
              <span className="text-zinc-500 block">Nombre del emprendedor/a:</span>
              <strong className="text-sm font-bold text-zinc-900">{venture.entrepreneurName}</strong>
            </div>
            <div>
              <span className="text-zinc-500 block">Rubro o actividad económica:</span>
              <span className="font-semibold text-zinc-800">{venture.industry}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">Fecha de evaluación:</span>
              <span className="font-semibold text-zinc-800">{venture.date}</span>
            </div>
          </div>

          {venture.notes && (
            <div className="mt-3 pt-2 border-t border-zinc-200/60 text-xs">
              <span className="text-zinc-500 block">Propósito del negocio:</span>
              <p className="text-zinc-700 italic">{venture.notes}</p>
            </div>
          )}
        </div>

        {/* Section 2: Resumen Ejecutivo y Estadísticas */}
        <div className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-3">
            2. Resumen de Priorización
          </h2>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="rounded-lg border border-zinc-200 bg-white p-2.5">
              <span className="text-[10px] text-zinc-500 block">Identificados</span>
              <strong className="text-lg font-bold text-zinc-900">{activeStakeholders.length}</strong>
            </div>
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5">
              <span className="text-[10px] text-rose-700 block font-semibold">Prioridad Máxima</span>
              <strong className="text-lg font-bold text-rose-800">
                {activeStakeholders.filter((s) => s.calc.priority === "Prioridad máxima").length}
              </strong>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5">
              <span className="text-[10px] text-amber-700 block font-semibold">Prioritarios</span>
              <strong className="text-lg font-bold text-amber-800">
                {activeStakeholders.filter((s) => s.calc.priority === "Prioritario").length}
              </strong>
            </div>
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-2.5">
              <span className="text-[10px] text-yellow-700 block font-semibold">Gestionar / Monitorear</span>
              <strong className="text-lg font-bold text-yellow-800">
                {activeStakeholders.filter((s) => ["Gestionar", "Observar", "Monitorear", "Baja prioridad"].includes(s.calc.priority)).length}
              </strong>
            </div>
          </div>
        </div>

        {/* Section 3: Tabla Detallada de Stakeholders Evaluados */}
        <div className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-3">
            3. Listado Completo y Nivel de Prioridad
          </h2>
          <div className="overflow-hidden rounded-xl border border-zinc-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-100/90 text-zinc-700 border-b border-zinc-200 font-bold">
                  <th className="p-2.5">Stakeholder</th>
                  <th className="p-2.5">Importancia</th>
                  <th className="p-2.5">Impacto s/ Negocio</th>
                  <th className="p-2.5">Impacto del Negocio</th>
                  <th className="p-2.5">Prioridad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/80">
                {activeStakeholders.map((item) => (
                  <tr key={item.stakeholderKey} className="hover:bg-zinc-50/50">
                    <td className="p-2.5 font-bold text-zinc-900">
                      {item.stakeholderName}
                      <span className="block text-[10px] font-normal text-zinc-500">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-2.5 text-zinc-700">{item.importance}</td>
                    <td className="p-2.5 text-zinc-700">{item.impactOnVenture}</td>
                    <td className="p-2.5 text-zinc-700">{item.impactOfVenture || "Medio"}</td>
                    <td className="p-2.5">
                      <span
                        className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-xs"
                        style={{ backgroundColor: item.calc.dotColor }}
                      >
                        {item.calc.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Recomendaciones Estratégicas Personalizadas */}
        <div className="mt-6 page-break-inside-avoid">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-3">
            4. Recomendaciones Estratégicas por Stakeholder
          </h2>
          <div className="space-y-2.5">
            {activeStakeholders.map((item) => (
              <div
                key={item.stakeholderKey}
                className="rounded-xl border border-zinc-200 p-3 bg-zinc-50/40 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ backgroundColor: item.calc.dotColor }} />
                    <strong className="text-zinc-900 font-bold">{item.stakeholderName}</strong>
                    <span className="text-[10px] text-zinc-500 font-medium">({item.calc.priority})</span>
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-600 bg-white px-2 py-0.5 rounded border border-zinc-200">
                    {item.calc.quadrantName}
                  </span>
                </div>
                <p className="text-zinc-700 leading-relaxed text-[11px] pt-1">
                  {item.calc.recommendation}
                </p>
                {item.notes && (
                  <p className="text-[10px] text-zinc-500 italic pt-0.5">
                    Nota del emprendedor: "{item.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Triple Impacto y Sostenibilidad Emprende Clima */}
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 text-xs space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
            5. Enfoque de Triple Impacto (Personas, Planeta y Prosperidad)
          </h2>
          <p className="text-zinc-700 leading-relaxed text-[11px]">
            El análisis de stakeholders es el primer pilar para la gestión de sostenibilidad del emprendimiento. Al mantener relaciones de confianza y diálogo transparente con la comunidad, proveedores circulares, equipo humano y medioambiente, tu negocio asegura su viabilidad económica y potencia su impacto positivo.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 border-t border-zinc-200 pt-4 flex items-center justify-between text-[10px] text-zinc-400">
          <span>Generado automáticamente por Emprende Clima · Stakeholder Matrix v1.0</span>
          <span>Página 1 de 1</span>
        </div>
      </div>
    </div>
  );
}
