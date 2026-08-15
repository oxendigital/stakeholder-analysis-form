"use client";

import React from "react";
import { Users, Leaf, Coins, Layers } from "lucide-react";
import { StakeholderAnswer } from "./stakeholder-wizard";
import { calculateStakeholderPriority, scoreFromLevel } from "@/lib/matrix-calculations";

interface TripleImpactViewProps {
  answers: StakeholderAnswer[];
  ventureName: string;
}

const PILLARS = [
  {
    key: "Personas",
    icon: Users,
    title: "Personas",
    description: "Tu equipo, tus clientes y la comunidad donde operas.",
  },
  {
    key: "Planeta",
    icon: Leaf,
    title: "Planeta",
    description: "El entorno natural que tu negocio usa y afecta.",
  },
  {
    key: "Prosperidad",
    icon: Coins,
    title: "Prosperidad",
    description: "Lo que sostiene económicamente al emprendimiento.",
  },
  {
    key: "Transversal",
    icon: Layers,
    title: "Transversales",
    description: "Grupos que cruzan las tres dimensiones.",
  },
] as const;

export function TripleImpactView({ answers, ventureName }: TripleImpactViewProps) {
  const evaluated = answers.filter(
    (a) => a.isRelated === true && a.importance && a.impactOnVenture
  );

  if (evaluated.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Todavía no hay grupos evaluados.
      </p>
    );
  }

  const maxPossible = evaluated.length * 3;
  const inward = Math.round(
    (evaluated.reduce((sum, a) => sum + scoreFromLevel(a.impactOnVenture), 0) / maxPossible) * 100
  );
  const outward = Math.round(
    (evaluated.reduce((sum, a) => sum + scoreFromLevel(a.impactOfVenture), 0) / maxPossible) * 100
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Triple impacto</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Tus grupos de interés agrupados en las tres dimensiones de la sostenibilidad. Es el punto
          de partida para el diagnóstico de {ventureName || "tu emprendimiento"}.
        </p>
      </div>

      <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
        {PILLARS.map((pillar) => {
          const items = evaluated.filter((a) => a.tripleImpactDimension === pillar.key);
          const Icon = pillar.icon;

          return (
            <section key={pillar.key} className="bg-card p-5">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg border border-brand-line bg-brand-soft text-brand-strong">
                  <Icon className="size-4" />
                </span>
                <h3 className="text-sm font-semibold">{pillar.title}</h3>
                <span className="ml-auto text-sm text-muted-foreground">{items.length}</span>
              </div>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {pillar.description}
              </p>

              <ul className="mt-4 space-y-2">
                {items.length === 0 && (
                  <li className="text-sm text-muted-foreground">Sin grupos en esta dimensión.</li>
                )}
                {items.map((item) => {
                  const calc = calculateStakeholderPriority(
                    item.importance,
                    item.impactOnVenture,
                    item.impactOfVenture,
                    item.stakeholderName
                  );
                  return (
                    <li
                      key={item.stakeholderKey}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: calc.color }}
                      />
                      <span className="min-w-0 flex-1 truncate">{item.stakeholderName}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {calc.priority}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
        <div className="bg-card p-5">
          <p className="text-sm font-medium">Cuánto te afecta el entorno</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">{inward}%</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Qué tan expuesto está tu negocio a lo que decidan o hagan sus grupos de interés.
          </p>
        </div>

        <div className="bg-card p-5">
          <p className="text-sm font-medium">Cuánto afectas al entorno</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">{outward}%</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Qué tanto impacto genera tu operación sobre las personas, el territorio y el
            medioambiente.
          </p>
        </div>
      </div>
    </div>
  );
}
