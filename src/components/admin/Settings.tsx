
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Bell, Shield, Palette, Database, Mail } from "lucide-react";

export function Settings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <SettingsIcon className="h-5 w-5" />
                <span>General Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Platform Name
                  </label>
                  <Input defaultValue="AI WebGen" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Admin Email
                  </label>
                  <Input defaultValue="admin@aiwebgen.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  Platform Description
                </label>
                <Textarea 
                  defaultValue="AI-powered website generator that creates beautiful, functional websites in minutes."
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Maintenance Mode</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Temporarily disable the platform for maintenance</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Auto Updates</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Automatically update AI models and features</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive email alerts for important events</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">System Alerts</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Get notified about system status changes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">User Activity</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Notifications for user registrations and activities</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">AI Model Alerts</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Alerts when AI models need attention</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Session Timeout (minutes)
                  </label>
                  <Input defaultValue="60" type="number" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Max Login Attempts
                  </label>
                  <Input defaultValue="5" type="number" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Require 2FA for admin accounts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">IP Whitelist</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Restrict admin access to specific IP addresses</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Activity Logging</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Log all administrative actions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Appearance Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">Theme</label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer">
                      <div className="w-full h-8 bg-white border rounded mb-2"></div>
                      <p className="text-sm text-center">Light</p>
                    </div>
                    <div className="border border-blue-500 rounded-lg p-4 cursor-pointer">
                      <div className="w-full h-8 bg-gray-900 rounded mb-2"></div>
                      <p className="text-sm text-center">Dark</p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer">
                      <div className="w-full h-8 bg-gradient-to-r from-white to-gray-900 rounded mb-2"></div>
                      <p className="text-sm text-center">Auto</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Primary Color
                  </label>
                  <div className="flex space-x-2">
                    {["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"].map((color) => (
                      <div
                        key={color}
                        className="w-8 h-8 rounded cursor-pointer border-2 border-gray-300"
                        style={{ backgroundColor: color }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Database Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Database Host
                  </label>
                  <Input defaultValue="localhost" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Database Port
                  </label>
                  <Input defaultValue="5432" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Auto Backup</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Automatically backup database daily</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Query Optimization</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Enable automatic query optimization</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <div className="flex space-x-4">
                <Button variant="outline">Test Connection</Button>
                <Button variant="outline">Create Backup</Button>
                <Button variant="outline" className="text-red-600">Reset Database</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Integrations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  { name: "OpenAI", status: "connected", description: "AI model provider for website generation" },
                  { name: "Stripe", status: "connected", description: "Payment processing for subscriptions" },
                  { name: "SendGrid", status: "disconnected", description: "Email service for notifications" },
                  { name: "Anthropic", status: "connected", description: "Alternative AI model provider" },
                  { name: "Google Analytics", status: "disconnected", description: "Website analytics and tracking" },
                ].map((integration) => (
                  <div key={integration.name} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{integration.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{integration.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={integration.status === "connected" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {integration.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        {integration.status === "connected" ? "Configure" : "Connect"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
