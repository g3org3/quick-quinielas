/**
 * This file was @generated using pocketbase-typegen
 */

import type PocketBase from "pocketbase";
import type { RecordService } from "pocketbase";

export const Collections = {
  Awards: "awards",
  Flags: "flags",
  Leaderboard: "leaderboard",
  MatchBets: "match_bets",
  Matches: "matches",
  Predictions: "predictions",
  Results: "results",
  Tournaments: "tournaments",
  Users: "users",
} as const;
export type Collections = (typeof Collections)[keyof typeof Collections];

// Alias types for improved usability
export type IsoDateString = string;
export type IsoAutoDateString = string & { readonly autodate: unique symbol };
export type RecordIdString = string;
export type FileNameString = string & { readonly filename: unique symbol };
export type HTMLString = string;

type ExpandType<T> = unknown extends T
  ? T extends unknown
    ? { expand?: unknown }
    : { expand: T }
  : { expand: T };

// System fields
export type BaseSystemFields<T = unknown> = {
  id: RecordIdString;
  collectionId: string;
  collectionName: Collections;
} & ExpandType<T>;

export type AuthSystemFields<T = unknown> = {
  email: string;
  emailVisibility: boolean;
  username: string;
  verified: boolean;
} & BaseSystemFields<T>;

// Record types for each collection

export type AwardsRecord<
  Tcorrect_first_goal = unknown,
  Tcorrect_first_goal_from = unknown,
  Tcorrect_penalty_winner = unknown,
  Tcorrect_result = unknown,
  Texact_score = unknown,
> = {
  correct_first_goal?: null | Tcorrect_first_goal;
  correct_first_goal_from?: null | Tcorrect_first_goal_from;
  correct_penalty_winner?: null | Tcorrect_penalty_winner;
  correct_result?: null | Tcorrect_result;
  exact_score?: null | Texact_score;
  id: string;
  tournament?: RecordIdString;
  user_id?: RecordIdString;
};

export type FlagsRecord = {
  created: IsoAutoDateString;
  feature: string;
  id: string;
  isActive?: boolean;
  updated: IsoAutoDateString;
};

export type LeaderboardRecord = {
  id: string;
  points?: number;
  tournament_id?: RecordIdString;
  user_id?: RecordIdString;
};

export type MatchBetsRecord<
  Taway_per = unknown,
  Thome_per = unknown,
  Ttie_per = unknown,
> = {
  away_per?: null | Taway_per;
  home_per?: null | Thome_per;
  id: string;
  match_id?: RecordIdString;
  tie_per?: null | Ttie_per;
};

export const MatchesFirstGoalOptions = {
  primer_tiempo: "primer_tiempo",
  segundo_tiempo: "segundo_tiempo",
  tiempo_extra: "tiempo_extra",
} as const;
export type MatchesFirstGoalOptions =
  (typeof MatchesFirstGoalOptions)[keyof typeof MatchesFirstGoalOptions];

export const MatchesFirstGoalFromOptions = {
  home: "home",
  away: "away",
} as const;
export type MatchesFirstGoalFromOptions =
  (typeof MatchesFirstGoalFromOptions)[keyof typeof MatchesFirstGoalFromOptions];

export const MatchesPenaltyWinnerOptions = {
  home: "home",
  away: "away",
} as const;
export type MatchesPenaltyWinnerOptions =
  (typeof MatchesPenaltyWinnerOptions)[keyof typeof MatchesPenaltyWinnerOptions];
export type MatchesRecord = {
  away?: string;
  awayScore?: number;
  created: IsoAutoDateString;
  enableBonus?: boolean;
  first_goal?: MatchesFirstGoalOptions;
  first_goal_from?: MatchesFirstGoalFromOptions;
  group?: string;
  home?: string;
  homeScore?: number;
  id: string;
  location?: string;
  matchNumber?: number;
  penalty_winner?: MatchesPenaltyWinnerOptions;
  roundNumber?: number;
  startAtUtc?: IsoDateString;
  tournament?: RecordIdString;
  updated: IsoAutoDateString;
};

export const PredictionsFirstGoalOptions = {
  primer_tiempo: "primer_tiempo",
  segundo_tiempo: "segundo_tiempo",
  tiempo_extra: "tiempo_extra",
} as const;
export type PredictionsFirstGoalOptions =
  (typeof PredictionsFirstGoalOptions)[keyof typeof PredictionsFirstGoalOptions];

export const PredictionsFirstGoalFromOptions = {
  home: "home",
  away: "away",
} as const;
export type PredictionsFirstGoalFromOptions =
  (typeof PredictionsFirstGoalFromOptions)[keyof typeof PredictionsFirstGoalFromOptions];

export const PredictionsPenaltyWinnerOptions = {
  home: "home",
  away: "away",
} as const;
export type PredictionsPenaltyWinnerOptions =
  (typeof PredictionsPenaltyWinnerOptions)[keyof typeof PredictionsPenaltyWinnerOptions];
export type PredictionsRecord = {
  awayScore?: number;
  created: IsoAutoDateString;
  first_goal?: PredictionsFirstGoalOptions;
  first_goal_from?: PredictionsFirstGoalFromOptions;
  homeScore?: number;
  id: string;
  isBonusActive?: boolean;
  match?: RecordIdString;
  penalty_winner?: PredictionsPenaltyWinnerOptions;
  updated: IsoAutoDateString;
  user?: RecordIdString;
};

