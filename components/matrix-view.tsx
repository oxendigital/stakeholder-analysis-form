"use client";

import React, { useMemo, useState } from "react";
import { StakeholderAnswer } from "./stakeholder-wizard";
import { calculateStakeholderPriority } from "@/lib/matrix-calculations";
import { plotStakeholders } from "@/lib/matrix-layout";

interface MatrixViewProps {
  answers: StakeholderAnswer[];
}

const AXIS_X = ["Bajo", "Medio", "Alto"];
const AXIS_Y = ["Alta", "Media", "Baja"];

export function MatrixView({ answers }: MatrixViewProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const plotted = useMemo(() => plotStakeholders(answers), [answers]);
  const selected = plotted.find((item) => item.answer.stakeholderKey === selectedKey) ?? null;

  if (plotted.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Todavía no hay grupos evaluados para dibujar la matriz.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Matriz de stakeholders</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Mientras más arriba y más a la derecha esté un grupo, más atención necesita. El color
          del fondo indica el nivel de prioridad de cada casilla.
        </p>
      </div>

      {/* Gráfico */}
      <div className="flex gap-3">
        <div className="flex w-6 shrink-0 items-center justify-center">
          <span className="whitespace-nowrap text-xs uppercase tracking-[0.12em] text-muted-foreground [writing-mode:vertical-rl] rotate-180">
            Importancia
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex gap-2">
            <div className="flex w-12 shrink-0 flex-col justify-around py-1 text-right sm:w-16">
              {AXIS_Y.map((label) => (
                <span key={label} className="text-xs text-muted-foreground">
                  {label}
                </span>
              ))}
            </div>

            <div className="relative aspect-square w-full min-w-0 sm:aspect-[7/5]">
              {/* Celdas de fondo, teñidas según la prioridad que representan */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 overflow-hidden rounded-lg border border-border">
                {[3, 2, 1].map((importance) =>
                  [1, 2, 3].map((impact) => {
                    const calc = calculateStakeholderPriority(
                      importance === 3
                        ? "Muy importante"
                        : importance === 2
                          ? "Medianamente importante"
                          : "Poco importante",
                      impact === 3 ? "Alto impacto" : impact === 2 ? "Impacto medio" : "Bajo impacto"
                    );
                    return (
                      <div
                        key={`${importance}-${impact}`}
                        className="border-b border-r border-border/70 last:border-r-0"
                        style={{ backgroundColor: calc.softBg }}
                      />
                    );
                  })
                )}
              </div>

              {/* Puntos */}
              {plotted.map((item) => {
                const isSelected = item.answer.stakeholderKey === selectedKey;
                return (
                  <button
                    key={item.answer.stakeholderKey}
                    type="button"
                    onClick={() =>
                      setSelectedKey(isSelected ? null : item.answer.stakeholderKey)
                    }
                    title={`${item.answer.stakeholderName} — ${item.calc.priority}`}
                    style={{
                      left: `${item.left}%`,
                      top: `${item.top}%`,
                      backgroundColor: item.calc.color,
                    }}
                    className={`absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-semibold text-white shadow-sm ring-2 transition-transform hover:scale-110 ${
                      isSelected ? "scale-110 ring-foreground" : "ring-white"
                    }`}
                  >
                    {item.index}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-2 flex gap-2">
            <div className="w-12 shrink-0 sm:w-16" />
            <div className="grid flex-1 grid-cols-3">
              {AXIS_X.map((label) => (
                <span key={label} className="text-center text-xs text-muted-foreground">
                  {label}
                </span>
              ))}
            </div>
          </div>

          <p className="mt-2 pl-14 text-center text-xs uppercase tracking-[0.12em] text-muted-foreground sm:pl-18">
            Impacto sobre tu negocio
          </p>
        </div>
      </div>

      {/* Leyenda */}
      <div className="overflow-hidden rounded-xl border border-border">
        {plotted.map((item, position) => {
          const isSelected = item.answer.stakeholderKey === selectedKey;
          return (
            <button
              key={item.answer.stakeholderKey}
              type="button"
              onClick={() => setSelectedKey(isSelected ? null : item.answer.stakeholderKey)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted ${
                position > 0 ? "border-t border-border" : ""
              } ${isSelected ? "bg-muted" : ""}`}
            >
              <span
                className="flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: item.calc.color }}
              >
                {item.index}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {item.answer.stakeholderName}
              </span>
              <span className="shrink-0 text-sm" style={{ color: item.calc.color }}>
                {item.calc.priority}
              </span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div
          className="reveal rounded-xl border p-5"
          style={{
            borderColor: selected.calc.borderColor,
            backgroundColor: selected.calc.softBg,
          }}
        >
          <h3 className="text-base font-semibold">{selected.answer.stakeholderName}</h3>
          <p className="mt-1 text-sm" style={{ color: selected.calc.color }}>
            {selected.calc.priority} · {selected.calc.interpretation}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-foreground/80">
            {selected.calc.recommendation}
          </p>
        </div>
      )}
    </div>
  );
}
