"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Briefcase,
  Truck,
  Handshake,
  TrendingUp,
  Landmark,
  Building2,
  ShieldAlert,
  Home as HomeIcon,
  HeartHandshake,
  GraduationCap,
  Network,
  Leaf,
  PlusCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Trash2,
  Layers,
  ChevronRight,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  DEFAULT_STAKEHOLDERS,
  DefaultStakeholderItem,
} from "@/lib/stakeholders-data";
import {
  calculateStakeholderPriority,
  ImportanceLevel,
  ImpactLevel,
  PriorityLevel,
} from "@/lib/matrix-calculations";

export interface StakeholderAnswer {
  stakeholderKey: string;
  stakeholderName: string;
  category?: string;
  tripleImpactDimension?: string;
  isCustom?: boolean;
  isRelated: boolean | null; // null = unanswered yet
  importance: ImportanceLevel | null;
  impactOnVenture: ImpactLevel | null;
  impactOfVenture: ImpactLevel | null;
  notes?: string;
}

interface StakeholderWizardProps {
  answers: StakeholderAnswer[];
  onSaveAnswers: (answers: StakeholderAnswer[]) => void;
  onFinish: (answers: StakeholderAnswer[]) => void;
  onBackToProfile: () => void;
  ventureName: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Users: <Users className="size-6" />,
  Briefcase: <Briefcase className="size-6" />,
  Truck: <Truck className="size-6" />,
  Handshake: <Handshake className="size-6" />,
  TrendingUp: <TrendingUp className="size-6" />,
  Landmark: <Landmark className="size-6" />,
  Building2: <Building2 className="size-6" />,
  ShieldAlert: <ShieldAlert className="size-6" />,
  Home: <HomeIcon className="size-6" />,
  HeartHandshake: <HeartHandshake className="size-6" />,
  GraduationCap: <GraduationCap className="size-6" />,
  Network: <Network className="size-6" />,
  Leaf: <Leaf className="size-6" />,
  PlusCircle: <PlusCircle className="size-6" />,
};

const IMPORTANCE_OPTIONS: { value: ImportanceLevel; label: string; desc: string }[] = [
  {
    value: "Poco importante",
    label: "Poco importante",
    desc: "Su aporte o rol es secundario para la operación actual.",
  },
  {
    value: "Medianamente importante",
    label: "Medianamente importante",
    desc: "Influye de forma relevante pero no paraliza el negocio.",
  },
  {
    value: "Muy importante",
    label: "Muy importante",
    desc: "Esencial o crítico para el funcionamiento y éxito.",
  },
];

const IMPACT_OPTIONS: { value: ImpactLevel; label: string; desc: string }[] = [
  {
    value: "Bajo impacto",
    label: "Bajo impacto",
    desc: "Efecto menor o fácilmente gestionable.",
  },
  {
    value: "Impacto medio",
    label: "Impacto medio",
    desc: "Efecto perceptible en recursos, imagen o resultados.",
  },
  {
    value: "Alto impacto",
    label: "Alto impacto",
    desc: "Efecto determinante o de gran magnitud.",
  },
];

