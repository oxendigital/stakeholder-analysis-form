"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, Building2, User, Calendar, Tag, Info, CheckCircle2, Globe2 } from "lucide-react";

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

const COMMON_SUSTAINABLE_SECTORS = [
  "Reciclaje & Economía Circular",
  "Energías Renovables & Eficiencia",
  "Agricultura Sostenible & Alimentos",
  "Ecoturismo & Conservación",
  "Tecnología Limpia (CleanTech)",
  "Moda Sostenible & Biomateriales",
  "Gestión Hídrica & Aguas",
  "Movilidad Eléctrica & Sostenible",
  "Consultoría Ambiental & ESG",
];

export function VentureInitialForm({
  initialData,
  onComplete,
  onLoadDemo,
}: VentureInitialFormProps) {
  const [formData, setFormData] = useState<VentureData>({
    ventureName: initialData.ventureName || "",
    entrepreneurName: initialData.entrepreneurName || "",
    industry: initialData.industry || "",
    date: initialData.date || new Date().toISOString().split("T")[0],
    notes: initialData.notes || "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.ventureName.trim()) {
      newErrors.ventureName = "El nombre del emprendimiento es obligatorio";
    }
    if (!formData.entrepreneurName.trim()) {
      newErrors.entrepreneurName = "El nombre del emprendedor/a es obligatorio";
    }
    if (!formData.industry.trim()) {
      newErrors.industry = "Debes indicar el rubro o actividad económica";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onComplete(formData);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Intro Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-900 to-zinc-950 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 size-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 size-64 rounded-full bg-teal-400/10 blur-3xl" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-emerald-200 backdrop-blur-md">
            <Sparkles className="size-3.5" />
            <span>Emprende Clima · Metodología de Impacto</span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl text-white">
            Formulario de Análisis de Stakeholders
          </h1>

          {/* Official Introductory Text from Requirement Document */}
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10">
            <p className="text-sm sm:text-base leading-relaxed text-emerald-50 font-normal">
              <span className="font-semibold text-white">“Los stakeholders</span> son personas, grupos u organizaciones que pueden influir en tu emprendimiento o verse afectados por las actividades de tu negocio.”
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-emerald-200/90">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>14 Stakeholders clave</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>Matriz 2D Automática</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>Informe PDF descargable</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>Listo para Triple Impacto</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Card Form */}
      <Card className="border-zinc-200/80 shadow-md dark:border-zinc-800">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">1. Datos Iniciales del Emprendimiento</CardTitle>
                <CardDescription>
                  Ingresa la información básica de tu negocio para personalizar la matriz y el reporte.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onLoadDemo}
                className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300"
              >
                <Sparkles className="size-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
                Cargar Demo
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Nombre del emprendimiento */}
            <div className="space-y-1.5">
              <label
                htmlFor="ventureName"
                className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                <Building2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                Nombre del emprendimiento *
              </label>
              <Input
                id="ventureName"
                placeholder="Ej. EcoPack Circular SpA, SolarAgro Tech, etc."
                value={formData.ventureName}
                onChange={(e) => {
                  setFormData({ ...formData, ventureName: e.target.value });
                  if (errors.ventureName) setErrors({ ...errors, ventureName: "" });
                }}
                className={errors.ventureName ? "border-rose-500 focus-visible:ring-rose-500/20" : ""}
              />
              {errors.ventureName && (
                <p className="text-xs text-rose-600 dark:text-rose-400">{errors.ventureName}</p>
              )}
            </div>

            {/* Nombre del emprendedor */}
            <div className="space-y-1.5">
              <label
                htmlFor="entrepreneurName"
                className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                <User className="size-4 text-emerald-600 dark:text-emerald-400" />
                Nombre del emprendedor o emprendedora *
              </label>
              <Input
                id="entrepreneurName"
                placeholder="Ej. Valentina Henríquez, Carlos Soto, etc."
                value={formData.entrepreneurName}
                onChange={(e) => {
                  setFormData({ ...formData, entrepreneurName: e.target.value });
                  if (errors.entrepreneurName) setErrors({ ...errors, entrepreneurName: "" });
                }}
                className={errors.entrepreneurName ? "border-rose-500 focus-visible:ring-rose-500/20" : ""}
              />
              {errors.entrepreneurName && (
                <p className="text-xs text-rose-600 dark:text-rose-400">{errors.entrepreneurName}</p>
              )}
            </div>

            {/* Rubro o actividad económica */}
            <div className="space-y-2">
              <label
                htmlFor="industry"
                className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                <Tag className="size-4 text-emerald-600 dark:text-emerald-400" />
                Rubro o actividad económica *
              </label>
              <Input
                id="industry"
                placeholder="Ej. Reciclaje y revalorización de residuos orgánicos"
                value={formData.industry}
                onChange={(e) => {
                  setFormData({ ...formData, industry: e.target.value });
                  if (errors.industry) setErrors({ ...errors, industry: "" });
                }}
                className={errors.industry ? "border-rose-500 focus-visible:ring-rose-500/20" : ""}
              />
              {errors.industry && (
                <p className="text-xs text-rose-600 dark:text-rose-400">{errors.industry}</p>
              )}

              {/* Quick preset chips */}
              <div className="pt-1">
                <span className="text-xs font-medium text-muted-foreground">Sugerencias rápidas:</span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {COMMON_SUSTAINABLE_SECTORS.map((sector) => (
                    <button
                      key={sector}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, industry: sector });
                        if (errors.industry) setErrors({ ...errors, industry: "" });
                      }}
                      className={`rounded-lg border px-2.5 py-1 text-xs transition-all ${
                        formData.industry === sector
                          ? "border-emerald-600 bg-emerald-50 font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                      }`}
                    >
                      {sector}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid for Date & Short Description/Notes */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="date"
                  className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  <Calendar className="size-4 text-emerald-600 dark:text-emerald-400" />
                  Fecha de realización
                </label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label
                  htmlFor="notes"
                  className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  <Globe2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                  Propósito o breve descripción del negocio (opcional)
                </label>
                <Textarea
                  id="notes"
                  rows={2}
                  placeholder="Describe brevemente la propuesta de valor sostenible de tu emprendimiento..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-100 pt-5 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="size-4 text-emerald-600" />
              <span>Optimizado para celulares y computadores.</span>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md hover:from-emerald-700 hover:to-teal-700 font-semibold px-6"
            >
              <span>Comenzar Evaluación de Stakeholders</span>
              <ArrowRight className="size-4 ml-1.5" />
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
