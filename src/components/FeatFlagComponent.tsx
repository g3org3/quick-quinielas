import type { ReactNode } from "react";
import type { UsersResponse } from "@/pocketbase-types";
import { pb } from "@/pb";
import { FeatureFlag, useFeatFlag } from "@/featureFlags";

interface Props {
  feature: FeatureFlag;
  children: ReactNode;
  showIf?: boolean;
  showIfAdmin?: boolean;
  fallback?: ReactNode;
}

export default function FeatFlagComponent(props: Props) {
  const { showIf = true, showIfAdmin, fallback = null } = props;
  const { isAdmin } = pb.authStore.model as UsersResponse;
  const isActive = useFeatFlag(props.feature);

  if (!isActive) {
    return <>{fallback}</>;
  }
  if (!showIf) {
    return <>{fallback}</>;
  }

  if (!isAdmin && showIfAdmin) {
    return <>{fallback}</>;
  }
  return <>{props.children}</>;
}
