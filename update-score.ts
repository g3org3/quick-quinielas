import { z } from "zod";
import PocketBase from "pocketbase";

const pb = new PocketBase("https://pb.jagc.app");

const matchSchema = z.object({
  MatchNumber: z.number(),
  RoundNumber: z.number(),
  DateUtc: z.string(),
  Location: z.string(),
  HomeTeam: z.string(),
  AwayTeam: z.string(),
  Group: z.string().nullish(),
  HomeTeamScore: z.number().nullish(),
  AwayTeamScore: z.number().nullish(),
});
const matchesSchema = matchSchema.array();

type MatchDB = {
  id: string;
  created: string;
  updated: string;
  collectionId: string;
  collectionName: string;
  away?: string;
  awayScore?: number;
  home?: string;
  homeScore?: number;
  location?: string;
  matchNumber?: number;
  roundNumber?: number;
  startAtUtc?: string;
  tournament?: string;
};

async function getResults() {
  const res = await fetch(
    "https://fixturedownload.com/feed/json/fifa-world-cup-2026",
  );
  const payload = await res.json();

  return matchesSchema.parseAsync(payload);
}

async function main() {
  const results = await getResults();
  for (const match of results) {
    if (match.HomeTeamScore === null) {
      console.log(
        `${match.MatchNumber}: ${match.HomeTeam} ${match.HomeTeamScore} - ${match.AwayTeamScore} ${match.AwayTeam} [skip]`,
      );
      continue;
    }
    console.log(
      `${match.MatchNumber}: ${match.HomeTeam} ${match.HomeTeamScore} - ${match.AwayTeamScore} ${match.AwayTeam}`,
    );
    const [dbmatch] = await pb.collection("matches").getFullList<MatchDB>({
      // filter: `tournament = 'sgu35bedplexmbl' && matchNumber = '${match.MatchNumber}'` // euro
      // filter: `tournament = 'dygb4yq03low8yc' && matchNumber = '${match.MatchNumber}'` // copaamerica
      filter: `tournament = 'izl4jbo5w25yf6b' && matchNumber = '${match.MatchNumber}'`, // wc2026
    });

    if (
      match.HomeTeamScore === dbmatch.homeScore &&
      match.AwayTeamScore === dbmatch.awayScore
    ) {
      console.log("skip");
      continue;
    }

    console.log("updated");
    await pb.collection("matches").update(dbmatch.id, {
      homeScore: match.HomeTeamScore,
      awayScore: match.AwayTeamScore,
    });
  }
}

await main();
