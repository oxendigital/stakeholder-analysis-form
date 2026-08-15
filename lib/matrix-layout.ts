import {
  calculateStakeholderPriority,
  PriorityEvaluationResult,
} from "@/lib/matrix-calculations";

export interface MatrixPoint<T> {
  answer: T;
  calc: PriorityEvaluationResult;
  /** Número mostrado en la matriz y en la leyenda (1 = mayor prioridad). */
  index: number;
  /** Posición dentro del área del gráfico, en porcentaje (0 a 100). */
  left: number;
  top: number;
}

interface EvaluableAnswer {
  stakeholderName: string;
  isRelated: boolean | null;
  importance: string | null;
  impactOnVenture: string | null;
  impactOfVenture: string | null;
}

/**
 * Ordena los stakeholders evaluados por prioridad y calcula su posición dentro
 * de la matriz de 3x3. Cuando varios caen en la misma casilla se reparten en una
 * subcuadrícula para que ninguno quede tapado.
 *
 * Lo usan tanto la matriz en pantalla como la del informe PDF, de manera que
 * ambas muestren exactamente la misma numeración y disposición.
 */
export function plotStakeholders<T extends EvaluableAnswer>(answers: T[]): MatrixPoint<T>[] {
  const evaluated = answers
    .filter((a) => a.isRelated === true && a.importance && a.impactOnVenture)
    .map((answer) => ({
      answer,
      calc: calculateStakeholderPriority(
        answer.importance,
        answer.impactOnVenture,
        answer.impactOfVenture,
        answer.stakeholderName
      ),
    }))
    .sort((a, b) => b.calc.priorityScore - a.calc.priorityScore);

  const cells = new Map<string, typeof evaluated>();
  evaluated.forEach((item) => {
    const key = `${item.calc.xScore}_${item.calc.yScore}`;
    const bucket = cells.get(key);
    if (bucket) bucket.push(item);
    else cells.set(key, [item]);
  });

  const positions = new Map<T, { left: number; top: number }>();
  const cellSize = 100 / 3;

  cells.forEach((bucket) => {
    const columns = Math.ceil(Math.sqrt(bucket.length));
    const rows = Math.ceil(bucket.length / columns);
    const stepX = cellSize / (columns + 0.8);
    const stepY = cellSize / (rows + 0.8);

    bucket.forEach((item, i) => {
      const column = i % columns;
      const row = Math.floor(i / columns);
      const centerX = (item.calc.xScore - 0.5) * cellSize;
      const centerY = (3 - item.calc.yScore + 0.5) * cellSize;

      positions.set(item.answer, {
        left: centerX + (column - (columns - 1) / 2) * stepX,
        top: centerY + (row - (rows - 1) / 2) * stepY,
      });
    });
  });

  return evaluated.map((item, i) => ({
    ...item,
    index: i + 1,
    left: positions.get(item.answer)?.left ?? 50,
    top: positions.get(item.answer)?.top ?? 50,
  }));
}
