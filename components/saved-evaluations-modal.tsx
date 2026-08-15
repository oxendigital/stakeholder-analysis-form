"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Trash2, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VentureData } from "./venture-initial-form";
import { StakeholderAnswer } from "./stakeholder-wizard";

interface SavedEvaluation {
  id: string;
  ventureName: string;
  entrepreneurName: string;
  industry: string;
  date: string;
}

interface SavedEvaluationsModalProps {
  onClose: () => void;
  onLoadEvaluation: (venture: VentureData, answers: StakeholderAnswer[]) => void;
}

export function SavedEvaluationsModal({
  onClose,
  onLoadEvaluation,
}: SavedEvaluationsModalProps) {
  const [list, setList] = useState<SavedEvaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);

  const requestEvaluations = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/evaluations", { signal });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Error");
      setList(json.data || []);
      setError(null);
    } catch (e) {
      if (signal?.aborted) return;
      console.error("No se pudo cargar el historial:", e);
      setError("No se pudo cargar la lista de análisis guardados.");
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  // El modal se monta sólo cuando se abre, así que la carga ocurre una vez.
  useEffect(() => {
    const controller = new AbortController();
    // La lista vive en el servidor: pedirla al montar es justamente el caso de
    // sincronización con un sistema externo, y el estado se actualiza al responder.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    requestEvaluations(controller.signal);
    return () => controller.abort();
  }, [requestEvaluations]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const refresh = () => {
    setIsLoading(true);
    requestEvaluations();
  };

  const handleOpen = async (id: string) => {
    setOpeningId(id);
    setError(null);
    try {
      const res = await fetch(`/api/evaluations/${id}`);
      const json = await res.json();
      if (!res.ok || !json.success || !json.data) throw new Error(json.error || "Error");

      const item = json.data;
      const venture: VentureData = {
        id: item.id,
        ventureName: item.ventureName,
        entrepreneurName: item.entrepreneurName,
        industry: item.industry,
        date: item.date,
        notes: item.notes || "",
      };

      const answers: StakeholderAnswer[] = (item.responses || []).map((r: Record<string, unknown>) => ({
        stakeholderKey: String(r.stakeholderKey),
        stakeholderName: String(r.stakeholderName),
        category: (r.category as string) || undefined,
        tripleImpactDimension: (r.tripleImpactDimension as string) || undefined,
        isCustom: Boolean(r.isCustom),
        isRelated: Boolean(r.isRelated),
        importance: (r.importance as StakeholderAnswer["importance"]) ?? null,
        impactOnVenture: (r.impactOnVenture as StakeholderAnswer["impactOnVenture"]) ?? null,
        impactOfVenture: (r.impactOfVenture as StakeholderAnswer["impactOfVenture"]) ?? null,
        notes: (r.notes as string) || "",
      }));

      onLoadEvaluation(venture, answers);
      onClose();
    } catch (e) {
      console.error("No se pudo abrir el análisis:", e);
      setError("No se pudo abrir ese análisis.");
    } finally {
      setOpeningId(null);
    }
  };

  const handleDelete = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!confirm("¿Eliminar este análisis guardado?")) return;

    try {
      const res = await fetch(`/api/evaluations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error");
      setList((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      console.error("No se pudo eliminar:", e);
      setError("No se pudo eliminar ese análisis.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/25 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="saved-title"
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-border bg-card sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 id="saved-title" className="text-base font-semibold">
            Análisis guardados
          </h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={refresh}
              disabled={isLoading}
              aria-label="Actualizar lista"
            >
              <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Cerrar">
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <div className="min-h-32 flex-1 overflow-y-auto">
          {error && <p className="px-5 py-4 text-sm text-destructive">{error}</p>}

          {isLoading && list.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">Cargando…</p>
          )}

          {!isLoading && list.length === 0 && !error && (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              Todavía no hay análisis guardados. Al terminar uno, usa el botón
              &ldquo;Guardar análisis&rdquo;.
            </p>
          )}

          {list.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 border-b border-border pr-3 last:border-b-0"
            >
              <button
                type="button"
                onClick={() => handleOpen(item.id)}
                disabled={openingId === item.id}
                className="flex min-w-0 flex-1 items-center gap-3 py-4 pl-5 text-left transition-colors hover:bg-muted disabled:opacity-60"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{item.ventureName}</span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {[item.entrepreneurName, item.industry, item.date]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {openingId === item.id ? "Abriendo…" : "Abrir"}
                </span>
              </button>

              <Button
                variant="ghost"
                size="icon-sm"
                onClick={(event) => handleDelete(item.id, event)}
                aria-label={`Eliminar ${item.ventureName}`}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
