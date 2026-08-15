"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { VentureInitialForm, VentureData } from "@/components/venture-initial-form";
import { StakeholderWizard, StakeholderAnswer } from "@/components/stakeholder-wizard";
import { ResultsDashboard } from "@/components/results-dashboard";
import { SavedEvaluationsModal } from "@/components/saved-evaluations-modal";
import { DEMO_VENTURE, DEFAULT_STAKEHOLDERS } from "@/lib/stakeholders-data";
import { Leaf, Heart, Shield, Globe } from "lucide-react";

const STORAGE_KEY_VENTURE = "emprende_clima_venture";
const STORAGE_KEY_ANSWERS = "emprende_clima_answers";
const STORAGE_KEY_STEP = "emprende_clima_step";

export default function Home() {
  const [step, setStep] = useState<number>(1);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  const [venture, setVenture] = useState<VentureData>({
    ventureName: "",
    entrepreneurName: "",
    industry: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [answers, setAnswers] = useState<StakeholderAnswer[]>([]);

  // Load from local storage on first mount
  useEffect(() => {
    try {
      const savedVenture = localStorage.getItem(STORAGE_KEY_VENTURE);
      const savedAnswers = localStorage.getItem(STORAGE_KEY_ANSWERS);
      const savedStep = localStorage.getItem(STORAGE_KEY_STEP);

      if (savedVenture) {
        setVenture(JSON.parse(savedVenture));
      }
      if (savedAnswers) {
        setAnswers(JSON.parse(savedAnswers));
      }
      if (savedStep) {
        setStep(Number(savedStep));
      }
    } catch (e) {
      console.error("Local storage error:", e);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      if (venture.ventureName) {
        localStorage.setItem(STORAGE_KEY_VENTURE, JSON.stringify(venture));
      }
      if (answers.length > 0) {
        localStorage.setItem(STORAGE_KEY_ANSWERS, JSON.stringify(answers));
      }
      localStorage.setItem(STORAGE_KEY_STEP, String(step));
    } catch (e) {
      console.error(e);
    }
  }, [venture, answers, step]);

  // Demo loader
  const handleLoadDemo = () => {
    const demoVenture: VentureData = {
      id: "demo_ecopack",
      ventureName: DEMO_VENTURE.ventureName,
      entrepreneurName: DEMO_VENTURE.entrepreneurName,
      industry: DEMO_VENTURE.industry,
      date: DEMO_VENTURE.date,
      notes: DEMO_VENTURE.notes,
    };

    const demoAnswers: StakeholderAnswer[] = DEFAULT_STAKEHOLDERS.map((st) => {
      const match = DEMO_VENTURE.responses.find((r) => r.stakeholderKey === st.id);
      if (match) {
        return {
          stakeholderKey: st.id,
          stakeholderName: st.name,
          category: st.category,
          tripleImpactDimension: st.tripleImpactDimension,
          isCustom: false,
          isRelated: match.isRelated,
          importance: match.importance as any,
          impactOnVenture: match.impactOnVenture as any,
          impactOfVenture: match.impactOfVenture as any,
          notes: match.notes,
        };
      }
      return {
        stakeholderKey: st.id,
        stakeholderName: st.name,
        category: st.category,
        tripleImpactDimension: st.tripleImpactDimension,
        isCustom: false,
        isRelated: false,
        importance: null,
        impactOnVenture: null,
        impactOfVenture: null,
        notes: "",
      };
    });

    setVenture(demoVenture);
    setAnswers(demoAnswers);
    setStep(3); // Jump directly to results for immediate presentation inspection
  };

  const handleReset = () => {
    if (confirm("¿Estás seguro de que deseas reiniciar el análisis actual?")) {
      localStorage.removeItem(STORAGE_KEY_VENTURE);
      localStorage.removeItem(STORAGE_KEY_ANSWERS);
      localStorage.removeItem(STORAGE_KEY_STEP);
      setVenture({
        ventureName: "",
        entrepreneurName: "",
        industry: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setAnswers([]);
      setStep(1);
    }
  };

  const handleCompleteInitial = (data: VentureData) => {
    setVenture(data);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveAnswers = (newAnswers: StakeholderAnswer[]) => {
    setAnswers(newAnswers);
  };

  const handleFinishWizard = (finalAnswers: StakeholderAnswer[]) => {
    setAnswers(finalAnswers);
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoadSavedEvaluation = (
    savedVenture: VentureData,
    savedAnswers: StakeholderAnswer[]
  ) => {
    setVenture(savedVenture);
    setAnswers(savedAnswers);
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasActiveData = Boolean(venture.ventureName || answers.length > 0);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/60 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Top Navbar */}
      <Navbar
        onLoadDemo={handleLoadDemo}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onReset={handleReset}
        hasActiveData={hasActiveData}
        currentStep={step}
        onNavigateStep={(s) => setStep(s)}
      />

      {/* Main Page Container */}
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-7xl mx-auto w-full">
        {step === 1 && (
          <VentureInitialForm
            initialData={venture}
            onComplete={handleCompleteInitial}
            onLoadDemo={handleLoadDemo}
          />
        )}

        {step === 2 && (
          <StakeholderWizard
            answers={answers}
            onSaveAnswers={handleSaveAnswers}
            onFinish={handleFinishWizard}
            onBackToProfile={() => setStep(1)}
            ventureName={venture.ventureName}
          />
        )}

        {step === 3 && (
          <ResultsDashboard
            venture={venture}
            answers={answers}
            onBackToWizard={() => setStep(2)}
            onSaveDbSuccess={(evalId) => {
              setVenture((prev) => ({ ...prev, id: evalId }));
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200/80 bg-white/60 py-6 text-center text-xs text-muted-foreground dark:border-zinc-800/80 dark:bg-zinc-950/60 print:hidden">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex size-5 items-center justify-center rounded-md bg-emerald-600 text-white">
              <Leaf className="size-3" />
            </div>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              Emprende Clima
            </span>
            <span>— Impulsando la sostenibilidad y el triple impacto</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-500">
            <span>Matriz 2D de Stakeholders</span>
            <span>·</span>
            <span>Turso DB & Drizzle ORM</span>
            <span>·</span>
            <span>PDF Export</span>
          </div>
        </div>
      </footer>

      {/* History Modal */}
      <SavedEvaluationsModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onLoadEvaluation={handleLoadSavedEvaluation}
      />
    </div>
  );
}
