"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, Users, FileText, Calendar, Download } from 'lucide-react'

// Mock data - will be replaced with real API calls
const analyticsData = {
  totalForms: 690,
  admissionEnquiries: 456,
  contactForms: 234,
  pendingForms: 89,
  todayForms: 23,
  thisWeekForms: 156,
  thisMonthForms: 567,
  lastMonthForms: 498,
  conversionRate: 23.5,
  avgResponseTime: '2.3 hours'
}

const monthlyData = [
  { month: 'Jan', forms: 120, enquiries: 45, contacts: 30 },
  { month: 'Feb', forms: 135, enquiries: 50, contacts: 35 },
  { month: 'Mar', forms: 150, enquiries: 55, contacts: 40 },
  { month: 'Apr', forms: 165, enquiries: 60, contacts: 45 },
  { month: 'May', forms: 180, enquiries: 65, contacts: 50 },
  { month: 'Jun', forms: 195, enquiries: 70, contacts: 55 },
]

const statusDistribution = [
  { status: 'Pending', count: 89, percentage: 7.1, color: 'bg-yellow-500' },
  { status: 'Contacted', count: 234, percentage: 18.8, color: 'bg-blue-500' },
  { status: 'Enrolled/Approved', count: 567, percentage: 45.5, color: 'bg-green-500' },
  { status: 'Rejected/Closed', count: 357, percentage: 28.6, color: 'bg-red-500' },
]

const topStates = [
  { state: 'Bihar', count: 456, percentage: 36.6 },
  { state: 'Jharkhand', count: 234, percentage: 18.8 },
  { state: 'West Bengal', count: 189, percentage: 15.2 },
  { state: 'Uttar Pradesh', count: 156, percentage: 12.5 },
  { state: 'Others', count: 212, percentage: 17.0 },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600">Comprehensive insights into form submissions and performance</p>
        </div>
        <div className="flex space-x-2">
          <Select defaultValue="30">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalForms.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{((analyticsData.thisMonthForms - analyticsData.lastMonthForms) / analyticsData.lastMonthForms * 100).toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Enquiries to enrollments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.avgResponseTime}</div>
            <p className="text-xs text-muted-foreground">
              Time to first contact
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Forms</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{analyticsData.pendingForms}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Form Types Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Form Types Distribution</CardTitle>
            <CardDescription>Breakdown of form submissions by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">Admission Enquiries</span>
                </div>
                <div className="text-sm font-bold">{analyticsData.admissionEnquiries}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Contact Forms</span>
                </div>
                <div className="text-sm font-bold">{analyticsData.contactForms}</div>
              </div>
              {/* Note: GAET and GVET forms removed as functionality has been removed */}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Current status of all form submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusDistribution.map((item) => (
                <div key={item.status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.status}</span>
                    <span className="text-sm font-bold">{item.count} ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
          <CardDescription>Form submissions by state</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topStates.map((state) => (
              <div key={state.state} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{state.state}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 bg-blue-500 rounded-full"
                      style={{ width: `${state.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold w-16 text-right">{state.count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
          <CardDescription>Form submission trends over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyData.map((month) => (
              <div key={month.month} className="flex items-center justify-between">
                <div className="w-12 text-sm font-medium">{month.month}</div>
                <div className="flex-1 mx-4">
                  <div className="flex space-x-1">
                    <div 
                      className="h-4 bg-blue-500 rounded"
                      style={{ width: `${(month.enquiries / 70) * 100}%` }}
                      title={`Admission Enquiries: ${month.enquiries}`}
                    ></div>
                    <div 
                      className="h-4 bg-green-500 rounded"
                      style={{ width: `${(month.contacts / 55) * 100}%` }}
                      title={`Contact Forms: ${month.contacts}`}
                    ></div>
                    {/* Note: GAET and GVET chart bars removed as functionality has been removed */}
                  </div>
                </div>
                <div className="w-16 text-sm font-bold text-right">{month.forms}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Admission Enquiries</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Contact Forms</span>
            </div>
            {/* Note: GAET and GVET legend items removed as functionality has been removed */}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
