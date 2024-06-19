/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService, RecordFullListOptions, RecordListOptions } from 'pocketbase'
import { z } from 'zod'

export enum Collections {
  Links = "links",
  Matches = "matches",
  Predictions = "predictions",
  Snapshots = "snapshots",
  Sprints = "sprints",
  Tickets = "tickets",
  Tournaments = "tournaments",
  Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
  id: RecordIdString
  created: IsoDateString
  updated: IsoDateString
  collectionId: string
  collectionName: Collections
  expand?: T
}

export type AuthSystemFields<T = never> = {
  email: string
  emailVisibility: boolean
  username: string
  verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type LinksRecord<Ttags = unknown> = {
  author?: RecordIdString
  desc?: string
  field?: string
  tags?: null | Ttags
  title?: string
  url?: string
}

export type MatchesRecord = {
  away?: string
  awayScore?: number
  home?: string
  homeScore?: number
  location?: string
  matchNumber?: number
  roundNumber?: number
  startAtUtc?: IsoDateString
  tournament?: RecordIdString
}

export type PredictionsRecord = {
  awayScore?: number
  homeScore?: number
  match?: RecordIdString
  user?: RecordIdString
}

export type SnapshotsRecord = {
  fetchedat?: IsoDateString
  sprint?: RecordIdString
}

export type SprintsRecord = {
  name?: string
}

export type TicketsRecord<Tlabels = unknown, Tparents = unknown> = {
  description?: string
  epic?: string
  fetchedat?: IsoDateString
  key?: string
  labels?: null | Tlabels
  owner?: string
  parents?: null | Tparents
  points?: number
  summary?: string
}

export type TournamentsRecord = {
  name?: string
}

export type UsersRecord = {
  avatar?: string
  name?: string
}

// Response types include system fields and match responses from the PocketBase API
export type LinksResponse<Ttags = unknown, Texpand = unknown> = Required<LinksRecord<Ttags>> & BaseSystemFields<Texpand>
export type MatchesResponse<Texpand = unknown> = Required<MatchesRecord> & BaseSystemFields<Texpand>
export type PredictionsResponse<Texpand = unknown> = Required<PredictionsRecord> & BaseSystemFields<Texpand>
export type SnapshotsResponse<Texpand = unknown> = Required<SnapshotsRecord> & BaseSystemFields<Texpand>
export type SprintsResponse<Texpand = unknown> = Required<SprintsRecord> & BaseSystemFields<Texpand>
export type TicketsResponse<Tlabels = unknown, Tparents = unknown, Texpand = unknown> = Required<TicketsRecord<Tlabels, Tparents>> & BaseSystemFields<Texpand>
export type TournamentsResponse<Texpand = unknown> = Required<TournamentsRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
  links: LinksRecord
  matches: MatchesRecord
  predictions: PredictionsRecord
  snapshots: SnapshotsRecord
  sprints: SprintsRecord
  tickets: TicketsRecord
  tournaments: TournamentsRecord
  users: UsersRecord
}

export type CollectionResponses = {
  links: LinksResponse
  matches: MatchesResponse
  predictions: PredictionsResponse
  snapshots: SnapshotsResponse
  sprints: SprintsResponse
  tickets: TicketsResponse
  tournaments: TournamentsResponse
  users: UsersResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
  collection(idOrName: 'links'): RecordService<LinksResponse>
  collection(idOrName: 'matches'): RecordService<MatchesResponse>
  collection(idOrName: 'predictions'): RecordService<PredictionsResponse>
  collection(idOrName: 'snapshots'): RecordService<SnapshotsResponse>
  collection(idOrName: 'sprints'): RecordService<SprintsResponse>
  collection(idOrName: 'tickets'): RecordService<TicketsResponse>
  collection(idOrName: 'tournaments'): RecordService<TournamentsResponse>
  collection(idOrName: 'users'): RecordService<UsersResponse>
}


