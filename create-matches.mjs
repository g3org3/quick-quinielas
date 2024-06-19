// @ts-check
import { z } from 'zod'
import PocketBase from 'pocketbase'
// import rawMatches from './uefa-euro-2024.json' assert { type: 'json'}
import rawMatches from './copa-america-2024.json' assert { type: 'json'}

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
})

const matchesSchema = matchSchema.array()

const matches = matchesSchema.parse(rawMatches)
const group_matches = matches.filter(m => !!m.Group)

export const pb = new PocketBase('https://pb3.jorgeadolfo.com')

for (const match of group_matches.slice(0, 1)) {
  await pb.collection('matches').create({
    home: match.HomeTeam,
    away: match.AwayTeam,
    homeScore: match.HomeTeamScore,
    awayScore: match.AwayTeamScore,
    startAtUtc: match.DateUtc.replace(' ', 'T'),
    location: match.Location,
    matchNumber: match.MatchNumber,
    roundNumber: match.RoundNumber,
    // tournament: 'sgu35bedplexmbl', // euro
    tournament: 'dygb4yq03low8yc', // copa america
  })
}

