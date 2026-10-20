import { ListSkeleton } from "@/components/admin/Skeletons";

export default function Loading() {
  return <ListSkeleton table="technologies" fallback={10} canPublish={false} />;
}
