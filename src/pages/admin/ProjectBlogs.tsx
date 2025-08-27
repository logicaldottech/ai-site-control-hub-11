// src/pages/ProjectsForBlogs.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Search } from "lucide-react";
import { httpFile } from "../../config.js";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

type Project = {
    _id: string;
    projectName: string;
    serviceType?: string;
    status?: number; // 2 active, 0 inactive (per your UI)
    createdAt?: string;
    images?: Array<any>;
    defaultFasFaIcon?: string;
    hostingId?: string;
    deploymentStatus?: string;
};

export default function ProjectsForBlogs() {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProjects, setTotalProjects] = useState(0);
    const [projects, setProjects] = useState<Project[]>([]);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast({
                        title: "Authentication Error",
                        description: "No authentication token found",
                        variant: "destructive",
                    });
                    navigate("/login");
                    return;
                }

                const params: any = {
                    page: currentPage,
                    limit,
                };
                if (searchTerm) params.search = searchTerm;

                // SAME API PATTERN as your ProjectList
                const res = await httpFile.post(
                    "getUserProjects",
                    {},
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        params,
                    }
                );

                if (res.status === 401) {
                    localStorage.clear();
                    toast({
                        title: "Session Expired",
                        description: "Your session has expired. Please log in again.",
                        variant: "destructive",
                    });
                    navigate("/login");
                    return;
                }

                if (res.status === 400 || res.status === 404) {
                    toast({
                        title: "Error",
                        description: res.data?.message || "Request failed",
                        variant: "destructive",
                    });
                    if (res.status === 404) navigate("/login");
                    return;
                }

                const list: Project[] = res.data?.data || [];
                setProjects(list);
                setTotalPages(res.data?.totalPages || 1);
                setTotalProjects(res.data?.total || 0);
            } catch (err: any) {
                localStorage.clear();
                toast({
                    title: "Error",
                    description: err?.response?.data?.message || "Failed to fetch projects",
                    variant: "destructive",
                });
                navigate("/login");
            }
        };

        fetchProjects();

        // optional refresh every 25 minutes (same pattern as your other page)
        const intervalId = setInterval(fetchProjects, 1500000);
        return () => clearInterval(intervalId);
    }, [navigate, currentPage, limit, searchTerm, toast]);

    const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const statusBadge = (status?: number) => {
        if (status === 2) return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>;
    };

    const viewBlogs = (projectId: string) => {
        // Navigate to blog list page and pass projectId in state
        navigate("/admin/blog-posts", { state: { projectId } });
        // Or you can also support query param: navigate(`/admin/blog-posts?projectId=${projectId}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold">Select a Project</h1>
                    <p className="text-sm text-muted-foreground">Choose a project to view its blogs</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Search projects..."
                        className="pl-10 pr-4 w-full sm:w-[260px] h-10"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Projects</CardTitle>
                    <CardDescription>Total: {totalProjects}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead style={{ width: 280 }}>Project Name</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {projects.length ? (
                                projects.map((p) => (
                                    <TableRow key={p._id}>
                                        <TableCell className="max-w-[320px] truncate">{p.projectName}</TableCell>
                                        <TableCell>{p.serviceType || "—"}</TableCell>
                                        <TableCell>{statusBadge(p.status)}</TableCell>
                                        <TableCell>
                                            {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" variant="outline" onClick={() => viewBlogs(p._id)}>
                                                View Blogs
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                                        No projects found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {totalProjects > 0 && (
                        <div className="mt-4 flex items-center justify-center">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>

                                    {currentPage > 1 && (
                                        <PaginationItem>
                                            <PaginationLink
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                className="cursor-pointer"
                                            >
                                                {currentPage - 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    )}

                                    <PaginationItem>
                                        <PaginationLink isActive className="cursor-pointer">
                                            {currentPage}
                                        </PaginationLink>
                                    </PaginationItem>

                                    {currentPage < totalPages && (
                                        <PaginationItem>
                                            <PaginationLink
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                className="cursor-pointer"
                                            >
                                                {currentPage + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    )}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