export type ResultsRecord = {
  correct_first_goal?: boolean;
  correct_first_goal_from?: boolean;
  correct_penalty_winner?: boolean;
  correct_result?: boolean;
  exact_score?: boolean;
  id: string;
  match_id?: RecordIdString;
  points?: number;
  prediction_id?: RecordIdString;
  tournament_id?: RecordIdString;
  user_id?: RecordIdString;
};

export const TournamentsStatusOptions = {
  open: "open",
  started: "started",
  done: "done",
  closed: "closed",
} as const;
export type TournamentsStatusOptions =
  (typeof TournamentsStatusOptions)[keyof typeof TournamentsStatusOptions];
export type TournamentsRecord = {
  created: IsoAutoDateString;
  id: string;
  logo?: string;
  name?: string;
  status: TournamentsStatusOptions;
  updated: IsoAutoDateString;
};

export const UsersTagsOptions = {
  Gonzalez: "Gonzalez",
  Caravantes: "Caravantes",
  Primos: "Primos",
  Mendia: "Mendia",
  Rodas: "Rodas",
} as const;
export type UsersTagsOptions =
  (typeof UsersTagsOptions)[keyof typeof UsersTagsOptions];
export type UsersRecord = {
  avatar?: FileNameString;
  created: IsoAutoDateString;
  email?: string;
  emailVisibility?: boolean;
  favorite_team?: string;
  id: string;
  ignore?: boolean;
  img?: string;
  isAdmin?: boolean;
  name?: string;
  password: string;
  phone?: number;
  tags?: UsersTagsOptions[];
  tokenKey: string;
  updated: IsoAutoDateString;
  username: string;
  verified?: boolean;
};

// Response types include system fields and match responses from the PocketBase API
export type AwardsResponse<
  Tcorrect_first_goal = unknown,
  Tcorrect_first_goal_from = unknown,
  Tcorrect_penalty_winner = unknown,
  Tcorrect_result = unknown,
  Texact_score = unknown,
  Texpand = unknown,
> = Required<
  AwardsRecord<
    Tcorrect_first_goal,
    Tcorrect_first_goal_from,
    Tcorrect_penalty_winner,
    Tcorrect_result,
    Texact_score
  >
> &
  BaseSystemFields<Texpand>;
export type FlagsResponse<Texpand = unknown> = Required<FlagsRecord> &
  BaseSystemFields<Texpand>;
export type LeaderboardResponse<Texpand = unknown> =
  Required<LeaderboardRecord> & BaseSystemFields<Texpand>;
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
export type ResultsResponse<Texpand = unknown> = Required<ResultsRecord> &
  BaseSystemFields<Texpand>;
export type TournamentsResponse<Texpand = unknown> =
  Required<TournamentsRecord> & BaseSystemFields<Texpand>;
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> &
  AuthSystemFields<Texpand>;

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
  awards: AwardsRecord;
  flags: FlagsRecord;
  leaderboard: LeaderboardRecord;
  match_bets: MatchBetsRecord;
  matches: MatchesRecord;
  predictions: PredictionsRecord;
  results: ResultsRecord;
  tournaments: TournamentsRecord;
  users: UsersRecord;
};

export type CollectionResponses = {
  awards: AwardsResponse;
  flags: FlagsResponse;
  leaderboard: LeaderboardResponse;
  match_bets: MatchBetsResponse;
  matches: MatchesResponse;
  predictions: PredictionsResponse;
  results: ResultsResponse;
  tournaments: TournamentsResponse;
  users: UsersResponse;
};

// Utility types for create/update operations

type ProcessCreateAndUpdateFields<T> = Omit<
  {
    // Omit AutoDate fields
    [K in keyof T as Extract<T[K], IsoAutoDateString> extends never
      ? K
      : never]: // Convert FileNameString to File
    T[K] extends infer U
      ? U extends FileNameString | FileNameString[]
        ? U extends any[]
          ? File[]
          : File
        : U
      : never;
  },
  "id"
>;

// Create type for Auth collections
export type CreateAuth<T> = {
  id?: RecordIdString;
  email: string;
  emailVisibility?: boolean;
  password: string;
  passwordConfirm: string;
  verified?: boolean;
} & ProcessCreateAndUpdateFields<T>;

// Create type for Base collections
export type CreateBase<T> = {
  id?: RecordIdString;
} & ProcessCreateAndUpdateFields<T>;

// Update type for Auth collections
export type UpdateAuth<T> = Partial<
  Omit<ProcessCreateAndUpdateFields<T>, keyof AuthSystemFields>
> & {
  email?: string;
  emailVisibility?: boolean;
  oldPassword?: string;
  password?: string;
  passwordConfirm?: string;
  verified?: boolean;
};

// Update type for Base collections
export type UpdateBase<T> = Partial<
  Omit<ProcessCreateAndUpdateFields<T>, keyof BaseSystemFields>
>;

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
  CollectionResponses[T] extends AuthSystemFields
    ? CreateAuth<CollectionRecords[T]>
    : CreateBase<CollectionRecords[T]>;

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
  CollectionResponses[T] extends AuthSystemFields
    ? UpdateAuth<CollectionRecords[T]>
    : UpdateBase<CollectionRecords[T]>;

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
  collection<T extends keyof CollectionResponses>(
    idOrName: T
  ): RecordService<CollectionResponses[T]>;
} & PocketBase;
