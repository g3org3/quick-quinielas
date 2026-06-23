import type { ReactNode } from "react";
import type { UsersResponse } from "@/pocketbase-types";
import { pb } from "@/pb";
import { FeatureFlag, useFeatFlag } from "@/featureFlags";

interface Props {
  feature: FeatureFlag;
  children: ReactNode;
  showIf?: boolean;
  showIfAdmin?: boolean;
}

export default function FeatFlagComponent(props: Props) {
  const { showIf = true, showIfAdmin } = props;
  const { isAdmin } = pb.authStore.model as UsersResponse;
  const isActive = useFeatFlag(props.feature);

  if (!isActive) {
    return null;
  }
  if (!showIf) {
    return null;
  }

  if (!isAdmin && showIfAdmin) {
    return null;
  }
  return <>{props.children}</>;
}
