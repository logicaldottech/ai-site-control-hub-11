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
import { Check, X, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { http } from "../../config.js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Review = {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
    image?: string | null;
    type: number;
  };
  blog: {
    _id: string;
    title: string;
    type: string;
  };
  rating: number;
  reviewText: string;
  status: number; // 0=pending, 1=approved, 2=rejected
  createdAt: string;
};

export function ReviewsManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"0" | "1" | "2">("0");

  // Dialog states
  const [blogDialogOpen, setBlogDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<{ title: string; type: string } | null>(null);
  const [selectedReview, setSelectedReview] = useState<{ text: string; user: string } | null>(null);

  const fetchReviews = async (status: string = "0") => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("page", page.toString());
      formData.append("limit", limit.toString());
      formData.append("status", status);

      const response = await http.post("/fetch_my_reviews", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        const { reviews, pagination } = response.data.data;
        setReviews(reviews || []);
        setTotalPages(pagination?.pages || 0);
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

      if (response.status === 200) {
        setReviews((prev) => prev.filter((r) => r._id !== reviewId)); // Optimistic UI
        toast({
          title: "Success",
          description: `Review ${status === "1" ? "approved" : "rejected"} successfully`,
        });
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

  const filteredReviews = reviews.filter(
    (review) =>
      review.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.reviewText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.blog.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value as "0" | "1" | "2");
    setPage(1);
  };

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

  const truncateWords = (text: string, count: number) => {
    const words = text.split(" ");
    if (words.length > count) {
      return words.slice(0, count).join(" ") + "...";
    }
    return text;
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
          <TabsTrigger value="0">Pending</TabsTrigger>
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
                    <TableHead>Blog</TableHead>
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
                      <TableCell colSpan={status === "0" ? 8 : 7} className="text-center py-8">
                        Loading reviews...
                      </TableCell>
                    </TableRow>
                  ) : filteredReviews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={status === "0" ? 8 : 7} className="text-center py-8">
                        No reviews found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReviews.map((review) => (
                      <TableRow key={review._id}>
                        <TableCell className="font-medium">{review.user.fullName}</TableCell>
                        <TableCell>{review.user.email}</TableCell>
                        <TableCell>
                          <button
                            className="text-blue-600 hover:underline"
                            onClick={() => {
                              setSelectedBlog({ title: review.blog.title, type: review.blog.type });
                              setBlogDialogOpen(true);
                            }}
                          >
                            {truncateWords(review.blog.title, 5)}
                          </button>
                        </TableCell>
                        <TableCell>
                          <span className="text-yellow-500">
                            {renderStars(review.rating)} ({review.rating}/5)
                          </span>
                        </TableCell>
                        <TableCell>
                          <button
                            className="text-blue-600 hover:underline max-w-xs truncate"
                            onClick={() => {
                              setSelectedReview({ text: review.reviewText, user: review.user.fullName });
                              setReviewDialogOpen(true);
                            }}
                          >
                            {truncateWords(review.reviewText, 10)}
                          </button>
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

            {totalPages > 1 && (
              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button variant="outline" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                  Next
                </Button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Blog info popup */}
      <Dialog open={blogDialogOpen} onOpenChange={setBlogDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Blog Info</DialogTitle>
            <DialogDescription>
              {selectedBlog && (
                <>
                  <p><strong>Title:</strong> {selectedBlog.title}</p>
                  <p><strong>Type:</strong> {selectedBlog.type}</p>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Full review popup */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Full Review</DialogTitle>
            <DialogDescription>
              {selectedReview && (
                <>
                  <p><strong>Reviewer:</strong> {selectedReview.user}</p>
                  <p><strong>Message:</strong> {selectedReview.text}</p>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
