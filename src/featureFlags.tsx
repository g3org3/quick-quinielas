import { useQuery } from "@tanstack/react-query";
import { flagsKeys } from "@/api/flags";
import { pb } from "./pb";
import { usePocketBaseRealtime } from "./useRealtime";

const featureFlags = {
  show_match_score: "7ri3e2tlxs7meht",
  show_bonus: "iegvq2vrg3uyynw",
  show_update_app: "srnwbr4pkcghb7e",
  set_favorite_team: "gsugdab7mgzmg92",
} as const;
export type FeatureFlag = keyof typeof featureFlags;

export interface FeatFlagResponse {
  id: string;
  isActive: boolean;
  feature: FeatureFlag;
}

export function useFeatFlag(feature: FeatureFlag) {
  const id = featureFlags[feature];
  usePocketBaseRealtime("flags", flagsKeys.detail(id));
  const { data } = useQuery({
    queryKey: flagsKeys.detail(id),
    queryFn() {
      return pb.collection("flags").getOne<FeatFlagResponse>(id);
    },
  });
  return data?.isActive;
}
