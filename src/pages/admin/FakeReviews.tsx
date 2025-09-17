import { AdminLayout } from "@/components/admin/AdminLayout";
import { FakeReviewsManagement } from "@/components/admin/FakeReviewsManagement";

export default function FakeReviews() {
  return (
    <AdminLayout>
      <FakeReviewsManagement />
    </AdminLayout>
  );
}