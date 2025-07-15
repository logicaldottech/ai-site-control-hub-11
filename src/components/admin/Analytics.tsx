
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, Users, Globe, DollarSign, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const revenueData = [
  { month: "Jan", revenue: 12400, users: 890 },
  { month: "Feb", revenue: 15600, users: 1200 },
  { month: "Mar", revenue: 14200, users: 1100 },
  { month: "Apr", revenue: 18900, users: 1450 },
  { month: "May", revenue: 22100, users: 1680 },
  { month: "Jun", revenue: 25400, users: 1920 },
];

const websiteGenerationData = [
  { date: "2024-01-01", websites: 45, templates: 12 },
  { date: "2024-01-02", websites: 52, templates: 15 },
  { date: "2024-01-03", websites: 48, templates: 11 },
  { date: "2024-01-04", websites: 67, templates: 18 },
  { date: "2024-01-05", websites: 85, templates: 22 },
  { date: "2024-01-06", websites: 92, templates: 25 },
  { date: "2024-01-07", websites: 78, templates: 19 },
];

const userEngagementData = [
  { time: "00:00", active: 120 },
  { time: "04:00", active: 80 },
  { time: "08:00", active: 450 },
  { time: "12:00", active: 680 },
  { time: "16:00", active: 520 },
  { time: "20:00", active: 380 },
];

export function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
        <Button variant="outline" className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export Report</span>
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$25,400</div>
            <p className="text-xs opacity-90">+15% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,920</div>
            <p className="text-xs opacity-90">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Websites Created</CardTitle>
            <Globe className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs opacity-90">+8% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs opacity-90">+0.5% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue and User Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue & User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Website Generation Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={websiteGenerationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Area type="monotone" dataKey="websites" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="templates" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Engagement */}
      <Card>
        <CardHeader>
          <CardTitle>Daily User Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userEngagementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Bar dataKey="active" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Performing Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["SaaS Landing", "E-commerce", "Portfolio", "Blog", "Business"].map((template, index) => (
                <div key={template} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{template}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(5 - index) * 20}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{(5 - index) * 20}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Geographic Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { country: "United States", percentage: 45 },
                { country: "United Kingdom", percentage: 18 },
                { country: "Canada", percentage: 12 },
                { country: "Australia", percentage: 8 },
                { country: "Germany", percentage: 17 }
              ].map((item) => (
                <div key={item.country} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.country}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { device: "Desktop", percentage: 62 },
                { device: "Mobile", percentage: 31 },
                { device: "Tablet", percentage: 7 }
              ].map((item) => (
                <div key={item.device} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.device}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
