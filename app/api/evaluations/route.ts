import { NextRequest, NextResponse } from "next/server";
import { db, ensureDbInitialized } from "@/lib/db";
import { evaluations, stakeholderResponses } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { calculateStakeholderPriority } from "@/lib/matrix-calculations";

interface StakeholderResponsePayload {
  id?: string;
  stakeholderKey?: string;
  stakeholderName?: string;
  category?: string;
  tripleImpactDimension?: string;
  isCustom?: boolean;
  isRelated?: boolean;
  importance?: string | null;
  impactOnVenture?: string | null;
  impactOfVenture?: string | null;
  notes?: string;
}

export async function GET() {
  try {
    await ensureDbInitialized();

    const list = await db.select().from(evaluations).orderBy(desc(evaluations.createdAt)).limit(50);

    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    console.error("Error fetching evaluations:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener las evaluaciones", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDbInitialized();
    const body = await req.json();

    const {
      id,
      ventureName,
      entrepreneurName,
      industry,
      date,
      notes,
      status = "completed",
      responses = [],
    } = body;

    if (!ventureName || !entrepreneurName) {
      return NextResponse.json(
        { success: false, error: "Nombre del emprendimiento y emprendedor son requeridos" },
        { status: 400 }
      );
    }

    const evalId = id || "eval_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    const currentDate = date || new Date().toISOString().split("T")[0];

    // Check if exists
    const existing = await db.select().from(evaluations).where(eq(evaluations.id, evalId));

    if (existing.length > 0) {
      // Update
      await db
        .update(evaluations)
        .set({
          ventureName,
          entrepreneurName,
          industry: industry || "Otro",
          date: currentDate,
          notes: notes || "",
          status,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(evaluations.id, evalId));

      // Delete existing responses to replace
      await db.delete(stakeholderResponses).where(eq(stakeholderResponses.evaluationId, evalId));
    } else {
      // Insert
      await db.insert(evaluations).values({
        id: evalId,
        ventureName,
        entrepreneurName,
        industry: industry || "Otro",
        date: currentDate,
        notes: notes || "",
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Insert responses
    if (Array.isArray(responses) && responses.length > 0) {
      const responseRows = responses.map((r: StakeholderResponsePayload, idx: number) => {
        const priorityCalc = calculateStakeholderPriority(
          r.isRelated ? r.importance : null,
          r.isRelated ? r.impactOnVenture : null,
          r.isRelated ? r.impactOfVenture : null,
          r.stakeholderName
        );

        return {
          id: r.id || `${evalId}_resp_${idx}_${Date.now().toString(36)}`,
          evaluationId: evalId,
          stakeholderKey: r.stakeholderKey || "custom",
          stakeholderName: r.stakeholderName || "Stakeholder",
          category: r.category || "General",
          tripleImpactDimension: r.tripleImpactDimension || "Transversal",
          isCustom: Boolean(r.isCustom),
          isRelated: Boolean(r.isRelated),
          importance: r.isRelated ? r.importance || null : null,
          impactOnVenture: r.isRelated ? r.impactOnVenture || null : null,
          impactOfVenture: r.isRelated ? r.impactOfVenture || null : null,
          priority: r.isRelated ? priorityCalc.priority : "No aplica",
          priorityScore: r.isRelated ? priorityCalc.priorityScore : 0,
          strategicAction: r.isRelated ? priorityCalc.quadrantName : "No aplica",
          notes: r.notes || "",
          createdAt: new Date().toISOString(),
        };
      });

      await db.insert(stakeholderResponses).values(responseRows);
    }

    return NextResponse.json({
      success: true,
      data: { id: evalId, ventureName, entrepreneurName, count: responses.length },
    });
  } catch (error) {
    console.error("Error saving evaluation:", error);
    return NextResponse.json(
      { success: false, error: "Error al guardar la evaluación", details: String(error) },
      { status: 500 }
    );
  }
}
