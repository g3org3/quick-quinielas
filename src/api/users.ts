import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";

import { pb } from "@/pb";
import { Collections, UsersResponse } from "@/pocketbase-types";
import { queryClient } from "@/queryClient";

export const usersKeys = {
  all: [Collections.Users] as const,
  lists: () => [...usersKeys.all, "list"] as const,
  details: () => [...usersKeys.all, "detail"] as const,
  detail: (userId: string) => [...usersKeys.details(), userId] as const,
};

export const getUserQuery = (userId: string) =>
  queryOptions({
    queryKey: usersKeys.detail(userId),
    queryFn: () =>
      pb.collection(Collections.Users).getOne<UsersResponse>(userId),
  });

export const useUserQuery = (userId?: string) =>
  useQuery({
    ...getUserQuery(userId ?? ""),
    enabled: !!userId,
  });

export const usersQuery = queryOptions({
  queryKey: usersKeys.lists(),
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
        queryKey: usersKeys.detail(userId),
      });
    },
  });
};