export function StakeholderWizard({
  answers: initialAnswers,
  onSaveAnswers,
  onFinish,
  onBackToProfile,
  ventureName,
}: StakeholderWizardProps) {
  // Combine default stakeholders + custom stakeholders
  const [stakeholderList, setStakeholderList] = useState<DefaultStakeholderItem[]>(DEFAULT_STAKEHOLDERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersMap, setAnswersMap] = useState<Record<string, StakeholderAnswer>>({});
  const [autoAdvanceOnNo, setAutoAdvanceOnNo] = useState(true);
  const [showQuickDrawer, setShowQuickDrawer] = useState(false);

  // Initialize answers map
  useEffect(() => {
    const map: Record<string, StakeholderAnswer> = {};
    // Load from initial answers if any
    initialAnswers.forEach((a) => {
      map[a.stakeholderKey] = a;
    });

    // Check for custom stakeholders in initialAnswers
    const customItems = initialAnswers.filter((a) => a.isCustom);
    if (customItems.length > 0) {
      setStakeholderList((prev) => {
        const existingKeys = new Set(prev.map((p) => p.id));
        const toAdd = customItems
          .filter((c) => !existingKeys.has(c.stakeholderKey))
          .map((c) => ({
            id: c.stakeholderKey,
            name: c.stakeholderName,
            category: (c.category as any) || "General",
            tripleImpactDimension: (c.tripleImpactDimension as any) || "Transversal",
            iconName: "PlusCircle",
            shortDescription: "Stakeholder personalizado agregado por el emprendedor.",
            examples: [],
            climateContext: "Actor específico del ecosistema de tu negocio.",
          }));
        return [...prev, ...toAdd];
      });
    }

    setAnswersMap(map);
  }, [initialAnswers]);

  const currentItem = stakeholderList[currentIndex] || stakeholderList[0];
  const currentAnswer: StakeholderAnswer = answersMap[currentItem?.id] || {
    stakeholderKey: currentItem?.id,
    stakeholderName: currentItem?.name,
    category: currentItem?.category,
    tripleImpactDimension: currentItem?.tripleImpactDimension,
    isCustom: currentItem?.id.startsWith("custom_") || false,
    isRelated: null,
    importance: null,
    impactOnVenture: null,
    impactOfVenture: null,
    notes: "",
  };

  const handleUpdateCurrent = (updates: Partial<StakeholderAnswer>) => {
    const updated: StakeholderAnswer = {
      ...currentAnswer,
      ...updates,
      stakeholderKey: currentItem.id,
      stakeholderName: updates.stakeholderName || currentAnswer.stakeholderName || currentItem.name,
      category: currentItem.category,
      tripleImpactDimension: currentItem.tripleImpactDimension,
    };

    const newMap = { ...answersMap, [currentItem.id]: updated };
    setAnswersMap(newMap);

    const ansArray = Object.values(newMap);
    onSaveAnswers(ansArray);
  };

  const handleSetRelation = (isRelated: boolean) => {
    if (!isRelated) {
      handleUpdateCurrent({
        isRelated: false,
        importance: null,
        impactOnVenture: null,
        impactOfVenture: null,
      });

      // Auto-advance rule if enabled
      if (autoAdvanceOnNo && currentIndex < stakeholderList.length - 1) {
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
        }, 350);
      }
    } else {
      // Default to medium if not set
      handleUpdateCurrent({
        isRelated: true,
        importance: currentAnswer.importance || "Medianamente importante",
        impactOnVenture: currentAnswer.impactOnVenture || "Impacto medio",
        impactOfVenture: currentAnswer.impactOfVenture || "Impacto medio",
      });
    }
  };

  const handleAddCustomStakeholder = () => {
    const customId = `custom_${Date.now()}`;
    const newCustomItem: DefaultStakeholderItem = {
      id: customId,
      name: "Nuevo Stakeholder Personalizado",
      category: "General",
      tripleImpactDimension: "Transversal",
      iconName: "PlusCircle",
      shortDescription: "Stakeholder adicional específico para tu modelo de negocio.",
      examples: ["Medios de comunicación", "Gremios locales", "Socios tecnológicos"],
      climateContext: "Específico para las particularidades de tu negocio.",
    };

    setStakeholderList((prev) => [...prev, newCustomItem]);
    setCurrentIndex(stakeholderList.length); // Jump to the new one
  };

  const handleDeleteCustom = (id: string) => {
    setStakeholderList((prev) => prev.filter((p) => p.id !== id));
    const newMap = { ...answersMap };
    delete newMap[id];
    setAnswersMap(newMap);
    onSaveAnswers(Object.values(newMap));
    if (currentIndex >= stakeholderList.length - 1) {
      setCurrentIndex(Math.max(0, stakeholderList.length - 2));
    }
  };

  const completedCount = stakeholderList.filter((s) => {
    const ans = answersMap[s.id];
    return ans && ans.isRelated !== null && (ans.isRelated === false || (ans.importance && ans.impactOnVenture));
  }).length;

  const totalCount = stakeholderList.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Live priority preview
  const priorityPreview =
    currentAnswer.isRelated && currentAnswer.importance && currentAnswer.impactOnVenture
      ? calculateStakeholderPriority(
          currentAnswer.importance,
          currentAnswer.impactOnVenture,
          currentAnswer.impactOfVenture,
          currentAnswer.stakeholderName
        )
      : null;

  const handleFinishWizard = () => {
    const ansArray = Object.values(answersMap);
    onFinish(ansArray);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToProfile}
            className="text-xs text-muted-foreground hover:text-zinc-900 dark:hover:text-white"
          >
            <ArrowLeft className="size-3.5 mr-1" />
            Emprendimiento
          </Button>
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Evaluando: <span className="font-semibold text-zinc-900 dark:text-white">{ventureName || "Mi Emprendimiento"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <button
            onClick={() => setShowQuickDrawer(!showQuickDrawer)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Layers className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Lista ({completedCount}/{totalCount})</span>
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleFinishWizard}
            disabled={completedCount === 0}
            className="border-emerald-200 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300"
          >
            <span>Ver Resultados</span>
            <Sparkles className="size-3.5 ml-1 text-emerald-600" />
          </Button>
        </div>
      </div>

      {/* Progress Bar & Dots */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Stakeholder {currentIndex + 1} de {totalCount}
          </span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {progressPercent}% completado
          </span>
        </div>
        <Progress value={progressPercent} max={100} className="h-2" />

        {/* Step Dots Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {stakeholderList.map((st, idx) => {
            const stAns = answersMap[st.id];
            const isAnswered = stAns && stAns.isRelated !== null;
            const isCurrent = idx === currentIndex;
            const isRel = stAns?.isRelated === true;

            return (
              <button
                key={st.id}
                onClick={() => setCurrentIndex(idx)}
                title={`${idx + 1}. ${st.name}`}
                className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-medium transition-all ${
                  isCurrent
                    ? "bg-emerald-600 text-white ring-2 ring-emerald-500/40 font-bold scale-105"
                    : isAnswered
                    ? isRel
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                    : "bg-zinc-100/70 text-zinc-400 hover:bg-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-500"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Jump Drawer/List Modal if toggled */}
      {showQuickDrawer && (
        <Card className="border-emerald-200 bg-emerald-50/40 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Navegador rápido de stakeholders
            </span>
            <button
              onClick={() => setShowQuickDrawer(false)}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              Cerrar ✕
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 text-xs">
            {stakeholderList.map((st, idx) => {
              const ans = answersMap[st.id];
              const answered = ans && ans.isRelated !== null;

              return (
                <button
                  key={st.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setShowQuickDrawer(false);
                  }}
                  className={`flex items-center justify-between rounded-lg border p-2 text-left transition-all ${
                    idx === currentIndex
                      ? "border-emerald-600 bg-emerald-100/80 font-semibold text-emerald-900 dark:bg-emerald-900/50 dark:text-white"
                      : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
                  }`}
                >
                  <span className="truncate">
                    {idx + 1}. {st.name}
                  </span>
                  {answered ? (
                    ans.isRelated ? (
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                        Sí
                      </span>
                    ) : (
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                        No
                      </span>
                    )
                  ) : (
                    <span className="text-[10px] text-zinc-400">Pendiente</span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Main Active Stakeholder Card (One at a time, optimized for mobile) */}
      <Card className="overflow-hidden border-zinc-200/80 shadow-lg dark:border-zinc-800">
        {/* Header with Category and Icon */}
        <div className="border-b border-zinc-100 bg-gradient-to-r from-emerald-50/60 via-teal-50/40 to-transparent p-5 sm:p-6 dark:border-zinc-800 dark:from-emerald-950/30 dark:via-zinc-900 dark:to-transparent">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-emerald-300 bg-emerald-50/80 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {currentItem.category || "Stakeholder"}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                {currentItem.tripleImpactDimension}
              </Badge>
            </div>

            {currentItem.id.startsWith("custom_") && (
              <Button
                variant="destructive"
                size="xs"
                onClick={() => handleDeleteCustom(currentItem.id)}
                className="text-xs"
              >
                <Trash2 className="size-3 mr-1" />
                Eliminar
              </Button>
            )}
          </div>

          <div className="mt-3 flex items-start gap-3.5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              {ICON_MAP[currentItem.iconName] || <Users className="size-6" />}
            </div>

            <div className="flex-1 min-w-0">
              {currentItem.id.startsWith("custom_") || currentItem.id === "otros" ? (
                <div className="space-y-1">
                  <label htmlFor="custom_st_name" className="text-xs font-medium text-muted-foreground">
                    Nombre del stakeholder:
                  </label>
                  <Input
                    id="custom_st_name"
                    value={currentAnswer.stakeholderName || currentItem.name}
                    placeholder="Ej. Medios locales, Centros comunitarios, etc."
                    onChange={(e) => handleUpdateCurrent({ stakeholderName: e.target.value })}
                    className="font-bold text-base h-10"
                  />
                </div>
              ) : (
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {currentIndex + 1}. {currentItem.name}
                </h2>
              )}

              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {currentItem.shortDescription}
              </p>

              {currentItem.examples && currentItem.examples.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    Ejemplos:
                  </span>
                  {currentItem.examples.map((ex, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-5 sm:p-6 space-y-6">
          {/* Question 1: ¿Este stakeholder tiene relación con tu emprendimiento? */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                1
              </span>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                ¿Este stakeholder tiene relación con tu emprendimiento?
              </h3>
            </div>

            {/* Big touchable buttons for mobile */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => handleSetRelation(true)}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 p-4 text-center transition-all ${
                  currentAnswer.isRelated === true
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm ring-2 ring-emerald-500/20 dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-100"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850"
                }`}
              >
                <div
                  className={`flex size-8 items-center justify-center rounded-full ${
                    currentAnswer.isRelated === true
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                  }`}
                >
                  <CheckCircle2 className="size-5" />
                </div>
                <span className="text-base font-bold">Sí</span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Tiene vínculo directo o indirecto
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSetRelation(false)}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 p-4 text-center transition-all ${
                  currentAnswer.isRelated === false
                    ? "border-zinc-600 bg-zinc-100 text-zinc-900 shadow-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850"
                }`}
              >
                <div
                  className={`flex size-8 items-center justify-center rounded-full ${
                    currentAnswer.isRelated === false
                      ? "bg-zinc-700 text-white"
                      : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                  }`}
                >
                  <span className="text-sm font-bold">✕</span>
                </div>
                <span className="text-base font-bold">No</span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  No aplica a mi negocio actualmente
                </span>
              </button>
            </div>
          </div>

          {/* Conditional Evaluation Questions (If Yes) */}
          {currentAnswer.isRelated === true && (
            <div className="space-y-6 rounded-2xl border border-emerald-100 bg-emerald-50/20 p-4 sm:p-5 dark:border-emerald-950 dark:bg-emerald-950/10">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-3 dark:border-emerald-900/50">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Evaluación de Impacto e Importancia
                </span>
                {priorityPreview && (
                  <Badge variant={priorityPreview.badgeVariant} className="text-xs font-semibold py-1">
                    <span className="size-2 rounded-full mr-1.5" style={{ backgroundColor: priorityPreview.dotColor }} />
                    {priorityPreview.priority}
                  </Badge>
                )}
              </div>

              {/* A. Importancia para el emprendimiento */}
              <div className="space-y-2.5">
                <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  A. ¿Qué tan importante es este stakeholder para tu emprendimiento?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {IMPORTANCE_OPTIONS.map((opt) => {
                    const isSelected = currentAnswer.importance === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleUpdateCurrent({ importance: opt.value })}
                        className={`flex flex-col text-left rounded-xl border p-3 transition-all ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-medium ring-2 ring-emerald-500/20 dark:border-emerald-500 dark:bg-emerald-950/80 dark:text-white"
                            : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{opt.label}</span>
                          <span
                            className={`size-3.5 rounded-full border ${
                              isSelected
                                ? "border-emerald-600 bg-emerald-600"
                                : "border-zinc-300 dark:border-zinc-600"
                            }`}
                          />
                        </div>
                        <span className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                          {opt.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* B. Impacto del stakeholder sobre el emprendimiento */}
              <div className="space-y-2.5">
                <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  B. ¿Qué tanto impacto puede generar este stakeholder sobre tu emprendimiento?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {IMPACT_OPTIONS.map((opt) => {
                    const isSelected = currentAnswer.impactOnVenture === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleUpdateCurrent({ impactOnVenture: opt.value })}
                        className={`flex flex-col text-left rounded-xl border p-3 transition-all ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-medium ring-2 ring-emerald-500/20 dark:border-emerald-500 dark:bg-emerald-950/80 dark:text-white"
                            : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{opt.label}</span>
                          <span
                            className={`size-3.5 rounded-full border ${
                              isSelected
                                ? "border-emerald-600 bg-emerald-600"
                                : "border-zinc-300 dark:border-zinc-600"
                            }`}
                          />
                        </div>
                        <span className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                          {opt.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* C. Impacto del emprendimiento sobre el stakeholder */}
              <div className="space-y-2.5">
                <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  C. ¿Qué tanto impacto genera tu emprendimiento sobre este stakeholder?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {IMPACT_OPTIONS.map((opt) => {
                    const isSelected = currentAnswer.impactOfVenture === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleUpdateCurrent({ impactOfVenture: opt.value })}
                        className={`flex flex-col text-left rounded-xl border p-3 transition-all ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-medium ring-2 ring-emerald-500/20 dark:border-emerald-500 dark:bg-emerald-950/80 dark:text-white"
                            : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{opt.label}</span>
                          <span
                            className={`size-3.5 rounded-full border ${
                              isSelected
                                ? "border-emerald-600 bg-emerald-600"
                                : "border-zinc-300 dark:border-zinc-600"
                            }`}
                          />
                        </div>
                        <span className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                          {opt.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Notes / Key Actions */}
              <div className="space-y-1.5 pt-2">
                <label htmlFor="notes_current_st" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Notas o comentarios específicos sobre este stakeholder (opcional):
                </label>
                <Input
                  id="notes_current_st"
                  placeholder="Ej. Persona de contacto, acuerdos clave, acuerdos de sostenibilidad..."
                  value={currentAnswer.notes || ""}
                  onChange={(e) => handleUpdateCurrent({ notes: e.target.value })}
                  className="text-xs bg-white dark:bg-zinc-900"
                />
              </div>

              {/* Dynamic Priority Interpretation Box */}
              {priorityPreview && (
                <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: priorityPreview.dotColor }} />
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      Resultado: {priorityPreview.priority}
                    </span>
                    <span className="text-xs text-muted-foreground">— {priorityPreview.interpretation}</span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 italic">
                    💡 {priorityPreview.recommendation}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* If No is selected */}
          {currentAnswer.isRelated === false && (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center text-xs text-muted-foreground dark:border-zinc-800 dark:bg-zinc-900">
              Has marcado que este stakeholder no tiene relación activa con tu emprendimiento. Puedes avanzar al siguiente.
            </div>
          )}
        </CardContent>

        {/* Wizard Footer Controls */}
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-100 bg-zinc-50/60 p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="text-xs font-medium"
            >
              <ArrowLeft className="size-3.5 mr-1" />
              Anterior
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAddCustomStakeholder}
              className="text-xs text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
            >
              <PlusCircle className="size-3.5 mr-1" />
              + Agregar otro
            </Button>
          </div>

          <div className="flex w-full sm:w-auto items-center justify-end gap-2">
            {currentIndex < stakeholderList.length - 1 ? (
              <Button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.min(stakeholderList.length - 1, prev + 1))}
                className="w-full sm:w-auto bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold px-5"
              >
                <span>Siguiente</span>
                <ArrowRight className="size-3.5 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleFinishWizard}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 text-xs font-bold shadow-md px-5"
              >
                <span>Finalizar y Ver Resultados 🎉</span>
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
