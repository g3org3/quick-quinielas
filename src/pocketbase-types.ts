/**
 * This file was @generated using pocketbase-typegen
 */

import type PocketBase from "pocketbase";
import type { RecordService } from "pocketbase";

export enum Collections {
  Flags = "flags",
  Leaderboard = "leaderboard",
  MatchBets = "match_bets",
  Matches = "matches",
  Predictions = "predictions",
  Results = "results",
  Tournaments = "tournaments",
  UserBonusView = "user_bonus_view",
  Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string;
export type RecordIdString = string;
export type HTMLString = string;

// System fields
export type BaseSystemFields<T = never> = {
  id: RecordIdString;
  created: IsoDateString;
  updated: IsoDateString;
  collectionId: string;
  collectionName: Collections;
  expand?: T;
};

export type AuthSystemFields<T = never> = {
  email: string;
  emailVisibility: boolean;
  username: string;
  verified: boolean;
} & BaseSystemFields<T>;

// Record types for each collection

export type FlagsRecord = {
  feature: string;
  isActive?: boolean;
};

export type LeaderboardRecord<Tpoints = unknown> = {
  points?: null | Tpoints;
  tournament_id?: RecordIdString;
  user?: RecordIdString;
};

export type MatchBetsRecord<
  Taway_per = unknown,
  Thome_per = unknown,
  Ttie_per = unknown,
> = {
  away_per?: null | Taway_per;
  home_per?: null | Thome_per;
  match_id?: RecordIdString;
  tie_per?: null | Ttie_per;
};

export enum MatchesFirstGoalOptions {
  "primer_tiempo" = "primer_tiempo",
  "segundo_tiempo" = "segundo_tiempo",
  "tiempo_extra" = "tiempo_extra",
}

export enum MatchesFirstGoalFromOptions {
  "home" = "home",
  "away" = "away",
}

export enum MatchesPenaltyWinnerOptions {
  "home" = "home",
  "away" = "away",
}
export type MatchesRecord = {
  away?: string;
  awayScore?: number;
  enableBonus?: boolean;
  first_goal?: MatchesFirstGoalOptions;
  first_goal_from?: MatchesFirstGoalFromOptions;
  group?: string;
  home?: string;
  homeScore?: number;
  location?: string;
  matchNumber?: number;
  penalty_winner?: MatchesPenaltyWinnerOptions;
  roundNumber?: number;
  startAtUtc?: IsoDateString;
  tournament?: RecordIdString;
};

export enum PredictionsFirstGoalOptions {
  "primer_tiempo" = "primer_tiempo",
  "segundo_tiempo" = "segundo_tiempo",
}

export enum PredictionsFirstGoalFromOptions {
  "home" = "home",
  "away" = "away",
}

export enum PredictionsPenaltyWinnerOptions {
  "home" = "home",
  "away" = "away",
}
export type PredictionsRecord = {
  awayScore?: number;
  first_goal?: PredictionsFirstGoalOptions;
  first_goal_from?: PredictionsFirstGoalFromOptions;
  homeScore?: number;
  isBonusActive?: boolean;
  match?: RecordIdString;
  penalty_winner?: PredictionsPenaltyWinnerOptions;
  user?: RecordIdString;
};

export enum ResultsPFirstGoalOptions {
  "primer_tiempo" = "primer_tiempo",
  "segundo_tiempo" = "segundo_tiempo",
}

export enum ResultsPFirstGoalFromOptions {
  "home" = "home",
  "away" = "away",
}

export enum ResultsFirstGoalOptions {
  "primer_tiempo" = "primer_tiempo",
  "segundo_tiempo" = "segundo_tiempo",
  "tiempo_extra" = "tiempo_extra",
}

export enum ResultsFirstGoalFromOptions {
  "home" = "home",
  "away" = "away",
}
export type ResultsRecord<
  Tcorrect_first_goal = unknown,
  Tcorrect_first_goal_from = unknown,
  Tcorrect_penalty_winner = unknown,
  Tcorrect_result = unknown,
  Texact_score = unknown,
  Tpoints = unknown,
> = {
  away?: string;
  awayScore?: number;
  correct_first_goal?: null | Tcorrect_first_goal;
  correct_first_goal_from?: null | Tcorrect_first_goal_from;
  correct_penalty_winner?: null | Tcorrect_penalty_winner;
  correct_result?: null | Tcorrect_result;
  exact_score?: null | Texact_score;
  first_goal?: ResultsFirstGoalOptions;
  first_goal_from?: ResultsFirstGoalFromOptions;
  home?: string;
  homeScore?: number;
  isBonusActive?: boolean;
  match_id?: RecordIdString;
  p_away?: number;
  p_first_goal?: ResultsPFirstGoalOptions;
  p_first_goal_from?: ResultsPFirstGoalFromOptions;
  p_home?: number;
  prediction_id?: RecordIdString;
  points?: null | Tpoints;
  startAtUtc?: IsoDateString;
  tournament_id?: RecordIdString;
  user?: RecordIdString;
};

export type TournamentsRecord = {
  logo?: string;
  name?: string;
};

export type UserBonusViewRecord<Ttotal = unknown> = {
  total?: null | Ttotal;
  user?: RecordIdString;
};

export enum UsersTagsOptions {
  "Gonzalez" = "Gonzalez",
  "Caravantes" = "Caravantes",
  "Primos" = "Primos",
  "Mendia" = "Mendia",
  "Rodas" = "Rodas",
}
export type UsersRecord = {
  avatar?: string;
  favorite_team?: string;
  ignore?: boolean;
  img?: string;
  isAdmin?: boolean;
  name?: string;
  phone?: number;
  tags?: UsersTagsOptions[];
};

// Response types include system fields and match responses from the PocketBase API
export type FlagsResponse<Texpand = unknown> = Required<FlagsRecord> &
  BaseSystemFields<Texpand>;
export type LeaderboardResponse<
  Tpoints = unknown,
  Texpand = unknown,
> = Required<LeaderboardRecord<Tpoints>> & BaseSystemFields<Texpand>;
export type MatchBetsResponse<
  Taway_per = unknown,
  Thome_per = unknown,
  Ttie_per = unknown,
  Texpand = unknown,
> = Required<MatchBetsRecord<Taway_per, Thome_per, Ttie_per>> &
  BaseSystemFields<Texpand>;
export type MatchesResponse<Texpand = unknown> = Required<MatchesRecord> &
  BaseSystemFields<Texpand>;
export type PredictionsResponse<Texpand = unknown> =
  Required<PredictionsRecord> & BaseSystemFields<Texpand>;
export type ResultsResponse<
  Tcorrect_first_goal = unknown,
  Tcorrect_first_goal_from = unknown,
  Tcorrect_penalty_winner = unknown,
  Tcorrect_result = unknown,
  Texact_score = unknown,
  Tpoints = unknown,
  Texpand = unknown,
> = Required<
  ResultsRecord<
    Tcorrect_first_goal,
    Tcorrect_first_goal_from,
    Tcorrect_penalty_winner,
    Tcorrect_result,
    Texact_score,
    Tpoints
  >
> &
  BaseSystemFields<Texpand>;
export type TournamentsResponse<Texpand = unknown> =
  Required<TournamentsRecord> & BaseSystemFields<Texpand>;
export type UserBonusViewResponse<
  Ttotal = unknown,
  Texpand = unknown,
> = Required<UserBonusViewRecord<Ttotal>> & BaseSystemFields<Texpand>;
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> &
  AuthSystemFields<Texpand>;

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
  flags: FlagsRecord;
  leaderboard: LeaderboardRecord;
  match_bets: MatchBetsRecord;
  matches: MatchesRecord;
  predictions: PredictionsRecord;
  results: ResultsRecord;
  tournaments: TournamentsRecord;
  user_bonus_view: UserBonusViewRecord;
  users: UsersRecord;
};

export type CollectionResponses = {
  flags: FlagsResponse;
  leaderboard: LeaderboardResponse;
  match_bets: MatchBetsResponse;
  matches: MatchesResponse;
  predictions: PredictionsResponse;
  results: ResultsResponse;
  tournaments: TournamentsResponse;
  user_bonus_view: UserBonusViewResponse;
  users: UsersResponse;
};

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
  collection(idOrName: "flags"): RecordService<FlagsResponse>;
  collection(idOrName: "leaderboard"): RecordService<LeaderboardResponse>;
  collection(idOrName: "match_bets"): RecordService<MatchBetsResponse>;
  collection(idOrName: "matches"): RecordService<MatchesResponse>;
  collection(idOrName: "predictions"): RecordService<PredictionsResponse>;
  collection(idOrName: "results"): RecordService<ResultsResponse>;
  collection(idOrName: "tournaments"): RecordService<TournamentsResponse>;
  collection(idOrName: "user_bonus_view"): RecordService<UserBonusViewResponse>;
  collection(idOrName: "users"): RecordService<UsersResponse>;
};
