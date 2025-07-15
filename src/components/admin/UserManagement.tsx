
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Trash2, Search, UserPlus, Shield, ShieldOff } from "lucide-react";
import { Input } from "@/components/ui/input";

const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    plan: "Pro",
    status: "active",
    websites: 5,
    joined: "2024-01-10",
    lastActive: "2 hours ago"
  },
  {
    id: 2,
    name: "Sarah Wilson",
    email: "sarah@example.com",
    plan: "Free",
    status: "active",
    websites: 2,
    joined: "2024-01-08",
    lastActive: "1 day ago"
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@example.com",
    plan: "Business",
    status: "inactive",
    websites: 12,
    joined: "2023-12-15",
    lastActive: "1 week ago"
  },
  {
    id: 4,
    name: "Emma Davis",
    email: "emma@example.com",
    plan: "Pro",
    status: "active",
    websites: 8,
    joined: "2024-01-05",
    lastActive: "30 min ago"
  },
  {
    id: 5,
    name: "Alex Brown",
    email: "alex@example.com",
    plan: "Free",
    status: "suspended",
    websites: 1,
    joined: "2024-01-12",
    lastActive: "3 days ago"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "inactive":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    case "suspended":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

const getPlanColor = (plan: string) => {
  switch (plan) {
    case "Free":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    case "Pro":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "Business":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export function UserManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <Button className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2">
          <UserPlus className="h-4 w-4" />
          <span>Add User</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">8,429</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">7,234</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">2,156</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pro Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">39</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Suspended</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users by name or email..."
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Plan</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Websites</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Joined</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Last Active</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getPlanColor(user.plan)}>
                        {user.plan}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{user.websites}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{user.joined}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{user.lastActive}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user.status === "active" ? (
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600">
                            <ShieldOff className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-green-600">
                            <Shield className="h-4 w-4" />
                          </Button>
                        )}
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
