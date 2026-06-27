import type { ReactNode } from "react";
import { pb } from "@/pb";
import { FeatureFlag, useFeatFlag } from "@/featureFlags";
import { useUserQuery } from "@/api";

interface Props {
  feature: FeatureFlag;
  children: ReactNode;
  showIf?: boolean;
  showIfAdmin?: boolean;
  fallback?: ReactNode;
}

export default function FeatFlagComponent(props: Props) {
  const { showIf = true, showIfAdmin, fallback = null } = props;
  const { data: user } = useUserQuery(pb.authStore.model?.id);
  const isAdmin = user?.isAdmin;
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
