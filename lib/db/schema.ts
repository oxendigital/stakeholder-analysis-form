import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const evaluations = sqliteTable("evaluations", {
  id: text("id").primaryKey(),
  ventureName: text("venture_name").notNull(),
  entrepreneurName: text("entrepreneur_name").notNull(),
  industry: text("industry").notNull(),
  date: text("date").notNull(),
  notes: text("notes"),
  status: text("status").default("completed").notNull(),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const stakeholderResponses = sqliteTable("stakeholder_responses", {
  id: text("id").primaryKey(),
  evaluationId: text("evaluation_id")
    .notNull()
    .references(() => evaluations.id, { onDelete: "cascade" }),
  stakeholderKey: text("stakeholder_key").notNull(),
  stakeholderName: text("stakeholder_name").notNull(),
  category: text("category").default("General"),
  tripleImpactDimension: text("triple_impact_dimension").default("Transversal"),
  isCustom: integer("is_custom", { mode: "boolean" }).default(false).notNull(),
  isRelated: integer("is_related", { mode: "boolean" }).notNull(),
  importance: text("importance"), // 'Poco importante' | 'Medianamente importante' | 'Muy importante'
  impactOnVenture: text("impact_on_venture"), // 'Bajo impacto' | 'Impacto medio' | 'Alto impacto'
  impactOfVenture: text("impact_of_venture"), // 'Bajo impacto' | 'Impacto medio' | 'Alto impacto'
  priority: text("priority"), // 'Prioridad máxima' | 'Prioritario' | 'Gestionar' | 'Observar' | 'Monitorear' | 'Baja prioridad' | 'No aplica'
  priorityScore: integer("priority_score").default(0),
  strategicAction: text("strategic_action"),
  notes: text("notes"),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export type Evaluation = typeof evaluations.$inferSelect;
export type NewEvaluation = typeof evaluations.$inferInsert;
export type StakeholderResponse = typeof stakeholderResponses.$inferSelect;
export type NewStakeholderResponse = typeof stakeholderResponses.$inferInsert;
