import React from "react";
import { ReviewsManagement } from "@/components/admin/ReviewsManagement";

const Reviews = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reviews Approval</h1>
        <p className="text-muted-foreground">
          Manage and approve reviews submitted to your blog.
        </p>
      </div>
      <ReviewsManagement />
    </div>
  );
};

export default Reviews;