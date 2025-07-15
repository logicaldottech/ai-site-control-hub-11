
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Bot, Zap, Clock, DollarSign, Settings, Play, Pause } from "lucide-react";

const aiModels = [
  {
    id: 1,
    name: "GPT-4 Turbo",
    provider: "OpenAI",
    status: "active",
    usage: 45,
    cost: "$0.03/1K tokens",
    latency: "2.1s",
    quality: 95,
    enabled: true
  },
  {
    id: 2,
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    status: "active",
    usage: 30,
    cost: "$0.015/1K tokens",
    latency: "1.8s",
    quality: 92,
    enabled: true
  },
  {
    id: 3,
    name: "Gemini Pro",
    provider: "Google",
    status: "active",
    usage: 25,
    cost: "$0.0005/1K tokens",
    latency: "1.5s",
    quality: 88,
    enabled: true
  },
  {
    id: 4,
    name: "GPT-3.5 Turbo",
    provider: "OpenAI",
    status: "maintenance",
    usage: 0,
    cost: "$0.001/1K tokens",
    latency: "1.2s",
    quality: 82,
    enabled: false
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "maintenance":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "error":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export function AIModelConfig() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Model Configuration</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Add New Model
        </Button>
      </div>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Global AI Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Default Temperature: 0.7
              </label>
              <Slider defaultValue={[0.7]} max={1} min={0} step={0.1} className="w-full" />
            </div>
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Max Tokens: 2048
              </label>
              <Slider defaultValue={[2048]} max={4096} min={256} step={256} className="w-full" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Auto Failover</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Automatically switch to backup models if primary fails</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Load Balancing</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Distribute requests across available models</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Model Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">4</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Models</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">1.8s</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">$247</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">99.9%</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Models List */}
      <Card>
        <CardHeader>
          <CardTitle>AI Models ({aiModels.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiModels.map((model) => (
              <div key={model.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{model.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{model.provider}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(model.status)}>
                      {model.status}
                    </Badge>
                    <Switch checked={model.enabled} />
                    <Button size="sm" variant="outline">
                      {model.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Usage Share</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{model.usage}%</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Cost</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{model.cost}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Avg Latency</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{model.latency}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Quality Score</div>
                    <div className="text-lg font-semibold text-green-600">{model.quality}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
