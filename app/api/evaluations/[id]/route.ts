import { NextRequest, NextResponse } from "next/server";
import { db, ensureDbInitialized } from "@/lib/db";
import { evaluations, stakeholderResponses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbInitialized();
    const { id } = await params;

    const evalData = await db.select().from(evaluations).where(eq(evaluations.id, id));

    if (evalData.length === 0) {
      return NextResponse.json(
        { success: false, error: "Evaluación no encontrada" },
        { status: 404 }
      );
    }

    const responses = await db
      .select()
      .from(stakeholderResponses)
      .where(eq(stakeholderResponses.evaluationId, id));

    return NextResponse.json({
      success: true,
      data: {
        ...evalData[0],
        responses,
      },
    });
  } catch (error) {
    console.error("Error retrieving evaluation:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener la evaluación", details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbInitialized();
    const { id } = await params;

    await db.delete(stakeholderResponses).where(eq(stakeholderResponses.evaluationId, id));
    await db.delete(evaluations).where(eq(evaluations.id, id));

    return NextResponse.json({ success: true, message: "Evaluación eliminada correctamente" });
  } catch (error) {
    console.error("Error deleting evaluation:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar la evaluación", details: String(error) },
      { status: 500 }
    );
  }
}
