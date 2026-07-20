import { describe, expect, it } from "vitest";

import {
  AWARD_STORIES,
  groupAwardRanks,
  isAwardScoreEligible,
  rankAwardRows,
  wrapStoryIndex,
  type AwardScoreRow,
} from "./awards";

const row = (id: string, score: number): AwardScoreRow => ({
  id,
  score,
  userId: `user-${id}`,
});

describe("AWARD_STORIES", () => {
  it("keeps the five requested categories in story order with Spanish labels", () => {
    expect(
      AWARD_STORIES.map(({ category, label }) => ({ category, label }))
    ).toEqual([
      { category: "exact_score", label: "Marcadores exactos" },
      { category: "correct_result", label: "Resultados correctos" },
      {
        category: "correct_first_goal",
        label: "Momento del primer gol",
      },
      {
        category: "correct_first_goal_from",
        label: "Equipo del primer gol",
      },
      {
        category: "correct_penalty_winner",
        label: "Ganadores en penales",
      },
    ]);
  });
});

describe("award ranking", () => {
  it("excludes zero scores from every award", () => {
    expect(isAwardScoreEligible(0)).toBe(false);
    expect(isAwardScoreEligible(1)).toBe(true);
  });

  it("sorts descending and uses dense shared ranks", () => {
    const ranked = rankAwardRows([
      row("f", 0),
      row("c", 8),
      row("b", 10),
      row("e", 2),
      row("a", 10),
      row("d", 8),
    ]);

    expect(
      ranked.map(({ row: rankedRow, rank }) => [rankedRow.id, rank])
    ).toEqual([
      ["a", 1],
      ["b", 1],
      ["c", 2],
      ["d", 2],
      ["e", 3],
      ["f", 4],
    ]);
  });

  it("leaves an all-zero award without ranked participants", () => {
    const eligibleRows = [row("c", 0), row("a", 0), row("b", 0)].filter(
      ({ score }) => isAwardScoreEligible(score)
    );

    expect(rankAwardRows(eligibleRows)).toEqual([]);
  });

  it("groups every tie in podium ranks one through three and rank four", () => {
    const groups = groupAwardRanks(
      rankAwardRows([
        row("a", 10),
        row("b", 10),
        row("c", 8),
        row("d", 6),
        row("e", 6),
        row("f", 4),
        row("g", 4),
        row("h", 1),
      ])
    );

    expect(
      [...groups.podium.entries()].map(([rank, entries]) => [
        rank,
        entries.map(({ row }) => row.id),
      ])
    ).toEqual([
      [1, ["a", "b"]],
      [2, ["c"]],
      [3, ["d", "e"]],
    ]);
    expect(groups.fourth.map(({ row }) => row.id)).toEqual(["f", "g"]);
  });
});

describe("wrapStoryIndex", () => {
  it("wraps previous and next story indexes", () => {
    expect(wrapStoryIndex(5, 5)).toBe(0);
    expect(wrapStoryIndex(-1, 5)).toBe(4);
    expect(wrapStoryIndex(2, 5)).toBe(2);
    expect(wrapStoryIndex(10, 0)).toBe(0);
  });
});
