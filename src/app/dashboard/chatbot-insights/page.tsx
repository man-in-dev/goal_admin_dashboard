"use client";

import { ExternalLink, MessageSquare, BarChart3, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DIGITALOCEAN_INSIGHTS_URL = "https://console.agent-insights.tor1.do-ai.run/docs-prod/project/3e393c8e-253d-41e9-964a-dfebf9b3911e/log-streams/1a3aaf0d-5d82-4ec8-9560-5685fc93a0d7?workspaceName=Goal-Institute-Workspace&agentName=Goal+Bot&timeRange=%7B%22type%22%3A%22lastMonth%22%7D&isInsightsDrawerOpen=true";

export default function ChatbotInsightsPage() {
  const handleOpenInsights = () => {
    window.open(DIGITALOCEAN_INSIGHTS_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Chatbot Insights</h1>
        <p className="text-gray-600 mt-2">
          View and analyze all conversations from your Goal AI Assistant chatbot
        </p>
      </div>

      {/* Main Card */}
      <Card className="border-2">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-lg">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">View Chat Logs & Analytics</CardTitle>
              <CardDescription className="text-base mt-1">
                Access detailed conversation logs, user interactions, and performance metrics
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Full Conversations</h3>
                <p className="text-sm text-gray-600 mt-1">
                  View complete chat sessions with user queries and AI responses
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Analytics & Metrics</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Track usage statistics, response times, and user engagement
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Session Timeline</h3>
                <p className="text-sm text-gray-600 mt-1">
                  See when conversations happened and how long they lasted
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-orange-100 rounded">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">User Insights</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Understand user needs and identify common questions
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col items-center gap-4 pt-4">
            <Button
              onClick={handleOpenInsights}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              Open Chatbot Insights Dashboard
            </Button>
            <p className="text-sm text-gray-500 text-center">
              Opens in a new tab • Powered by DigitalOcean Gradient AI Platform
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

