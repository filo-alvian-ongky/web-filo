import { ListSkeleton } from "@/components/admin/Skeletons";

export default function Loading() {
  return <ListSkeleton table="experiences" fallback={3} />;
}
