import { useQuery } from "@tanstack/react-query";
import { flagsKeys } from "@/api/flags";
import { pb } from "./pb";
import { usePocketBaseRealtime } from "./useRealtime";

const featureFlags = {
  show_new_matchcard: "1lxt8jrs51k9onb",
  show_points: "dq830ycm247w1a0",
  show_match_score: "7ri3e2tlxs7meht",
  show_bonus: "iegvq2vrg3uyynw",
  show_update_app: "srnwbr4pkcghb7e",
  show_limit_avatars: "osr72q7crt1sdpy",
  show_admin_bonus_enable_button: "eismui3kc6ykpoy",
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
