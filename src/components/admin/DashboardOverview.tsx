import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Globe, Users, ShoppingCart, DollarSign, Clock } from "lucide-react";
import { httpFile } from "../../config.js";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const websiteData = [
  { month: "Jan", websites: 45, users: 120 },
  { month: "Feb", websites: 52, users: 145 },
  { month: "Mar", websites: 48, users: 138 },
  { month: "Apr", websites: 67, users: 189 },
  { month: "May", websites: 85, users: 234 },
  { month: "Jun", websites: 92, users: 267 },
];

const aiModelUsage = [
  { name: "GPT-4", value: 45, color: "#3b82f6" },
  { name: "Claude", value: 30, color: "#10b981" },
  { name: "Gemini", value: 25, color: "#f59e0b" },
];

const recentActivity = [
  { id: 1, user: "john@example.com", action: "Generated website", time: "5 min ago" },
  { id: 2, user: "sarah@example.com", action: "Updated profile", time: "12 min ago" },
  { id: 3, user: "mike@example.com", action: "Generated website", time: "18 min ago" },
  { id: 4, user: "emma@example.com", action: "Deleted website", time: "25 min ago" },
];

export function DashboardOverview() {
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await httpFile.get("dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.status === 401) {
          toast.error("Invalid token");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (response.status === 403) {
          console.log("Unauthorized:", response.statusText);
        } else {
          const { TotalUsersCount, TotalOrdersCount } = response.data;
          setTotalUsersCount(TotalUsersCount);
          setTotalOrdersCount(TotalOrdersCount);
        }
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Error fetching dashboard data",
          { toastId: "dashboardError" }
        );
        navigate("/login");
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleString()}</div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Websites (static) */}
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Websites</CardTitle>
            <Globe className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs opacity-90">+12% from last month</p>
          </CardContent>
        </Card>

        {/* Total Users (from API) */}
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsersCount}</div>
          </CardContent>
        </Card>

        {/* Total Orders (from API) */}
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrdersCount}</div>
          </CardContent>
        </Card>

        {/* Revenue (static) */}
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs opacity-90">+15% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ... existing chart code ... */}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{activity.user}</p>
                    <p className="text-sm text-gray-500">{activity.action}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
