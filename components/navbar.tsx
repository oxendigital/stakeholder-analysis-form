"use client";

import React from "react";
import { Leaf, Sparkles, History, RotateCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  onLoadDemo: () => void;
  onOpenHistory: () => void;
  onReset: () => void;
  hasActiveData: boolean;
  currentStep: number;
  onNavigateStep: (step: number) => void;
}

export function Navbar({
  onLoadDemo,
  onOpenHistory,
  onReset,
  hasActiveData,
  currentStep,
  onNavigateStep,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
            <Leaf className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">
                Emprende Clima
              </span>
              <Badge variant="success" className="hidden sm:inline-flex text-[10px] font-semibold py-0">
                Herramienta Oficial
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Análisis y Matriz de Stakeholders
            </p>
          </div>
        </div>

        {/* Step Navigation Pill (Visible on medium+ screens) */}
        {hasActiveData && (
          <nav aria-label="Progreso del análisis" className="hidden md:flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50/80 p-1 dark:border-zinc-800 dark:bg-zinc-900/80">
            <button
              onClick={() => onNavigateStep(1)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                currentStep === 1
                  ? "bg-white text-emerald-700 shadow-sm dark:bg-zinc-800 dark:text-emerald-400"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              <span className="size-4 rounded-full bg-emerald-100 text-emerald-700 text-[10px] flex items-center justify-center font-bold dark:bg-emerald-950 dark:text-emerald-300">
                1
              </span>
              Emprendimiento
            </button>

            <span className="text-zinc-300 dark:text-zinc-700">/</span>

            <button
              onClick={() => onNavigateStep(2)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                currentStep === 2
                  ? "bg-white text-emerald-700 shadow-sm dark:bg-zinc-800 dark:text-emerald-400"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              <span className="size-4 rounded-full bg-emerald-100 text-emerald-700 text-[10px] flex items-center justify-center font-bold dark:bg-emerald-950 dark:text-emerald-300">
                2
              </span>
              Evaluación
            </button>

            <span className="text-zinc-300 dark:text-zinc-700">/</span>

            <button
              onClick={() => onNavigateStep(3)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                currentStep === 3
                  ? "bg-white text-emerald-700 shadow-sm dark:bg-zinc-800 dark:text-emerald-400"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              <span className="size-4 rounded-full bg-emerald-100 text-emerald-700 text-[10px] flex items-center justify-center font-bold dark:bg-emerald-950 dark:text-emerald-300">
                3
              </span>
              Matriz & Resultados
            </button>
          </nav>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Demo Button for instant presentation */}
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadDemo}
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/50"
            title="Carga un emprendimiento de ejemplo para la presentación"
          >
            <Sparkles className="size-3.5 text-emerald-600 dark:text-emerald-400 mr-1" />
            <span className="hidden sm:inline">Ejemplo Demo</span>
            <span className="sm:hidden">Demo</span>
          </Button>

          {/* History / Saved Evaluations */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenHistory}
            className="text-zinc-600 dark:text-zinc-400"
            title="Ver evaluaciones guardadas en Turso / SQLite"
          >
            <History className="size-4 mr-1 sm:mr-1.5" />
            <span className="hidden sm:inline">Historial</span>
          </Button>

          {/* Reset */}
          {hasActiveData && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onReset}
              className="text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400"
              title="Reiniciar formulario"
            >
              <RotateCcw className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
