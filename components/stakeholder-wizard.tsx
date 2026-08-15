"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Plus,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  List,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { DEFAULT_STAKEHOLDERS, DefaultStakeholderItem } from "@/lib/stakeholders-data";
import {
  calculateStakeholderPriority,
  ImportanceLevel,
  ImpactLevel,
} from "@/lib/matrix-calculations";

export interface StakeholderAnswer {
  stakeholderKey: string;
  stakeholderName: string;
  category?: string;
  tripleImpactDimension?: string;
  isCustom?: boolean;
  isRelated: boolean | null; // null = todavía sin responder
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

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  Briefcase,
  Truck,
  Handshake,
  TrendingUp,
  Landmark,
  Building2,
  ShieldAlert,
  Home: HomeIcon,
  HeartHandshake,
  GraduationCap,
  Network,
  Leaf,
  PlusCircle: Plus,
};

const IMPORTANCE_OPTIONS: { value: ImportanceLevel; label: string; hint: string }[] = [
  { value: "Poco importante", label: "Poco importante", hint: "Su rol es secundario" },
  {
    value: "Medianamente importante",
    label: "Medianamente importante",
    hint: "Influye, pero el negocio sigue",
  },
  { value: "Muy importante", label: "Muy importante", hint: "Es clave para funcionar" },
];

const IMPACT_OPTIONS: { value: ImpactLevel; label: string; hint: string }[] = [
  { value: "Bajo impacto", label: "Bajo impacto", hint: "Efecto pequeño o manejable" },
  { value: "Impacto medio", label: "Impacto medio", hint: "Se nota, pero no define" },
  { value: "Alto impacto", label: "Alto impacto", hint: "Puede cambiar el rumbo" },
];

function isComplete(answer?: StakeholderAnswer): boolean {
  if (!answer || answer.isRelated === null) return false;
  if (answer.isRelated === false) return true;
  return Boolean(answer.importance && answer.impactOnVenture && answer.impactOfVenture);
}

function buildCustomItem(id: string, name: string): DefaultStakeholderItem {
  return {
    id,
    name,
    category: "Otro",
    tripleImpactDimension: "Transversal",
    iconName: "PlusCircle",
    shortDescription: "Otro grupo importante para tu negocio. Escribe su nombre.",
    examples: [],
  };
}

