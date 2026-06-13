// @ts-check
import { z } from "zod";
import PocketBase from "pocketbase";
// import rawMatches from './eufa-euro-2024.json' with { type: 'json'}
// import rawMatches from './copa-america-2024.json' with { type: 'json'}
import rawMatches from "./fifa-world-cup-2026.json" with { type: "json" };

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
const matches = matchesSchema.parse(rawMatches);
const group_matches = matches.filter((m) => !!m.Group);

export const pb = new PocketBase("https://pb3.jorgeadolfo.com");

for (const match of group_matches) {
  if (match.HomeTeamScore === null) {
    console.log(
      `${match.MatchNumber}: ${match.HomeTeam} ${match.HomeTeamScore} - ${match.AwayTeamScore} ${match.AwayTeam} [skip]`,
    );
    continue;
  }
  console.log(
    `${match.MatchNumber}: ${match.HomeTeam} ${match.HomeTeamScore} - ${match.AwayTeamScore} ${match.AwayTeam}`,
  );
  const [dbmatch] = await pb.collection("matches").getFullList({
    // filter: `tournament = 'sgu35bedplexmbl' && matchNumber = '${match.MatchNumber}'` // euro
    // filter: `tournament = 'dygb4yq03low8yc' && matchNumber = '${match.MatchNumber}'` // copaamerica
    filter: `tournament = 'izl4jbo5w25yf6b' && matchNumber = '${match.MatchNumber}'`, // copaamerica
  });

  if (match.HomeTeamScore === dbmatch.homeScore && match.AwayTeamScore === dbmatch.awayScore) {
    console.log('skip')
    continue
  }

  await pb.collection("matches").update(dbmatch.id, {
    homeScore: match.HomeTeamScore,
    awayScore: match.AwayTeamScore,
  });
}
