"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowLeft,
  Download,
  Save,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  ListOrdered,
  Globe2,
  Table as TableIcon,
  FileDown,
  Printer,
  ChevronRight,
  TrendingUp,
  ShieldAlert,
} from "lucide-react";
import { VentureData } from "./venture-initial-form";
import { StakeholderAnswer } from "./stakeholder-wizard";
import { calculateStakeholderPriority, PriorityEvaluationResult } from "@/lib/matrix-calculations";
import { MatrixView } from "./matrix-view";
import { TripleImpactView } from "./triple-impact-view";
import { PdfReportGenerator } from "./pdf-report-generator";
import confetti from "canvas-confetti";

interface ResultsDashboardProps {
  venture: VentureData;
  answers: StakeholderAnswer[];
  onBackToWizard: () => void;
  onSaveDbSuccess?: (evalId: string) => void;
}

type TabType = "ranking" | "matrix" | "triple_impact" | "table" | "pdf";

export function ResultsDashboard({
  venture,
  answers,
  onBackToWizard,
  onSaveDbSuccess,
}: ResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("ranking");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#10B981", "#14B8A6", "#F59E0B", "#3B82F6"],
      });
    } catch (e) {
      // ignore
    }
  }, []);

  // Filter only active related stakeholders
  const evaluatedStakeholders = answers
    .filter((a) => a.isRelated === true && a.importance && a.impactOnVenture)
    .map((a) => {
      const calc = calculateStakeholderPriority(
        a.importance,
        a.impactOnVenture,
        a.impactOfVenture,
        a.stakeholderName
      );
      return { ...a, calc };
    })
    .sort((a, b) => b.calc.priorityScore - a.calc.priorityScore);

  const nonRelatedCount = answers.filter((a) => a.isRelated === false).length;

  // Counts by priority
  const maxPriorityCount = evaluatedStakeholders.filter((s) => s.calc.priority === "Prioridad máxima").length;
  const highPriorityCount = evaluatedStakeholders.filter((s) => s.calc.priority === "Prioritario").length;
  const manageCount = evaluatedStakeholders.filter((s) => s.calc.priority === "Gestionar").length;
  const monitorCount = evaluatedStakeholders.filter((s) =>
    ["Observar", "Monitorear", "Baja prioridad"].includes(s.calc.priority)
  ).length;

  const handleSaveToDatabase = async () => {
    setIsSaving(true);
    setSaveSuccess(null);

    try {
      const payload = {
        id: venture.id,
        ventureName: venture.ventureName,
        entrepreneurName: venture.entrepreneurName,
        industry: venture.industry,
        date: venture.date,
        notes: venture.notes,
        responses: answers.map((a) => ({
          stakeholderKey: a.stakeholderKey,
          stakeholderName: a.stakeholderName,
          category: a.category,
          tripleImpactDimension: a.tripleImpactDimension,
          isCustom: a.isCustom || false,
          isRelated: a.isRelated === true,
          importance: a.importance,
          impactOnVenture: a.impactOnVenture,
          impactOfVenture: a.impactOfVenture,
          notes: a.notes,
        })),
      };

      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setSaveSuccess("Guardado exitosamente en base de datos (Turso / SQLite)");
        if (onSaveDbSuccess && json.data?.id) {
          onSaveDbSuccess(json.data.id);
        }
      } else {
        alert("Error al guardar: " + (json.error || "Ocurrió un problema"));
      }
    } catch (e) {
      console.error(e);
      alert("Error de conexión al guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Top Banner with Venture Title & Action Bar */}
      <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-900 to-zinc-950 p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
              Diagnóstico Finalizado
            </span>
            <span className="text-xs text-emerald-200">{venture.date}</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
            {venture.ventureName || "Mi Emprendimiento"}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90">
            Emprendedor/a: <strong>{venture.entrepreneurName}</strong> · Rubro:{" "}
            <strong>{venture.industry}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onBackToWizard}
            className="border-white/20 bg-white/10 text-xs font-medium text-white hover:bg-white/20 hover:text-white"
          >
            <ArrowLeft className="size-3.5 mr-1.5" />
            Editar Respuestas
          </Button>

          <Button
            size="sm"
            onClick={handleSaveToDatabase}
            disabled={isSaving}
            className="bg-emerald-500 text-xs font-bold text-zinc-950 hover:bg-emerald-400 shadow-md"
          >
            <Save className="size-3.5 mr-1.5" />
            {isSaving ? "Guardando..." : "Guardar en Turso DB"}
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
          <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Evaluated */}
        <Card className="border-zinc-200/80 p-4 shadow-sm dark:border-zinc-800">
          <span className="text-xs font-medium text-muted-foreground block">
            Stakeholders Identificados
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
              {evaluatedStakeholders.length}
            </span>
            <span className="text-[11px] text-zinc-500">
              de {answers.length} analizados
            </span>
          </div>
        </Card>

        {/* Prioridad Máxima */}
        <Card className="border-rose-200 bg-rose-50/40 p-4 shadow-sm dark:border-rose-950 dark:bg-rose-950/20">
          <span className="text-xs font-bold text-rose-800 dark:text-rose-300 block">
            🔴 Prioridad Máxima
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-rose-700 dark:text-rose-400">
              {maxPriorityCount}
            </span>
            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
              Críticos
            </span>
          </div>
        </Card>

        {/* Prioritarios */}
        <Card className="border-amber-200 bg-amber-50/40 p-4 shadow-sm dark:border-amber-950 dark:bg-amber-950/20">
          <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
            🟠 Prioritarios
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-400">
              {highPriorityCount}
            </span>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              Atención
            </span>
          </div>
        </Card>

        {/* Gestionar / Monitorear */}
        <Card className="border-emerald-200 bg-emerald-50/40 p-4 shadow-sm dark:border-emerald-950 dark:bg-emerald-950/20">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
            🟡 / 🟢 Gestión & Monitoreo
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400">
              {manageCount + monitorCount}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Seguimiento
            </span>
          </div>
        </Card>
      </div>

      {/* Main Tab Navigation Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-zinc-200 bg-zinc-100/80 p-1.5 scrollbar-none dark:border-zinc-800 dark:bg-zinc-900">
        <button
          onClick={() => setActiveTab("ranking")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 ${
            activeTab === "ranking"
              ? "bg-white text-emerald-800 shadow-sm dark:bg-zinc-800 dark:text-white"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          <ListOrdered className="size-4 text-emerald-600" />
          <span>1. Lista de Prioridades ({evaluatedStakeholders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("matrix")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 ${
            activeTab === "matrix"
              ? "bg-white text-emerald-800 shadow-sm dark:bg-zinc-800 dark:text-white"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          <LayoutGrid className="size-4 text-teal-600" />
          <span>2. Matriz Visual 2D</span>
        </button>

        <button
          onClick={() => setActiveTab("triple_impact")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 ${
            activeTab === "triple_impact"
              ? "bg-white text-emerald-800 shadow-sm dark:bg-zinc-800 dark:text-white"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          <Globe2 className="size-4 text-blue-600" />
          <span>3. Diagnóstico Triple Impacto</span>
        </button>

        <button
          onClick={() => setActiveTab("table")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 ${
            activeTab === "table"
              ? "bg-white text-emerald-800 shadow-sm dark:bg-zinc-800 dark:text-white"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          <TableIcon className="size-4 text-zinc-600" />
          <span>4. Tabla Comparativa</span>
        </button>

        <button
          onClick={() => setActiveTab("pdf")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 ${
            activeTab === "pdf"
              ? "bg-white text-emerald-800 shadow-sm dark:bg-zinc-800 dark:text-white"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          <FileDown className="size-4 text-rose-600" />
          <span>5. Descargar PDF</span>
        </button>
      </div>

      {/* Tab 1: Ranking & Ordered Actionable Cards */}
      {activeTab === "ranking" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Ranking de Stakeholders Ordenados por Nivel de Prioridad
            </h3>
            <span className="text-xs text-muted-foreground">
              De mayor a menor prioridad según Importancia e Impacto
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {evaluatedStakeholders.map((item, idx) => (
              <Card
                key={item.stakeholderKey}
                className="overflow-hidden border-zinc-200/90 shadow-sm hover:shadow-md transition-shadow dark:border-zinc-800"
              >
                <div className="p-4 sm:p-5 space-y-3">
                  {/* Top Bar of Card */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-zinc-100 text-xs font-black text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        #{idx + 1}
                      </span>
                      <span
                        className="size-3 rounded-full"
                        style={{ backgroundColor: item.calc.dotColor }}
                      />
                      <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                        {item.stakeholderName}
                      </h4>
                      <Badge variant="outline" className="text-[10px]">
                        {item.category || "General"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={item.calc.badgeVariant} className="text-xs font-bold py-1">
                        {item.calc.priority}
                      </Badge>
                    </div>
                  </div>

                  {/* Criteria Scores Summary Chips */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="rounded-xl bg-zinc-50 p-2.5 border border-zinc-200/70 dark:bg-zinc-900/60 dark:border-zinc-800">
                      <span className="text-zinc-500 block text-[11px]">Importancia:</span>
                      <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.importance}
                      </strong>
                    </div>

                    <div className="rounded-xl bg-zinc-50 p-2.5 border border-zinc-200/70 dark:bg-zinc-900/60 dark:border-zinc-800">
                      <span className="text-zinc-500 block text-[11px]">Impacto sobre el negocio:</span>
                      <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.impactOnVenture}
                      </strong>
                    </div>

                    <div className="rounded-xl bg-zinc-50 p-2.5 border border-zinc-200/70 dark:bg-zinc-900/60 dark:border-zinc-800">
                      <span className="text-zinc-500 block text-[11px]">Impacto del negocio s/ actor:</span>
                      <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.impactOfVenture || "Impacto medio"}
                      </strong>
                    </div>
                  </div>

                  {/* Official Interpretation & Recommendation */}
                  <div className="rounded-xl bg-emerald-50/50 p-3.5 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                        🎯 {item.calc.interpretation}
                      </span>
                      <span className="text-zinc-400">·</span>
                      <span className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium">
                        Estrategia: {item.calc.quadrantName}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {item.calc.recommendation}
                    </p>

                    {item.notes && (
                      <p className="mt-2 text-[11px] text-zinc-500 italic pt-1 border-t border-emerald-100 dark:border-emerald-900/50">
                        Nota registrada: "{item.notes}"
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {evaluatedStakeholders.length === 0 && (
              <div className="rounded-2xl border border-zinc-200 p-8 text-center text-muted-foreground">
                <AlertCircle className="size-8 mx-auto text-zinc-400 mb-2" />
                <p>No se registraron stakeholders con relación activa.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Full 2D Visual Matrix */}
      {activeTab === "matrix" && (
        <MatrixView answers={answers} />
      )}

      {/* Tab 3: Triple Impact */}
      {activeTab === "triple_impact" && (
        <TripleImpactView
          answers={answers}
          ventureName={venture.ventureName}
          industry={venture.industry}
        />
      )}

      {/* Tab 4: Comparison Table */}
      {activeTab === "table" && (
        <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base">Tabla Matriz Comparativa de Respuestas</CardTitle>
            <CardDescription className="text-xs">
              Vista consolidada con todos los factores evaluados para cada actor.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-100/80 text-zinc-700 border-b border-zinc-200 font-bold dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700">
                    <th className="p-3">#</th>
                    <th className="p-3">Stakeholder</th>
                    <th className="p-3">Categoría</th>
                    <th className="p-3">Relación</th>
                    <th className="p-3">Importancia</th>
                    <th className="p-3">Impacto s/ Negocio</th>
                    <th className="p-3">Impacto del Negocio</th>
                    <th className="p-3">Prioridad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800">
                  {answers.map((item, idx) => {
                    const isRel = item.isRelated === true;
                    const calc = isRel
                      ? calculateStakeholderPriority(
                          item.importance,
                          item.impactOnVenture,
                          item.impactOfVenture,
                          item.stakeholderName
                        )
                      : null;

                    return (
                      <tr key={item.stakeholderKey} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                        <td className="p-3 text-zinc-400">{idx + 1}</td>
                        <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">
                          {item.stakeholderName}
                        </td>
                        <td className="p-3 text-zinc-600 dark:text-zinc-400">
                          {item.category || "General"}
                        </td>
                        <td className="p-3">
                          {isRel ? (
                            <Badge variant="success" className="text-[10px]">
                              Sí
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">
                              No
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 text-zinc-700 dark:text-zinc-300">
                          {item.importance || "—"}
                        </td>
                        <td className="p-3 text-zinc-700 dark:text-zinc-300">
                          {item.impactOnVenture || "—"}
                        </td>
                        <td className="p-3 text-zinc-700 dark:text-zinc-300">
                          {item.impactOfVenture || "—"}
                        </td>
                        <td className="p-3">
                          {calc ? (
                            <span
                              className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-xs"
                              style={{ backgroundColor: calc.dotColor }}
                            >
                              {calc.priority}
                            </span>
                          ) : (
                            <span className="text-zinc-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 5: PDF Generator */}
      {activeTab === "pdf" && (
        <PdfReportGenerator venture={venture} answers={answers} />
      )}
    </div>
  );
}
