import { useQuery } from "@tanstack/react-query";
import { pb } from "./pb";

type FeatFlag = { id: string; isActive: boolean; feature: string };
export function useFeatFlags() {
  const { data = {} } = useQuery({
    queryKey: ["flags", '2'],
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
