"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, Trash2, ArrowRight, RefreshCw, Sparkles, Building2, Calendar, User } from "lucide-react";
import { VentureData } from "./venture-initial-form";
import { StakeholderAnswer } from "./stakeholder-wizard";

interface SavedEvaluationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadEvaluation: (venture: VentureData, answers: StakeholderAnswer[]) => void;
}

export function SavedEvaluationsModal({
  isOpen,
  onClose,
  onLoadEvaluation,
}: SavedEvaluationsModalProps) {
  const [evaluationsList, setEvaluationsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const fetchEvaluations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/evaluations");
      const json = await res.json();
      if (json.success) {
        setEvaluationsList(json.data || []);
      }
    } catch (e) {
      console.error("Error fetching evaluations:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEvaluations();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = async (evalItem: any) => {
    setLoadingId(evalItem.id);
    try {
      const res = await fetch(`/api/evaluations/${evalItem.id}`);
      const json = await res.json();
      if (json.success && json.data) {
        const item = json.data;
        const venture: VentureData = {
          id: item.id,
          ventureName: item.ventureName,
          entrepreneurName: item.entrepreneurName,
          industry: item.industry,
          date: item.date,
          notes: item.notes || "",
        };

        const answers: StakeholderAnswer[] = (item.responses || []).map((r: any) => ({
          stakeholderKey: r.stakeholderKey,
          stakeholderName: r.stakeholderName,
          category: r.category,
          tripleImpactDimension: r.tripleImpactDimension,
          isCustom: Boolean(r.isCustom),
          isRelated: Boolean(r.isRelated),
          importance: r.importance,
          impactOnVenture: r.impactOnVenture,
          impactOfVenture: r.impactOfVenture,
          notes: r.notes,
        }));

        onLoadEvaluation(venture, answers);
        onClose();
      }
    } catch (e) {
      console.error("Error loading evaluation:", e);
      alert("Error al cargar la evaluación.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("¿Seguro que deseas eliminar esta evaluación?")) return;

    try {
      await fetch(`/api/evaluations/${id}`, { method: "DELETE" });
      setEvaluationsList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 p-5 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <History className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Evaluaciones Guardadas
              </h3>
              <p className="text-xs text-muted-foreground">
                Historial sincronizado con Turso DB / SQLite local
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={fetchEvaluations}
              disabled={isLoading}
              title="Recargar lista"
            >
              <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <button
              onClick={onClose}
              className="size-8 rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 flex items-center justify-center dark:hover:bg-zinc-800"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-5 space-y-3">
          {isLoading && evaluationsList.length === 0 && (
            <div className="text-center py-10 text-xs text-muted-foreground">
              Cargando historial de la base de datos...
            </div>
          )}

          {!isLoading && evaluationsList.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
              <History className="size-8 mx-auto text-zinc-300 mb-2" />
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                No hay evaluaciones guardadas aún
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Completa un análisis y haz clic en "Guardar en Turso DB" para preservarlo.
              </p>
            </div>
          )}

          {evaluationsList.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-zinc-200 p-4 transition-all hover:border-emerald-500 hover:bg-emerald-50/20 cursor-pointer dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-zinc-900 group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400">
                    {item.ventureName}
                  </h4>
                  <Badge variant="outline" className="text-[10px]">
                    {item.industry}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="size-3 text-emerald-600" />
                    {item.entrepreneurName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3 text-emerald-600" />
                    {item.date}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={(e) => handleDelete(item.id, e)}
                  className="text-zinc-400 hover:text-rose-600"
                  title="Eliminar de la BD"
                >
                  <Trash2 className="size-3.5" />
                </Button>

                <Button
                  size="sm"
                  disabled={loadingId === item.id}
                  className="text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <span>{loadingId === item.id ? "Cargando..." : "Abrir"}</span>
                  <ArrowRight className="size-3 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-100 bg-zinc-50 p-4 flex justify-end dark:border-zinc-800 dark:bg-zinc-900">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
