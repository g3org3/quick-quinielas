import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";

import { pb } from "@/pb";
import { Collections, UsersResponse } from "@/pocketbase-types";
import { queryClient } from "@/queryClient";

export const getUserQuery = (userId: string) =>
  queryOptions({
    queryKey: [Collections.Users, userId],
    queryFn: () =>
      pb.collection(Collections.Users).getOne<UsersResponse>(userId),
  });

export const useUserQuery = (userId?: string) =>
  useQuery({
    ...getUserQuery(userId ?? ""),
    enabled: !!userId,
  });

export const usersQuery = queryOptions({
  queryKey: [Collections.Users],
  queryFn: () =>
    pb.collection(Collections.Users).getFullList<UsersResponse>({
      filter: "ignore!=true",
    }),
});

export const useSetFavoriteTeam = (userId: string) => {
  return useMutation({
    mutationFn(favorite_team: string) {
      return pb
        .collection(Collections.Users)
        .update<UsersResponse>(userId, { favorite_team });
    },
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: [Collections.Users, userId],
      });
    },
  });
};