// Generated Schemas
export const matchesSchema = z.object({
  home: z.string().nullish(),
  away: z.string().nullish(),
  homeScore: z.number().nullish(),
  awayScore: z.number().nullish(),
  tournament: z.string().nullish(),
  startAtUtc: z.string().nullish(),
  matchNumber: z.number().nullish(),
  roundNumber: z.number().nullish(),
  location: z.string().nullish(),
})

export const predictionsSchema = z.object({
  user: z.string().nullish(),
  homeScore: z.number().nullish(),
  awayScore: z.number().nullish(),
  match: z.string().nullish(),
})

export const tournamentsSchema = z.object({
  name: z.string().nullish(),
})

export const usersSchema = z.object({
  name: z.string().nullish(),
  avatar: z.string().nullish(),
})



// Generated Hooks

export async function useGetAllLinks(pb: PocketBase, options: RecordFullListOptions) {
  return await pb.collection(Collections.Links).getFullList<LinksResponse>(options)
}

export async function useGetLinks(pb: PocketBase, page: number, perPage: number, options: RecordListOptions) {
  return await pb.collection(Collections.Links).getList<LinksResponse>(page, perPage, options)
}

export async function useGetAllMatches(pb: PocketBase, options: RecordFullListOptions) {
  return await pb.collection(Collections.Matches).getFullList<MatchesResponse>(options)
}

export async function useGetMatches(pb: PocketBase, page: number, perPage: number, options: RecordListOptions) {
  return await pb.collection(Collections.Matches).getList<MatchesResponse>(page, perPage, options)
}

export async function useGetAllPredictions(pb: PocketBase, options: RecordFullListOptions) {
  return await pb.collection(Collections.Predictions).getFullList<PredictionsResponse>(options)
}

export async function useGetPredictions(pb: PocketBase, page: number, perPage: number, options: RecordListOptions) {
  return await pb.collection(Collections.Predictions).getList<PredictionsResponse>(page, perPage, options)
}

export async function useGetAllSnapshots(pb: PocketBase, options: RecordFullListOptions) {
  return await pb.collection(Collections.Snapshots).getFullList<SnapshotsResponse>(options)
}

export async function useGetSnapshots(pb: PocketBase, page: number, perPage: number, options: RecordListOptions) {
  return await pb.collection(Collections.Snapshots).getList<SnapshotsResponse>(page, perPage, options)
}

export async function useGetAllSprints(pb: PocketBase, options: RecordFullListOptions) {
  return await pb.collection(Collections.Sprints).getFullList<SprintsResponse>(options)
}

export async function useGetSprints(pb: PocketBase, page: number, perPage: number, options: RecordListOptions) {
  return await pb.collection(Collections.Sprints).getList<SprintsResponse>(page, perPage, options)
}

export async function useGetAllTickets(pb: PocketBase, options: RecordFullListOptions) {
  return await pb.collection(Collections.Tickets).getFullList<TicketsResponse>(options)
}

export async function useGetTickets(pb: PocketBase, page: number, perPage: number, options: RecordListOptions) {
  return await pb.collection(Collections.Tickets).getList<TicketsResponse>(page, perPage, options)
}

export async function useGetAllTournaments(pb: PocketBase, options: RecordFullListOptions) {
  return await pb.collection(Collections.Tournaments).getFullList<TournamentsResponse>(options)
}

export async function useGetTournaments(pb: PocketBase, page: number, perPage: number, options: RecordListOptions) {
  return await pb.collection(Collections.Tournaments).getList<TournamentsResponse>(page, perPage, options)
}

export async function useGetAllUsers(pb: PocketBase, options: RecordFullListOptions) {
  return await pb.collection(Collections.Users).getFullList<UsersResponse>(options)
}

export async function useGetUsers(pb: PocketBase, page: number, perPage: number, options: RecordListOptions) {
  return await pb.collection(Collections.Users).getList<UsersResponse>(page, perPage, options)
}

