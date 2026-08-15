"use client";

import React, { useState } from "react";
import { Download, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VentureData } from "./venture-initial-form";
import { StakeholderAnswer } from "./stakeholder-wizard";
import { buildStakeholderReport, reportFileName } from "@/lib/pdf-report";

interface PdfReportGeneratorProps {
  venture: VentureData;
  answers: StakeholderAnswer[];
  /** `inline` muestra sólo el botón, para usarlo en la barra de acciones. */
  variant?: "card" | "inline";
}

const CONTENTS = [
  "Los datos de tu emprendimiento",
  "El resumen de prioridades",
  "La matriz visual de stakeholders",
  "El listado completo con su nivel de prioridad",
  "Una recomendación para cada grupo",
  "Recomendaciones generales para seguir trabajando",
];

export function PdfReportGenerator({
  venture,
  answers,
  variant = "card",
}: PdfReportGeneratorProps) {
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">("idle");

  const handleDownload = () => {
    setStatus("working");

    // Se difiere un tick para que el estado "generando" alcance a pintarse.
    setTimeout(() => {
      try {
        const doc = buildStakeholderReport(venture, answers);
        doc.save(reportFileName(venture.ventureName));
        setStatus("done");
        setTimeout(() => setStatus("idle"), 2500);
      } catch (error) {
        console.error("No se pudo generar el PDF:", error);
        setStatus("error");
      }
    }, 30);
  };

  const button = (
    <Button size="xl" onClick={handleDownload} disabled={status === "working"}>
      {status === "working" ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Generando…
        </>
      ) : status === "done" ? (
        <>
          <Check className="size-4" />
          Descargado
        </>
      ) : (
        <>
          <Download className="size-4" />
          Descargar resultados en PDF
        </>
      )}
    </Button>
  );

  if (variant === "inline") return button;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Tu informe en PDF</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Un documento listo para imprimir o compartir con tu equipo.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm font-medium">El informe incluye</p>
        <ul className="mt-3 space-y-2">
          {CONTENTS.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-brand" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-6 border-t border-border pt-5">
          {button}
          {status === "error" && (
            <p className="mt-3 text-sm text-destructive">
              No pudimos generar el archivo. Vuelve a intentarlo.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
