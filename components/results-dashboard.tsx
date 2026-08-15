"use client";

import React, { useMemo, useState } from "react";
import { ArrowLeft, Check, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VentureData } from "./venture-initial-form";
import { StakeholderAnswer } from "./stakeholder-wizard";
import {
  calculateStakeholderPriority,
  explainPriority,
  shortLevelLabel,
} from "@/lib/matrix-calculations";
import { MatrixView } from "./matrix-view";
import { TripleImpactView } from "./triple-impact-view";
import { PdfReportGenerator } from "./pdf-report-generator";

interface ResultsDashboardProps {
  venture: VentureData;
  answers: StakeholderAnswer[];
  onBackToWizard: () => void;
  onSaveDbSuccess?: (evalId: string) => void;
}

type TabId = "prioridades" | "matriz" | "triple" | "tabla";

const TABS: { id: TabId; label: string }[] = [
  { id: "prioridades", label: "Prioridades" },
  { id: "matriz", label: "Matriz" },
  { id: "triple", label: "Triple impacto" },
  { id: "tabla", label: "Tabla" },
];

const PRIORITY_ORDER = [
  "Prioridad máxima",
  "Prioritario",
  "Gestionar",
  "Observar",
  "Monitorear",
  "Baja prioridad",
] as const;

export function ResultsDashboard({
  venture,
  answers,
  onBackToWizard,
  onSaveDbSuccess,
}: ResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>("prioridades");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const evaluated = useMemo(
    () =>
      answers
        .filter((a) => a.isRelated === true && a.importance && a.impactOnVenture)
        .map((answer) => ({
          answer,
          calc: calculateStakeholderPriority(
            answer.importance,
            answer.impactOnVenture,
            answer.impactOfVenture,
            answer.stakeholderName
          ),
        }))
        .sort((a, b) => b.calc.priorityScore - a.calc.priorityScore),
    [answers]
  );

  const notRelatedCount = answers.filter((a) => a.isRelated === false).length;
  const criticalCount = evaluated.filter((e) => e.calc.priority === "Prioridad máxima").length;
  const highCount = evaluated.filter((e) => e.calc.priority === "Prioritario").length;
  const followUpCount = evaluated.length - criticalCount - highCount;

  const grouped = PRIORITY_ORDER.map((priority) => ({
    priority,
    items: evaluated.filter((e) => e.calc.priority === priority),
  })).filter((group) => group.items.length > 0);

  const handleSave = async () => {
    setSaveState("saving");

    try {
      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Error al guardar");

      if (onSaveDbSuccess && json.data?.id) onSaveDbSuccess(json.data.id);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2500);
    } catch (error) {
      console.error("No se pudo guardar el análisis:", error);
      setSaveState("error");
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Encabezado */}
      <header className="pt-4 pb-8 sm:pt-8">
        <button
          type="button"
          onClick={onBackToWizard}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Volver a las preguntas
        </button>

        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {venture.ventureName || "Tu emprendimiento"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {[venture.entrepreneurName, venture.industry, venture.date]
            .filter(Boolean)
            .join(" · ")}
        </p>

        <p className="mt-6 max-w-2xl text-base leading-relaxed">
          Identificaste{" "}
          <strong className="font-semibold">
            {evaluated.length}{" "}
            {evaluated.length === 1 ? "grupo de interés" : "grupos de interés"}
          </strong>
          {criticalCount > 0 ? (
            <>
              .{" "}
              {criticalCount === 1 ? (
                <>
                  <strong className="font-semibold">Uno de ellos es crítico</strong> y
                  debería recibir tu atención primero.
                </>
              ) : (
                <>
                  <strong className="font-semibold">
                    {criticalCount} de ellos son críticos
                  </strong>{" "}
                  y deberían recibir tu atención primero.
                </>
              )}
            </>
          ) : (
            "."
          )}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
          {[
            { label: "Identificados", value: evaluated.length },
            { label: "Prioridad máxima", value: criticalCount },
            { label: "Prioritarios", value: highCount },
            { label: "Seguimiento", value: followUpCount },
          ].map((stat) => (
            <div key={stat.label} className="bg-card px-4 py-3.5">
              <dt className="text-xs text-muted-foreground">{stat.label}</dt>
              <dd className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <PdfReportGenerator venture={venture} answers={answers} variant="inline" />

          <Button
            variant="outline"
            size="xl"
            onClick={handleSave}
            disabled={saveState === "saving"}
          >
            {saveState === "saving" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : saveState === "saved" ? (
              <Check className="size-4" />
            ) : (
              <Save className="size-4" />
            )}
            {saveState === "saved" ? "Guardado" : "Guardar análisis"}
          </Button>
        </div>

        {saveState === "error" && (
          <p className="mt-3 text-sm text-destructive">
            No se pudo guardar. Revisa tu conexión e inténtalo otra vez.
          </p>
        )}
      </header>

      {/* Pestañas */}
      <div
        role="tablist"
        aria-label="Vistas de los resultados"
        className="scrollbar-none -mx-4 flex gap-6 overflow-x-auto border-b border-border px-4 sm:mx-0 sm:px-0"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`-mb-px shrink-0 border-b-2 pb-3 text-sm transition-colors ${
              activeTab === tab.id
                ? "border-brand font-semibold text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="py-8">
        {activeTab === "prioridades" && (
          <div className="space-y-10">
            {grouped.length === 0 && (
              <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                No marcaste ningún grupo con relación con tu emprendimiento.
              </p>
            )}

            {grouped.map((group) => {
              const color = group.items[0].calc.color;
              return (
                <section key={group.priority}>
                  <h2 className="flex items-center gap-2 text-sm font-semibold">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    {group.priority}
                    <span className="font-normal text-muted-foreground">
                      · {group.items.length}
                    </span>
                  </h2>

                  <div className="mt-4 space-y-3">
                    {group.items.map(({ answer, calc }) => (
                      <article
                        key={answer.stakeholderKey}
                        className="rounded-xl border border-border bg-card p-5"
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="text-base font-semibold">{answer.stakeholderName}</h3>
                          <span className="text-sm text-muted-foreground">
                            {calc.interpretation}
                          </span>
                        </div>

                        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                          <div className="flex gap-1.5">
                            <dt className="text-muted-foreground">Importancia:</dt>
                            <dd className="font-medium">
                              {shortLevelLabel(answer.importance)}
                            </dd>
                          </div>
                          <div className="flex gap-1.5">
                            <dt className="text-muted-foreground">Su impacto sobre ti:</dt>
                            <dd className="font-medium">
                              {shortLevelLabel(answer.impactOnVenture)}
                            </dd>
                          </div>
                          <div className="flex gap-1.5">
                            <dt className="text-muted-foreground">Tu impacto sobre él:</dt>
                            <dd className="font-medium">
                              {shortLevelLabel(answer.impactOfVenture)}
                            </dd>
                          </div>
                        </dl>

                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                          {explainPriority(calc)}
                        </p>

                        <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-foreground/80">
                          {calc.recommendation}
                        </p>

                        {answer.notes && (
                          <p className="mt-2 text-sm italic text-muted-foreground">
                            Tu nota: {answer.notes}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}

            {notRelatedCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {notRelatedCount}{" "}
                {notRelatedCount === 1
                  ? "grupo quedó fuera porque no tiene relación"
                  : "grupos quedaron fuera porque no tienen relación"}{" "}
                con tu emprendimiento.
              </p>
            )}
          </div>
        )}

        {activeTab === "matriz" && <MatrixView answers={answers} />}

        {activeTab === "triple" && (
          <TripleImpactView answers={answers} ventureName={venture.ventureName} />
        )}

        {activeTab === "tabla" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Todas tus respuestas</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Incluye los grupos que marcaste como sin relación.
              </p>
            </div>

            <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-2.5 pr-3 font-medium">Grupo</th>
                    <th className="py-2.5 pr-3 font-medium">Relación</th>
                    <th className="py-2.5 pr-3 font-medium">Importancia</th>
                    <th className="py-2.5 pr-3 font-medium">Su impacto</th>
                    <th className="py-2.5 pr-3 font-medium">Tu impacto</th>
                    <th className="py-2.5 font-medium">Prioridad</th>
                  </tr>
                </thead>
                <tbody>
                  {answers.map((answer) => {
                    const related = answer.isRelated === true;
                    const calc = related
                      ? calculateStakeholderPriority(
                          answer.importance,
                          answer.impactOnVenture,
                          answer.impactOfVenture,
                          answer.stakeholderName
                        )
                      : null;

                    return (
                      <tr key={answer.stakeholderKey} className="border-b border-border">
                        <td className="py-3 pr-3 font-medium">{answer.stakeholderName}</td>
                        <td className="py-3 pr-3 text-muted-foreground">
                          {answer.isRelated === null ? "—" : related ? "Sí" : "No"}
                        </td>
                        <td className="py-3 pr-3">{shortLevelLabel(answer.importance)}</td>
                        <td className="py-3 pr-3">{shortLevelLabel(answer.impactOnVenture)}</td>
                        <td className="py-3 pr-3">{shortLevelLabel(answer.impactOfVenture)}</td>
                        <td className="py-3">
                          {calc ? (
                            <span
                              className="inline-flex items-center gap-1.5"
                              style={{ color: calc.color }}
                            >
                              <span
                                className="size-1.5 rounded-full"
                                style={{ backgroundColor: calc.color }}
                              />
                              {calc.priority}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Informe PDF */}
      <div className="border-t border-border py-10">
        <PdfReportGenerator venture={venture} answers={answers} />
      </div>
    </div>
  );
}
