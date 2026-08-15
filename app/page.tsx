"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { VentureInitialForm, VentureData } from "@/components/venture-initial-form";
import { StakeholderWizard, StakeholderAnswer } from "@/components/stakeholder-wizard";
import { ResultsDashboard } from "@/components/results-dashboard";
import { SavedEvaluationsModal } from "@/components/saved-evaluations-modal";
import { DEMO_VENTURE, DEFAULT_STAKEHOLDERS } from "@/lib/stakeholders-data";
import { ImportanceLevel, ImpactLevel } from "@/lib/matrix-calculations";

const STORAGE_KEY = "emprende_clima_stakeholders";

interface Session {
  venture: VentureData;
  answers: StakeholderAnswer[];
  step: number;
}

function emptyVenture(): VentureData {
  return {
    ventureName: "",
    entrepreneurName: "",
    industry: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  };
}

function emptySession(): Session {
  return { venture: emptyVenture(), answers: [], step: 1 };
}

/** Lee la sesión anterior del navegador, descartando lo que esté incompleto. */
function readStoredSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const stored = JSON.parse(raw) as Partial<Session>;
    const venture = { ...emptyVenture(), ...(stored.venture ?? {}) };
    const answers = Array.isArray(stored.answers) ? stored.answers : [];

    // Sólo se retoma un paso avanzado si hay datos que lo respalden.
    let step = 1;
    if (stored.step === 2 && venture.ventureName) step = 2;
    if (stored.step === 3 && answers.length > 0) step = 3;

    return { venture, answers, step };
  } catch (error) {
    console.error("No se pudo recuperar la sesión guardada:", error);
    return null;
  }
}

export default function Home() {
  const [session, setSession] = useState<Session>(emptySession);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // `isRestored` es estado y no una referencia a propósito: si fuera una
  // referencia, el efecto que guarda alcanzaría a escribir la sesión vacía del
  // primer render y borraría lo que el usuario tenía guardado.
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    const restored = readStoredSession();
    // `localStorage` no existe durante el render en el servidor: recuperar la
    // sesión sólo es posible al montar, y ocurre una única vez.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (restored) setSession(restored);
    setIsRestored(true);
  }, []);

  useEffect(() => {
    if (!isRestored) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error("No se pudo guardar la sesión:", error);
    }
  }, [session, isRestored]);

  const { venture, answers, step } = session;

  const goToStep = useCallback((next: number) => {
    setSession((prev) => ({ ...prev, step: next }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleLoadDemo = useCallback(() => {
    const demoAnswers: StakeholderAnswer[] = DEFAULT_STAKEHOLDERS.map((stakeholder) => {
      const response = DEMO_VENTURE.responses.find(
        (r) => r.stakeholderKey === stakeholder.id
      );

      return {
        stakeholderKey: stakeholder.id,
        stakeholderName: stakeholder.name,
        category: stakeholder.category,
        tripleImpactDimension: stakeholder.tripleImpactDimension,
        isCustom: false,
        isRelated: response ? response.isRelated : false,
        importance: (response?.importance as ImportanceLevel) ?? null,
        impactOnVenture: (response?.impactOnVenture as ImpactLevel) ?? null,
        impactOfVenture: (response?.impactOfVenture as ImpactLevel) ?? null,
        notes: response?.notes ?? "",
      };
    });

    setSession({
      venture: {
        ventureName: DEMO_VENTURE.ventureName,
        entrepreneurName: DEMO_VENTURE.entrepreneurName,
        industry: DEMO_VENTURE.industry,
        date: DEMO_VENTURE.date,
        notes: DEMO_VENTURE.notes,
      },
      answers: demoAnswers,
      step: 3,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleReset = useCallback(() => {
    if (!confirm("Se borrarán las respuestas de este análisis. ¿Continuar?")) return;
    localStorage.removeItem(STORAGE_KEY);
    setSession(emptySession());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const hasActiveData = Boolean(venture.ventureName || answers.length > 0);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        onLoadDemo={handleLoadDemo}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onReset={handleReset}
        hasActiveData={hasActiveData}
        currentStep={step}
        onNavigateStep={goToStep}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 sm:px-6">
        {step === 1 && (
          <VentureInitialForm
            initialData={venture}
            onComplete={(data) => {
              setSession((prev) => ({ ...prev, venture: data, step: 2 }));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onLoadDemo={handleLoadDemo}
          />
        )}

        {step === 2 && (
          <StakeholderWizard
            answers={answers}
            onSaveAnswers={(next) => setSession((prev) => ({ ...prev, answers: next }))}
            onFinish={(finalAnswers) => {
              setSession((prev) => ({ ...prev, answers: finalAnswers, step: 3 }));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onBackToProfile={() => goToStep(1)}
            ventureName={venture.ventureName}
          />
        )}

        {step === 3 && (
          <ResultsDashboard
            venture={venture}
            answers={answers}
            onBackToWizard={() => goToStep(2)}
            onSaveDbSuccess={(evalId) =>
              setSession((prev) => ({
                ...prev,
                venture: { ...prev.venture, id: evalId },
              }))
            }
          />
        )}
      </main>

      <footer className="border-t border-border py-6 print:hidden">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>Emprende Clima · Herramienta para emprendedores</span>
          <span>Tus respuestas se guardan en este dispositivo.</span>
        </div>
      </footer>

      {isHistoryOpen && (
        <SavedEvaluationsModal
          onClose={() => setIsHistoryOpen(false)}
          onLoadEvaluation={(savedVenture, savedAnswers) => {
            setSession({ venture: savedVenture, answers: savedAnswers, step: 3 });
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </div>
  );
}