export function StakeholderWizard({
  answers: initialAnswers,
  onSaveAnswers,
  onFinish,
  onBackToProfile,
  ventureName,
}: StakeholderWizardProps) {
  // El wizard se monta con las respuestas ya guardadas y desde ahí es la fuente
  // de verdad, así que el estado se inicializa una sola vez.
  const [stakeholderList, setStakeholderList] = useState<DefaultStakeholderItem[]>(() => {
    const known = new Set(DEFAULT_STAKEHOLDERS.map((s) => s.id));
    const extras = initialAnswers
      .filter((a) => a.isCustom && !known.has(a.stakeholderKey))
      .map((a) => buildCustomItem(a.stakeholderKey, a.stakeholderName));
    return [...DEFAULT_STAKEHOLDERS, ...extras];
  });

  const [answersMap, setAnswersMap] = useState<Record<string, StakeholderAnswer>>(() =>
    Object.fromEntries(initialAnswers.map((a) => [a.stakeholderKey, a]))
  );

  const [currentIndex, setCurrentIndex] = useState(() => {
    const map = Object.fromEntries(initialAnswers.map((a) => [a.stakeholderKey, a]));
    const firstPending = DEFAULT_STAKEHOLDERS.findIndex((s) => !isComplete(map[s.id]));
    return firstPending === -1 ? 0 : firstPending;
  });

  const [showList, setShowList] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  const currentItem = stakeholderList[currentIndex] ?? stakeholderList[0];
  const totalCount = stakeholderList.length;

  const currentAnswer: StakeholderAnswer = answersMap[currentItem.id] ?? {
    stakeholderKey: currentItem.id,
    stakeholderName: currentItem.name,
    category: currentItem.category,
    tripleImpactDimension: currentItem.tripleImpactDimension,
    isCustom: currentItem.id.startsWith("custom_"),
    isRelated: null,
    importance: null,
    impactOnVenture: null,
    impactOfVenture: null,
    notes: "",
  };

  const commit = useCallback(
    (map: Record<string, StakeholderAnswer>) => {
      setAnswersMap(map);
      onSaveAnswers(Object.values(map));
    },
    [onSaveAnswers]
  );

  const updateCurrent = (patch: Partial<StakeholderAnswer>) => {
    const updated: StakeholderAnswer = {
      ...currentAnswer,
      ...patch,
      stakeholderKey: currentItem.id,
      stakeholderName: patch.stakeholderName ?? currentAnswer.stakeholderName ?? currentItem.name,
      category: currentItem.category,
      tripleImpactDimension: currentItem.tripleImpactDimension,
      isCustom: currentItem.id.startsWith("custom_"),
    };
    commit({ ...answersMap, [currentItem.id]: updated });
  };

  const goTo = (index: number) => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    const next = Math.min(totalCount - 1, Math.max(0, index));
    setCurrentIndex(next);
    cardRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  const handleSetRelation = (isRelated: boolean) => {
    if (isRelated) {
      updateCurrent({ isRelated: true });
      return;
    }

    // Regla del requerimiento: si responde "No", se avanza automáticamente.
    updateCurrent({
      isRelated: false,
      importance: null,
      impactOnVenture: null,
      impactOfVenture: null,
    });

    if (currentIndex < totalCount - 1) {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      advanceTimer.current = setTimeout(() => goTo(currentIndex + 1), 380);
    }
  };

  const handleAddCustom = () => {
    const taken = new Set(stakeholderList.map((item) => item.id));
    let suffix = 1;
    while (taken.has(`custom_${suffix}`)) suffix += 1;

    setStakeholderList((prev) => [
      ...prev,
      buildCustomItem(`custom_${suffix}`, "Otro grupo de interés"),
    ]);

    // No se usa `goTo`: ese ajusta el índice al largo actual de la lista, que
    // todavía no incluye el grupo recién agregado.
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    setCurrentIndex(stakeholderList.length);
    cardRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  const handleDeleteCustom = (id: string) => {
    const nextList = stakeholderList.filter((item) => item.id !== id);
    const nextMap = { ...answersMap };
    delete nextMap[id];

    setStakeholderList(nextList);
    commit(nextMap);
    setCurrentIndex((prev) => Math.min(prev, nextList.length - 1));
  };

  const completedCount = useMemo(
    () => stakeholderList.filter((item) => isComplete(answersMap[item.id])).length,
    [stakeholderList, answersMap]
  );

  const evaluatedCount = useMemo(
    () =>
      Object.values(answersMap).filter(
        (a) => a.isRelated === true && a.importance && a.impactOnVenture
      ).length,
    [answersMap]
  );

  const preview =
    currentAnswer.isRelated && currentAnswer.importance && currentAnswer.impactOnVenture
      ? calculateStakeholderPriority(
          currentAnswer.importance,
          currentAnswer.impactOnVenture,
          currentAnswer.impactOfVenture,
          currentAnswer.stakeholderName
        )
      : null;

  const isCustom = currentItem.id.startsWith("custom_");
  const isNameable = isCustom || currentItem.id === "otros";
  const missingAnswers =
    currentAnswer.isRelated === true &&
    !(currentAnswer.importance && currentAnswer.impactOnVenture && currentAnswer.impactOfVenture);

  const Icon = ICON_MAP[currentItem.iconName] ?? Users;
  const isLast = currentIndex === totalCount - 1;

  return (
    <div className="mx-auto max-w-2xl pb-28 sm:pb-8">
      {/* Encabezado y progreso */}
      <div className="pt-2 pb-6">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToProfile}
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            {ventureName || "Tu emprendimiento"}
          </button>

          <button
            type="button"
            onClick={() => setShowList((prev) => !prev)}
            aria-expanded={showList}
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <List className="size-3.5" />
            Ver los {totalCount}
          </button>
        </div>

        <div className="mt-4 flex items-baseline justify-between text-sm">
          <span className="font-medium">
            Grupo {currentIndex + 1} de {totalCount}
          </span>
          <span className="text-muted-foreground">{completedCount} respondidos</span>
        </div>
        <Progress
          value={completedCount}
          max={totalCount}
          label="Avance del análisis"
          className="mt-2"
        />

        {showList && (
          <div className="reveal mt-4 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
            {stakeholderList.map((item, index) => {
              const answer = answersMap[item.id];
              const done = isComplete(answer);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    goTo(index);
                    setShowList(false);
                  }}
                  className={`flex items-center justify-between gap-2 bg-card px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted ${
                    index === currentIndex ? "font-medium" : ""
                  }`}
                >
                  <span className="truncate">
                    <span className="tabular-nums text-muted-foreground">{index + 1}.</span>{" "}
                    {answer?.stakeholderName || item.name || "Sin nombre"}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {!done ? "—" : answer?.isRelated ? "Sí" : "No"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Tarjeta del stakeholder actual */}
      <div ref={cardRef} className="scroll-mt-20 rounded-xl border border-border bg-card">
        <div className="border-b border-border p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-brand-line bg-brand-soft text-brand-strong">
              <Icon className="size-5" />
            </span>

            {isCustom && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteCustom(currentItem.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
                Quitar
              </Button>
            )}
          </div>

          <p className="mt-4 text-xs uppercase tracking-[0.12em] text-muted-foreground">
            {currentItem.category}
          </p>

          {isNameable ? (
            <div className="mt-2 space-y-2">
              <label htmlFor="custom-name" className="block text-lg font-semibold tracking-tight">
                {isCustom ? "Otro grupo de interés" : "Otros"}
              </label>
              <Input
                id="custom-name"
                value={currentAnswer.stakeholderName === currentItem.name ? "" : currentAnswer.stakeholderName || ""}
                placeholder="Escribe el nombre del grupo"
                onChange={(e) =>
                  updateCurrent({ stakeholderName: e.target.value || currentItem.name })
                }
              />
            </div>
          ) : (
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{currentItem.name}</h2>
          )}

          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            {currentItem.shortDescription}
          </p>

          {currentItem.examples.length > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              Por ejemplo: {currentItem.examples.join(", ")}.
            </p>
          )}
        </div>

        <div className="p-5 sm:p-6">
          {/* Pregunta inicial */}
          <fieldset>
            <legend className="text-base font-medium">
              ¿Este grupo tiene relación con tu emprendimiento?
            </legend>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSetRelation(true)}
                aria-pressed={currentAnswer.isRelated === true}
                className={`flex h-14 items-center justify-center gap-2 rounded-lg border text-base font-medium transition-colors ${
                  currentAnswer.isRelated === true
                    ? "border-brand bg-brand-soft text-brand-strong"
                    : "border-border bg-card hover:border-foreground/25"
                }`}
              >
                <Check className="size-4" />
                Sí
              </button>

              <button
                type="button"
                onClick={() => handleSetRelation(false)}
                aria-pressed={currentAnswer.isRelated === false}
                className={`flex h-14 items-center justify-center gap-2 rounded-lg border text-base font-medium transition-colors ${
                  currentAnswer.isRelated === false
                    ? "border-foreground/60 bg-muted"
                    : "border-border bg-card hover:border-foreground/25"
                }`}
              >
                <X className="size-4" />
                No
              </button>
            </div>
          </fieldset>

          {currentAnswer.isRelated === false && (
            <p className="reveal mt-4 text-sm text-muted-foreground">
              Sin relación con tu negocio. {isLast ? "Puedes ver tus resultados." : "Pasamos al siguiente."}
            </p>
          )}

          {/* Preguntas de evaluación */}
          {currentAnswer.isRelated === true && (
            <div className="reveal mt-8 space-y-8">
              <OptionGroup
                label="¿Qué tan importante es este grupo para tu emprendimiento?"
                name="importance"
                options={IMPORTANCE_OPTIONS}
                value={currentAnswer.importance}
                onSelect={(value) => updateCurrent({ importance: value as ImportanceLevel })}
              />

              <OptionGroup
                label="¿Cuánto impacto puede generar este grupo sobre tu emprendimiento?"
                name="impact-on"
                options={IMPACT_OPTIONS}
                value={currentAnswer.impactOnVenture}
                onSelect={(value) => updateCurrent({ impactOnVenture: value as ImpactLevel })}
              />

              <OptionGroup
                label="¿Cuánto impacto genera tu emprendimiento sobre este grupo?"
                name="impact-of"
                options={IMPACT_OPTIONS}
                value={currentAnswer.impactOfVenture}
                onSelect={(value) => updateCurrent({ impactOfVenture: value as ImpactLevel })}
              />

              <div className="space-y-2">
                <label htmlFor="stakeholder-note" className="block text-sm font-medium">
                  Nota <span className="font-normal text-muted-foreground">(opcional)</span>
                </label>
                <Input
                  id="stakeholder-note"
                  placeholder="Ej. Contacto principal, acuerdos vigentes…"
                  value={currentAnswer.notes || ""}
                  onChange={(e) => updateCurrent({ notes: e.target.value })}
                />
              </div>

              {preview && (
                <div
                  className="rounded-lg border p-4"
                  style={{ borderColor: preview.borderColor, backgroundColor: preview.softBg }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: preview.color }}
                    />
                    <span className="text-sm font-semibold" style={{ color: preview.color }}>
                      {preview.priority}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      · {preview.interpretation}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">
                    {preview.action}
                  </p>
                </div>
              )}

              {missingAnswers && (
                <p className="text-sm text-muted-foreground">
                  Responde las tres preguntas para calcular la prioridad de este grupo.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Ayuda para quienes usan la herramienta por primera vez */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setShowHelp((prev) => !prev)}
          aria-expanded={showHelp}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronDown
            className={`size-3.5 transition-transform ${showHelp ? "rotate-180" : ""}`}
          />
          ¿Cómo respondo estas preguntas?
        </button>

        {showHelp && (
          <div className="reveal mt-3 space-y-2 rounded-lg border border-border bg-muted/50 p-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              <strong className="font-medium text-foreground">Importancia</strong> es cuánto
              necesitas a ese grupo para que tu negocio funcione.
            </p>
            <p>
              <strong className="font-medium text-foreground">Impacto sobre tu negocio</strong> es
              cuánto puede afectarte lo que ese grupo haga o decida.
            </p>
            <p>
              <strong className="font-medium text-foreground">Impacto de tu negocio</strong> es
              cuánto le afecta a ese grupo lo que tú haces.
            </p>
            <p>No hay respuestas correctas: responde con lo que ves hoy en tu negocio.</p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={handleAddCustom}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Plus className="size-3.5" />
          Agregar otro grupo de interés
        </button>
      </div>

      {/* Navegación */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur-md sm:static sm:mt-8 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Button
            variant="outline"
            size="xl"
            onClick={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="shrink-0"
            aria-label="Grupo anterior"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Anterior</span>
          </Button>

          {isLast ? (
            <Button
              size="xl"
              onClick={() => onFinish(Object.values(answersMap))}
              disabled={evaluatedCount === 0}
              className="flex-1"
            >
              Ver mis resultados
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button size="xl" onClick={() => goTo(currentIndex + 1)} className="flex-1">
              Siguiente
              <ArrowRight className="size-4" />
            </Button>
          )}
        </div>

        {evaluatedCount > 0 && !isLast && (
          <div className="mx-auto mt-2 flex max-w-2xl justify-center sm:mt-3">
            <button
              type="button"
              onClick={() => onFinish(Object.values(answersMap))}
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Terminar ahora y ver resultados
            </button>
          </div>
        )}
      </nav>
    </div>
  );
}

interface OptionGroupProps {
  label: string;
  name: string;
  options: { value: string; label: string; hint: string }[];
  value: string | null;
  onSelect: (value: string) => void;
}

function OptionGroup({ label, name, options, value, onSelect }: OptionGroupProps) {
  return (
    <fieldset>
      <legend className="text-base font-medium leading-snug text-balance">{label}</legend>

      <div className="mt-3 grid gap-2">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={`${name}-${option.value}`}
              type="button"
              onClick={() => onSelect(option.value)}
              aria-pressed={selected}
              className={`flex min-h-14 items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                selected
                  ? "border-brand bg-brand-soft"
                  : "border-border bg-card hover:border-foreground/25"
              }`}
            >
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  selected ? "border-brand bg-brand text-white" : "border-foreground/25"
                }`}
              >
                {selected && <Check className="size-3" strokeWidth={3} />}
              </span>

              <span className="min-w-0">
                <span
                  className={`block text-sm ${selected ? "font-semibold text-brand-strong" : "font-medium"}`}
                >
                  {option.label}
                </span>
                <span className="block text-sm text-muted-foreground">{option.hint}</span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
