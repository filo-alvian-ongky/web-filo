import { DashboardSkeleton } from "@/components/admin/Skeletons";

// Tampil seketika saat berpindah ke dasbor, selagi data dimuat dari database
export default function Loading() {
  return <DashboardSkeleton />;
}
