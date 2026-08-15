"use client";

import React from "react";
import { Leaf, FolderClock, RotateCcw, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onLoadDemo: () => void;
  onOpenHistory: () => void;
  onReset: () => void;
  hasActiveData: boolean;
  currentStep: number;
  onNavigateStep: (step: number) => void;
}

const STEPS = [
  { id: 1, label: "Tu emprendimiento" },
  { id: 2, label: "Preguntas" },
  { id: 3, label: "Resultados" },
];

export function Navbar({
  onLoadDemo,
  onOpenHistory,
  onReset,
  hasActiveData,
  currentStep,
  onNavigateStep,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md print:hidden">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand text-white">
            <Leaf className="size-4" />
          </span>
          <span className="truncate text-sm font-semibold tracking-tight">
            Emprende Clima
          </span>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            · Análisis de stakeholders
          </span>
        </div>

        {hasActiveData && (
          <nav
            aria-label="Progreso del análisis"
            className="hidden items-center gap-1 md:flex"
          >
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                {index > 0 && (
                  <span aria-hidden className="text-border">
                    ·
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onNavigateStep(step.id)}
                  aria-current={currentStep === step.id ? "step" : undefined}
                  className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                    currentStep === step.id
                      ? "font-semibold text-brand-strong"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {step.label}
                </button>
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadDemo}
            className="text-muted-foreground hover:text-foreground"
            title="Rellenar con un emprendimiento de ejemplo"
          >
            <Wand2 className="size-3.5" />
            <span className="hidden sm:inline">Ejemplo</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenHistory}
            className="text-muted-foreground hover:text-foreground"
            title="Ver análisis guardados"
          >
            <FolderClock className="size-3.5" />
            <span className="hidden sm:inline">Guardados</span>
          </Button>

          {hasActiveData && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onReset}
              className="text-muted-foreground hover:text-destructive"
              title="Empezar de nuevo"
              aria-label="Empezar de nuevo"
            >
              <RotateCcw className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
