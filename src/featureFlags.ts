import { useQuery } from "@tanstack/react-query";
import { pb } from "./pb";
import { usePocketBaseRealtime } from "./useRealtime";

type FeatFlag = { id: string; isActive: boolean; feature: string };
export function useFeatFlags() {
  usePocketBaseRealtime("flags", ["flags"]);
  const { data = {} } = useQuery({
    queryKey: ["flags"],
    async queryFn() {
      const flags = await pb.collection("flags").getFullList<FeatFlag>();
      const byName: Record<string, boolean> = {};
      for (const fflag of flags) {
        byName[fflag.feature] = fflag.isActive;
      }
      return byName;
    },
  });

  return { fflags: data };
}
