import { useQuery } from "@tanstack/react-query";
import { pb } from "./pb";
import { usePocketBaseRealtime } from "./useRealtime";

const featureFlags = {
  show_points: "dq830ycm247w1a0",
  show_match_score: "7ri3e2tlxs7meht",
  show_bonus: "iegvq2vrg3uyynw",
  show_update_app: "srnwbr4pkcghb7e",
} as const;
export type FeatureFlag = keyof typeof featureFlags;

export interface FeatFlagResponse {
  id: string;
  isActive: boolean;
  feature: FeatureFlag;
}

interface Props {
  feature: FeatureFlag;
  children: React.ReactNode;
}

export function useFeatFlag(feature: FeatureFlag) {
  usePocketBaseRealtime("flags", ["flags", feature]);
  const { data } = useQuery({
    queryKey: ["flags", feature],
    queryFn() {
      return pb
        .collection("flags")
        .getOne<FeatFlagResponse>(featureFlags[feature]);
    },
  });
  return data?.isActive;
}

export function FeatFlagComponent(props: Props) {
  const isActive = useFeatFlag(props.feature);
  if (!isActive) {
    return null;
  }
  return <>{props.children}</>;
}
