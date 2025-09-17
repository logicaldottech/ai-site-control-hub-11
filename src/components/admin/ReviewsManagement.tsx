import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Check, X, Search, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { http } from "../../config.js";

type Review = {
  _id: string;
  name: string;
  email: string;
  message: string;
  rating: number;
  status: number; // 0=pending, 1=approved, 2=rejected
  createdAt: string;
  blogId: string;
};

export function ReviewsManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"0" | "1" | "2">("0"); // 0=pending, 1=approved, 2=rejected

  // Fetch reviews from API
  const fetchReviews = async (status: string = "0") => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("blogId", "6877c8de807b014b1507afb1"); // You might want to make this dynamic
      formData.append("page", page.toString());
      formData.append("limit", limit.toString());
      formData.append("status", status);

      const response = await http.post("/fetch_my_reviews", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setReviews(response.data.data.reviews || []);
        setTotalPages(response.data.data.totalPages || 0);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.data.message || "Failed to fetch reviews",
        });
      }
    } catch (error: any) {
      console.error("Error fetching reviews:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch reviews",
      });
    } finally {
      setLoading(false);
    }
  };

  // Approve or disapprove review
  const handleReviewAction = async (reviewId: string, status: "1" | "2") => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("reviewId", reviewId);
      formData.append("status", status);

      const response = await http.post("/approve_review", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: `Review ${status === "1" ? "approved" : "rejected"} successfully`,
        });
        // Refresh the current tab
        fetchReviews(activeTab);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.data.message || "Failed to update review",
        });
      }
    } catch (error: any) {
      console.error("Error updating review:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update review",
      });
    }
  };

  // Filter reviews based on search term
  const filteredReviews = reviews.filter(
    (review) =>
      review.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as "0" | "1" | "2");
    setPage(1); // Reset to first page when switching tabs
  };

  // Fetch reviews when tab or page changes
  useEffect(() => {
    fetchReviews(activeTab);
  }, [activeTab, page, limit]);

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
      case 1:
        return <Badge variant="outline" className="text-green-600 border-green-600">Approved</Badge>;
      case 2:
        return <Badge variant="outline" className="text-red-600 border-red-600">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="0">Pending ({reviews.length})</TabsTrigger>
          <TabsTrigger value="1">Approved</TabsTrigger>
          <TabsTrigger value="2">Rejected</TabsTrigger>
        </TabsList>

        {["0", "1", "2"].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    {status === "0" && <TableHead className="text-center">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={status === "0" ? 7 : 6} className="text-center py-8">
                        Loading reviews...
                      </TableCell>
                    </TableRow>
                  ) : filteredReviews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={status === "0" ? 7 : 6} className="text-center py-8">
                        No reviews found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReviews.map((review) => (
                      <TableRow key={review._id}>
                        <TableCell className="font-medium">{review.name}</TableCell>
                        <TableCell>{review.email}</TableCell>
                        <TableCell>
                          <span className="text-yellow-500">
                            {renderStars(review.rating)} ({review.rating}/5)
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {review.message}
                        </TableCell>
                        <TableCell>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(review.status)}</TableCell>
                        {status === "0" && (
                          <TableCell className="text-center">
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReviewAction(review._id, "1")}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReviewAction(review._id, "2")}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}