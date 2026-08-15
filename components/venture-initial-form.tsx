"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from "lucide-react";

export interface VentureData {
  id?: string;
  ventureName: string;
  entrepreneurName: string;
  industry: string;
  date: string;
  notes: string;
}

interface VentureInitialFormProps {
  initialData: VentureData;
  onComplete: (data: VentureData) => void;
  onLoadDemo: () => void;
}

const SECTOR_SUGGESTIONS = [
  "Reciclaje y economía circular",
  "Alimentos y agricultura",
  "Energía y eficiencia",
  "Turismo y naturaleza",
  "Moda y textiles",
  "Servicios y consultoría",
];

const STEPS = [
  {
    number: "1",
    title: "Cuéntanos de tu negocio",
    description: "Cuatro datos básicos. Toma menos de un minuto.",
  },
  {
    number: "2",
    title: "Responde sobre 14 grupos",
    description: "Una pantalla por grupo. Si no aplica, avanzas al siguiente.",
  },
  {
    number: "3",
    title: "Recibe tus prioridades",
    description: "Una matriz visual, un orden de prioridad y tu informe en PDF.",
  },
];

export function VentureInitialForm({
  initialData,
  onComplete,
  onLoadDemo,
}: VentureInitialFormProps) {
  const [formData, setFormData] = useState<VentureData>({
    id: initialData.id,
    ventureName: initialData.ventureName || "",
    entrepreneurName: initialData.entrepreneurName || "",
    industry: initialData.industry || "",
    date: initialData.date || new Date().toISOString().split("T")[0],
    notes: initialData.notes || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (patch: Partial<VentureData>, clearError?: string) => {
    setFormData((prev) => ({ ...prev, ...patch }));
    if (clearError && errors[clearError]) {
      setErrors((prev) => ({ ...prev, [clearError]: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!formData.ventureName.trim()) {
      nextErrors.ventureName = "Escribe el nombre de tu emprendimiento";
    }
    if (!formData.entrepreneurName.trim()) {
      nextErrors.entrepreneurName = "Escribe tu nombre";
    }
    if (!formData.industry.trim()) {
      nextErrors.industry = "Indica a qué se dedica tu negocio";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      onComplete(formData);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Introducción */}
      <section className="pt-4 pb-10 sm:pt-10 sm:pb-14">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-brand-strong">
          Emprende Clima
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-[1.15] tracking-tight text-balance sm:text-4xl">
          Análisis de stakeholders
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Los stakeholders son personas, grupos u organizaciones que pueden influir en tu
          emprendimiento o verse afectados por las actividades de tu negocio.
        </p>

        <ol className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.number} className="bg-card p-4 sm:p-5">
              <span className="flex size-6 items-center justify-center rounded-full border border-brand-line bg-brand-soft text-xs font-semibold text-brand-strong">
                {step.number}
              </span>
              <h2 className="mt-3 text-sm font-semibold">{step.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Formulario */}
      <form onSubmit={handleSubmit} noValidate className="space-y-7">
        <div className="space-y-2">
          <label htmlFor="ventureName" className="block text-sm font-medium">
            ¿Cómo se llama tu emprendimiento?
          </label>
          <Input
            id="ventureName"
            value={formData.ventureName}
            autoComplete="organization"
            placeholder="Ej. EcoPack Circular"
            aria-invalid={Boolean(errors.ventureName)}
            aria-describedby={errors.ventureName ? "error-ventureName" : undefined}
            onChange={(e) => update({ ventureName: e.target.value }, "ventureName")}
            className={errors.ventureName ? "border-destructive" : ""}
          />
          {errors.ventureName && (
            <p id="error-ventureName" className="text-sm text-destructive">
              {errors.ventureName}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="entrepreneurName" className="block text-sm font-medium">
            ¿Cuál es tu nombre?
          </label>
          <Input
            id="entrepreneurName"
            value={formData.entrepreneurName}
            autoComplete="name"
            placeholder="Ej. Valentina Henríquez"
            aria-invalid={Boolean(errors.entrepreneurName)}
            aria-describedby={
              errors.entrepreneurName ? "error-entrepreneurName" : undefined
            }
            onChange={(e) =>
              update({ entrepreneurName: e.target.value }, "entrepreneurName")
            }
            className={errors.entrepreneurName ? "border-destructive" : ""}
          />
          {errors.entrepreneurName && (
            <p id="error-entrepreneurName" className="text-sm text-destructive">
              {errors.entrepreneurName}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="industry" className="block text-sm font-medium">
            ¿A qué se dedica tu negocio?
          </label>
          <Input
            id="industry"
            value={formData.industry}
            placeholder="Ej. Envases biodegradables"
            aria-invalid={Boolean(errors.industry)}
            aria-describedby={errors.industry ? "error-industry" : undefined}
            onChange={(e) => update({ industry: e.target.value }, "industry")}
            className={errors.industry ? "border-destructive" : ""}
          />
          {errors.industry && (
            <p id="error-industry" className="text-sm text-destructive">
              {errors.industry}
            </p>
          )}

          <div className="flex flex-wrap gap-1.5 pt-1">
            {SECTOR_SUGGESTIONS.map((sector) => (
              <button
                key={sector}
                type="button"
                onClick={() => update({ industry: sector }, "industry")}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  formData.industry === sector
                    ? "border-brand bg-brand-soft font-medium text-brand-strong"
                    : "border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground"
                }`}
              >
                {sector}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="date" className="block text-sm font-medium">
            Fecha
          </label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => update({ date: e.target.value })}
            className="sm:max-w-56"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="notes" className="block text-sm font-medium">
            En una frase, ¿qué hace tu negocio?{" "}
            <span className="font-normal text-muted-foreground">(opcional)</span>
          </label>
          <Textarea
            id="notes"
            rows={2}
            placeholder="Ej. Fabricamos envases compostables con descartes agrícolas."
            value={formData.notes}
            onChange={(e) => update({ notes: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onLoadDemo}
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground sm:order-2"
          >
            Ver un ejemplo completo
          </button>

          <Button type="submit" size="xl" className="w-full sm:order-1 sm:w-auto">
            Comenzar
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
