"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Leaf, DollarSign, Globe, Award, ShieldCheck, ArrowUpRight, TrendingUp } from "lucide-react";
import { StakeholderAnswer } from "./stakeholder-wizard";
import { calculateStakeholderPriority, scoreFromLevel } from "@/lib/matrix-calculations";

interface TripleImpactViewProps {
  answers: StakeholderAnswer[];
  ventureName: string;
  industry: string;
}

export function TripleImpactView({ answers, ventureName, industry }: TripleImpactViewProps) {
  const activeAnswers = answers.filter((a) => a.isRelated === true && a.importance && a.impactOnVenture);

  // Group by dimension
  const peopleStakeholders = activeAnswers.filter((a) =>
    ["clientes", "trabajadores", "comunidad_vecinos", "organizaciones_sociales", "instituciones_educacionales", "estado_municipalidad"].includes(a.stakeholderKey) ||
    a.tripleImpactDimension === "Personas"
  );

  const planetStakeholders = activeAnswers.filter((a) =>
    ["medioambiente", "proveedores", "organismos_reguladores"].includes(a.stakeholderKey) ||
    a.tripleImpactDimension === "Planeta"
  );

  const prosperityStakeholders = activeAnswers.filter((a) =>
    ["socios", "bancos_financieras", "competidores", "asociaciones_gremiales"].includes(a.stakeholderKey) ||
    a.tripleImpactDimension === "Prosperidad"
  );

  // Calculate Bidirectional Double Materiality score
  let totalImpactOfVentureScore = 0;
  let totalImpactOnVentureScore = 0;

  activeAnswers.forEach((a) => {
    totalImpactOnVentureScore += scoreFromLevel(a.impactOnVenture);
    totalImpactOfVentureScore += scoreFromLevel(a.impactOfVenture || "Impacto medio");
  });

  const maxPossible = Math.max(1, activeAnswers.length * 3);
  const outwardImpactRatio = Math.round((totalImpactOfVentureScore / maxPossible) * 100);
  const inwardImpactRatio = Math.round((totalImpactOnVentureScore / maxPossible) * 100);

  return (
    <div className="space-y-6">
      {/* Intro Triple Impact Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-zinc-900 p-5 sm:p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-semibold text-emerald-300 backdrop-blur-md">
              <Globe className="size-3.5" />
              <span>Módulo de Sostenibilidad · Emprende Clima</span>
            </div>
            <h3 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
              Diagnóstico de Triple Impacto & Doble Materialidad
            </h3>
            <p className="mt-1 max-w-2xl text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Integración de la matriz de stakeholders con los tres pilares de la sostenibilidad (Personas, Planeta y Prosperidad) para medir el impacto regenerativo de {ventureName || "tu emprendimiento"}.
            </p>
          </div>

          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-md border border-white/10 text-center">
            <span className="text-[11px] uppercase tracking-wider text-emerald-200 block font-semibold">
              Maturity Index
            </span>
            <span className="text-2xl font-black text-white">
              {Math.round((outwardImpactRatio + inwardImpactRatio) / 2)}%
            </span>
          </div>
        </div>
      </div>

      {/* 3 Pillars Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: Personas */}
        <Card className="border-blue-200/80 bg-blue-50/30 dark:border-blue-950 dark:bg-blue-950/20 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <Users className="size-5" />
              </div>
              <Badge variant="blue" className="font-bold">
                {peopleStakeholders.length} Stakeholders
              </Badge>
            </div>
            <CardTitle className="text-base text-blue-950 dark:text-blue-100 mt-2">
              1. Pilar Personas (Social)
            </CardTitle>
            <CardDescription className="text-xs">
              Comunidad, colaboradores, clientes y entorno social directo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="space-y-1.5">
              {peopleStakeholders.length > 0 ? (
                peopleStakeholders.map((s) => {
                  const calc = calculateStakeholderPriority(s.importance, s.impactOnVenture, s.impactOfVenture, s.stakeholderName);
                  return (
                    <div
                      key={s.stakeholderKey}
                      className="flex items-center justify-between rounded-lg bg-white p-2 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800"
                    >
                      <span className="font-medium truncate max-w-[150px]">{s.stakeholderName}</span>
                      <span className="text-[10px] font-bold" style={{ color: calc.dotColor }}>
                        {calc.priority}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-center py-2">Sin stakeholders asociados</p>
              )}
            </div>
            <div className="rounded-lg bg-white/70 p-2 text-[11px] text-zinc-600 dark:bg-zinc-900/70 dark:text-zinc-400 mt-2">
              💡 <strong>Foco Clave:</strong> Trabajo decente, salud laboral, inclusión y fortalecimiento del tejido comunitario.
            </div>
          </CardContent>
        </Card>

        {/* Pillar 2: Planeta */}
        <Card className="border-emerald-200/80 bg-emerald-50/30 dark:border-emerald-950 dark:bg-emerald-950/20 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
                <Leaf className="size-5" />
              </div>
              <Badge variant="success" className="font-bold">
                {planetStakeholders.length} Stakeholders
              </Badge>
            </div>
            <CardTitle className="text-base text-emerald-950 dark:text-emerald-100 mt-2">
              2. Pilar Planeta (Ambiental)
            </CardTitle>
            <CardDescription className="text-xs">
              Ecosistemas, agua, huella de carbono, economía circular y normativa verde.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="space-y-1.5">
              {planetStakeholders.length > 0 ? (
                planetStakeholders.map((s) => {
                  const calc = calculateStakeholderPriority(s.importance, s.impactOnVenture, s.impactOfVenture, s.stakeholderName);
                  return (
                    <div
                      key={s.stakeholderKey}
                      className="flex items-center justify-between rounded-lg bg-white p-2 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800"
                    >
                      <span className="font-medium truncate max-w-[150px]">{s.stakeholderName}</span>
                      <span className="text-[10px] font-bold" style={{ color: calc.dotColor }}>
                        {calc.priority}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-center py-2">Sin stakeholders asociados</p>
              )}
            </div>
            <div className="rounded-lg bg-white/70 p-2 text-[11px] text-zinc-600 dark:bg-zinc-900/70 dark:text-zinc-400 mt-2">
              💡 <strong>Foco Clave:</strong> Reducción de emisiones de GEI, circularidad de insumos, eficiencia hídrica y regeneración.
            </div>
          </CardContent>
        </Card>

        {/* Pillar 3: Prosperidad */}
        <Card className="border-amber-200/80 bg-amber-50/30 dark:border-amber-950 dark:bg-amber-950/20 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-600 text-white shadow-md shadow-amber-500/20">
                <DollarSign className="size-5" />
              </div>
              <Badge variant="warning" className="font-bold">
                {prosperityStakeholders.length} Stakeholders
              </Badge>
            </div>
            <CardTitle className="text-base text-amber-950 dark:text-amber-100 mt-2">
              3. Pilar Prosperidad (Económico)
            </CardTitle>
            <CardDescription className="text-xs">
              Sostenibilidad financiera, socios, inversionistas, banca y gremios.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="space-y-1.5">
              {prosperityStakeholders.length > 0 ? (
                prosperityStakeholders.map((s) => {
                  const calc = calculateStakeholderPriority(s.importance, s.impactOnVenture, s.impactOfVenture, s.stakeholderName);
                  return (
                    <div
                      key={s.stakeholderKey}
                      className="flex items-center justify-between rounded-lg bg-white p-2 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800"
                    >
                      <span className="font-medium truncate max-w-[150px]">{s.stakeholderName}</span>
                      <span className="text-[10px] font-bold" style={{ color: calc.dotColor }}>
                        {calc.priority}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-center py-2">Sin stakeholders asociados</p>
              )}
            </div>
            <div className="rounded-lg bg-white/70 p-2 text-[11px] text-zinc-600 dark:bg-zinc-900/70 dark:text-zinc-400 mt-2">
              💡 <strong>Foco Clave:</strong> Modelos de ingresos circulares, financiamiento verde, gobernanza ética y alianzas gremiales.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Double Materiality Analysis Box */}
      <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="size-5 text-emerald-600" />
            <span>Análisis de Doble Materialidad (Materialidad Bidireccional)</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Evalúa simultáneamente cómo los actores externos impactan tu viabilidad financiera (Materialidad Financiera) y cómo tus operaciones impactan a la sociedad y al planeta (Materialidad de Impacto).
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                1. Materialidad Financiera (Inward)
              </span>
              <Badge variant="outline">{inwardImpactRatio}%</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Magnitud de influencia de los stakeholders sobre los riesgos, costos, regulación y continuidad operacional del emprendimiento.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                2. Materialidad de Impacto (Outward)
              </span>
              <Badge variant="outline">{outwardImpactRatio}%</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Magnitud del impacto positivo o externalidad que el emprendimiento genera sobre el medioambiente, la comunidad y los colaboradores.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
