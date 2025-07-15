
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, ExternalLink, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

const websites = [
  {
    id: 1,
    title: "Tech Startup Landing",
    user: "john@example.com",
    status: "live",
    created: "2024-01-15",
    template: "SaaS",
    visits: 1247
  },
  {
    id: 2,
    title: "Restaurant Website",
    user: "sarah@example.com",
    status: "draft",
    created: "2024-01-14",
    template: "Business",
    visits: 0
  },
  {
    id: 3,
    title: "Portfolio Site",
    user: "mike@example.com",
    status: "live",
    created: "2024-01-13",
    template: "Portfolio",
    visits: 892
  },
  {
    id: 4,
    title: "E-commerce Store",
    user: "emma@example.com",
    status: "live",
    created: "2024-01-12",
    template: "E-commerce",
    visits: 2156
  },
  {
    id: 5,
    title: "Blog Platform",
    user: "alex@example.com",
    status: "maintenance",
    created: "2024-01-11",
    template: "Blog",
    visits: 743
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "live":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "draft":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "maintenance":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export function WebsiteManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Website Management</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Generate New Website
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search websites..."
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Websites Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Websites ({websites.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Template</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Visits</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Created</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {websites.map((website) => (
                  <tr key={website.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900 dark:text-white">{website.title}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{website.user}</td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(website.status)}>
                        {website.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{website.template}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{website.visits.toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{website.created}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
