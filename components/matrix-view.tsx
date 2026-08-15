"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  calculateStakeholderPriority,
  PriorityEvaluationResult,
  scoreFromLevel,
} from "@/lib/matrix-calculations";
import { StakeholderAnswer } from "./stakeholder-wizard";
import { Info, Sparkles, Filter, Eye, AlertCircle } from "lucide-react";

interface MatrixViewProps {
  answers: StakeholderAnswer[];
  onSelectStakeholder?: (answer: StakeholderAnswer) => void;
}

export function MatrixView({ answers, onSelectStakeholder }: MatrixViewProps) {
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>("ALL");
  const [selectedDimensionFilter, setSelectedDimensionFilter] = useState<string>("ALL");
  const [selectedStakeholder, setSelectedStakeholder] = useState<StakeholderAnswer | null>(null);

  // Filter only related and answered stakeholders
  const evaluatedStakeholders = answers.filter(
    (a) => a.isRelated === true && a.importance && a.impactOnVenture
  );

  // Apply filters
  const filteredList = evaluatedStakeholders.filter((item) => {
    const calc = calculateStakeholderPriority(
      item.importance,
      item.impactOnVenture,
      item.impactOfVenture,
      item.stakeholderName
    );

    if (selectedPriorityFilter !== "ALL" && calc.priority !== selectedPriorityFilter) {
      return false;
    }
    if (
      selectedDimensionFilter !== "ALL" &&
      item.tripleImpactDimension !== selectedDimensionFilter
    ) {
      return false;
    }
    return true;
  });

  // Helper to place points smoothly in a 100% relative coordinate system
  // X: Impact on Venture (1=Bajo: ~16%, 2=Medio: ~50%, 3=Alto: ~84%)
  // Y: Importance (1=Poco: ~84% from top, 2=Medio: ~50%, 3=Muy: ~16% from top)
  const getCoordinates = (item: StakeholderAnswer, index: number, totalInGroup: number) => {
    const xVal = scoreFromLevel(item.impactOnVenture); // 1, 2, 3
    const yVal = scoreFromLevel(item.importance); // 1, 2, 3

    // Base percentages
    const xBase = xVal === 1 ? 18 : xVal === 2 ? 50 : 82;
    const yBase = yVal === 3 ? 18 : yVal === 2 ? 50 : 82; // Inverted for screen CSS top

    // Deterministic jitter/spread so items at the same discrete rating spread out nicely
    const angle = (index / Math.max(1, totalInGroup)) * Math.PI * 2;
    const radius = totalInGroup > 1 ? 6 : 0;
    const xJitter = Math.cos(angle) * radius;
    const yJitter = Math.sin(angle) * radius;

    return {
      left: `${Math.min(92, Math.max(8, xBase + xJitter))}%`,
      top: `${Math.min(92, Math.max(8, yBase + yJitter))}%`,
    };
  };

  // Group by (xVal, yVal) to compute jitter
  const groupCounts: Record<string, number> = {};
  const groupIndices: Record<string, number> = {};

  filteredList.forEach((item) => {
    const key = `${scoreFromLevel(item.impactOnVenture)}_${scoreFromLevel(item.importance)}`;
    groupCounts[key] = (groupCounts[key] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Filter and Overview Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <span>Matriz de Priorización de Stakeholders</span>
            <Badge variant="outline" className="text-xs font-semibold">
              {filteredList.length} identificados
            </Badge>
          </h3>
          <p className="text-xs text-muted-foreground">
            Eje X: Impacto sobre el emprendimiento · Eje Y: Importancia para el emprendimiento
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground mr-1">Filtro:</span>
          {["ALL", "Prioridad máxima", "Prioritario", "Gestionar", "Monitorear"].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPriorityFilter(p)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                selectedPriorityFilter === p
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-bold"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {p === "ALL" ? "Todos" : p}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2D Matrix Chart Container */}
      <Card className="overflow-hidden border-zinc-200/90 shadow-md dark:border-zinc-800">
        <div className="p-4 sm:p-6 bg-zinc-50/40 dark:bg-zinc-900/40">
          {/* Visual Matrix Canvas */}
          <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full rounded-2xl border-2 border-zinc-300/80 bg-white shadow-inner overflow-hidden dark:border-zinc-700 dark:bg-zinc-950">
            {/* Background 4 Strategic Quadrants */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
              {/* Quadrant: Top-Left (Alta Importancia, Bajo Impacto) */}
              <div className="border-r border-b border-dashed border-zinc-300/80 p-3 bg-amber-500/[0.03] dark:border-zinc-700/80">
                <span className="rounded-md bg-amber-100/80 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                  MANTENER SATISFECHO
                </span>
                <p className="mt-1 text-[10px] text-zinc-400 leading-tight hidden sm:block">
                  Alta importancia · Bajo impacto
                </p>
              </div>

              {/* Quadrant: Top-Right (Alta Importancia, Alto Impacto) -> Critical Priority */}
              <div className="border-b border-dashed border-zinc-300/80 p-3 bg-rose-500/[0.05] dark:border-zinc-700/80">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                    🔴 PRIORIDAD MÁXIMA / GESTIÓN CRÍTICA
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-zinc-400 leading-tight hidden sm:block">
                  Alta importancia · Alto impacto
                </p>
              </div>

              {/* Quadrant: Bottom-Left (Baja Importancia, Bajo Impacto) */}
              <div className="border-r border-dashed border-zinc-300/80 p-3 bg-emerald-500/[0.02] flex flex-col justify-end dark:border-zinc-700/80">
                <p className="mb-1 text-[10px] text-zinc-400 leading-tight hidden sm:block">
                  Baja importancia · Bajo impacto
                </p>
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 w-fit">
                  🟢 MONITOREAR / BAJA PRIORIDAD
                </span>
              </div>

              {/* Quadrant: Bottom-Right (Baja Importancia, Alto Impacto) */}
              <div className="p-3 bg-purple-500/[0.03] flex flex-col justify-end">
                <p className="mb-1 text-[10px] text-zinc-400 leading-tight hidden sm:block">
                  Baja importancia · Alto impacto
                </p>
                <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[11px] font-bold text-purple-800 dark:bg-purple-950 dark:text-purple-300 w-fit">
                  🟣 OBSERVAR / MANTENER INFORMADO
                </span>
              </div>
            </div>

            {/* Matrix Center Axis Marks */}
            <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-zinc-300/60 dark:border-zinc-700/60" />
            <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-zinc-300/60 dark:border-zinc-700/60" />

            {/* Discrete Axis Step Indicators */}
            <div className="pointer-events-none absolute bottom-1.5 inset-x-0 flex justify-between px-6 text-[10px] font-semibold text-zinc-600 dark:text-zinc-300">
              <span>Bajo Impacto</span>
              <span>Impacto Medio</span>
              <span>Alto Impacto</span>
            </div>

            <div className="pointer-events-none absolute left-1.5 inset-y-0 flex flex-col justify-between py-6 text-[10px] font-semibold text-zinc-600 dark:text-zinc-300 [writing-mode:vertical-lr] rotate-180">
              <span>Alta Importancia</span>
              <span>Importancia Media</span>
              <span>Baja Importancia</span>
            </div>

            {/* Stakeholder Node Pills Placed on Canvas */}
            {filteredList.map((item) => {
              const key = `${scoreFromLevel(item.impactOnVenture)}_${scoreFromLevel(item.importance)}`;
              const currentIdx = groupIndices[key] || 0;
              groupIndices[key] = currentIdx + 1;

              const coords = getCoordinates(item, currentIdx, groupCounts[key]);
              const calc = calculateStakeholderPriority(
                item.importance,
                item.impactOnVenture,
                item.impactOfVenture,
                item.stakeholderName
              );

              const isSelected = selectedStakeholder?.stakeholderKey === item.stakeholderKey;

              return (
                <button
                  key={item.stakeholderKey}
                  onClick={() => {
                    setSelectedStakeholder(item);
                    if (onSelectStakeholder) onSelectStakeholder(item);
                  }}
                  style={{ left: coords.left, top: coords.top }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all duration-200 z-20 ${
                    isSelected ? "scale-125 z-30" : "hover:scale-110 hover:z-30"
                  }`}
                  title={`${item.stakeholderName} (${calc.priority})`}
                >
                  <div
                    className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-md backdrop-blur-md transition-all ${
                      isSelected
                        ? "ring-2 ring-emerald-500 shadow-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-950"
                        : "bg-white/95 text-zinc-900 hover:bg-white dark:bg-zinc-900/95 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700"
                    }`}
                  >
                    <span
                      className="size-2.5 rounded-full shrink-0 animate-pulse"
                      style={{ backgroundColor: calc.dotColor }}
                    />
                    <span className="max-w-[110px] sm:max-w-[160px] truncate text-[11px] font-bold">
                      {item.stakeholderName}
                    </span>
                  </div>
                </button>
              );
            })}

            {filteredList.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                <AlertCircle className="size-8 text-zinc-400 mb-2" />
                <p className="text-sm font-medium">No hay stakeholders que coincidan con el filtro</p>
              </div>
            )}
          </div>

          {/* Matrix Explanatory Legend */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-rose-500 shrink-0" />
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">Prioridad Máxima</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-amber-500 shrink-0" />
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">Prioritario</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-yellow-500 shrink-0" />
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">Gestionar</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">Monitorear / Baja</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Selected Stakeholder Detail Drawer/Card */}
      {selectedStakeholder && (
        <Card className="border-emerald-200 bg-emerald-50/40 p-4 sm:p-5 dark:border-emerald-900 dark:bg-emerald-950/20">
          {(() => {
            const calc = calculateStakeholderPriority(
              selectedStakeholder.importance,
              selectedStakeholder.impactOnVenture,
              selectedStakeholder.impactOfVenture,
              selectedStakeholder.stakeholderName
            );

            return (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full" style={{ backgroundColor: calc.dotColor }} />
                    <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                      {selectedStakeholder.stakeholderName}
                    </h4>
                    <Badge variant={calc.badgeVariant}>{calc.priority}</Badge>
                  </div>
                  <button
                    onClick={() => setSelectedStakeholder(null)}
                    className="text-xs text-muted-foreground hover:text-zinc-900 dark:hover:text-white"
                  >
                    Cerrar detalle ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg bg-white p-2.5 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
                    <span className="text-muted-foreground block">Importancia:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedStakeholder.importance}</span>
                  </div>
                  <div className="rounded-lg bg-white p-2.5 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
                    <span className="text-muted-foreground block">Impacto s/ Emprendimiento:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedStakeholder.impactOnVenture}</span>
                  </div>
                  <div className="rounded-lg bg-white p-2.5 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
                    <span className="text-muted-foreground block">Impacto Emprendimiento s/ Stakeholder:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedStakeholder.impactOfVenture || "No especificado"}</span>
                  </div>
                </div>

                <div className="rounded-xl bg-white p-3.5 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                    🎯 Recomendación Estratégica:
                  </span>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {calc.recommendation}
                  </p>
                </div>
              </div>
            );
          })()}
        </Card>
      )}
    </div>
  );
}
