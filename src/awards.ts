export const AWARD_STORIES = [
  {
    category: "exact_score",
    label: "Marcadores exactos",
    description: "Más marcadores acertados al detalle",
    emoji: "🎯",
    gradient: "linear(to-br, brand.700, brand.500)",
  },
  {
    category: "correct_result",
    label: "Resultados correctos",
    description: "Más ganadores y empates acertados",
    emoji: "🏆",
    gradient: "linear(to-br, orange.700, orange.400)",
  },
  {
    category: "correct_first_goal",
    label: "Momento del primer gol",
    description: "Más momentos del primer gol acertados",
    emoji: "⏱️",
    gradient: "linear(to-br, purple.700, purple.400)",
  },
  {
    category: "correct_first_goal_from",
    label: "Equipo del primer gol",
    description: "Más equipos del primer gol acertados",
    emoji: "⚽",
    gradient: "linear(to-br, blue.700, cyan.500)",
  },
  {
    category: "correct_penalty_winner",
    label: "Ganadores en penales",
    description: "Más ganadores de tandas acertados",
    emoji: "🥅",
    gradient: "linear(to-br, pink.700, red.400)",
  },
] as const;

export type AwardCategory = (typeof AWARD_STORIES)[number]["category"];

export interface AwardScoreRow {
  id: string;
  score: number;
  userId: string;
}

export interface RankedAwardRow<T extends AwardScoreRow = AwardScoreRow> {
  rank: number;
  row: T;
}

export interface AwardRankGroups<T extends AwardScoreRow = AwardScoreRow> {
  podium: Map<number, RankedAwardRow<T>[]>;
  fourth: RankedAwardRow<T>[];
}

export function rankAwardRows<T extends AwardScoreRow>(
  rows: readonly T[]
): RankedAwardRow<T>[] {
  const sortedRows = [...rows].sort(
    (left, right) => right.score - left.score || left.id.localeCompare(right.id)
  );
  let rank = 0;
  let previousScore: number | undefined;

  return sortedRows.map((row) => {
    if (previousScore === undefined || row.score !== previousScore) {
      rank += 1;
      previousScore = row.score;
    }

    return { row, rank };
  });
}

export function groupAwardRanks<T extends AwardScoreRow>(
  rankedRows: readonly RankedAwardRow<T>[]
): AwardRankGroups<T> {
  const podium = new Map<number, RankedAwardRow<T>[]>();
  const fourth: RankedAwardRow<T>[] = [];

  rankedRows.forEach((entry) => {
    if (entry.rank >= 1 && entry.rank <= 3) {
      const group = podium.get(entry.rank) ?? [];
      group.push(entry);
      podium.set(entry.rank, group);
    } else if (entry.rank === 4) {
      fourth.push(entry);
    }
  });

  return { podium, fourth };
}

export function wrapStoryIndex(index: number, storyCount: number): number {
  if (storyCount <= 0) return 0;
  return ((index % storyCount) + storyCount) % storyCount;
}
