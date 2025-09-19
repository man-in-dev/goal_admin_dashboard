import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  ClipboardList, 
  MessageSquare, 
  GraduationCap, 
  UserCheck, 
  TrendingUp,
  Download,
  BarChart3
} from 'lucide-react'

// Mock data - will be replaced with real API calls
const formStats = {
  totalForms: 690,
  admissionEnquiries: 456,
  contactForms: 234,
  pendingForms: 89,
  todayForms: 23,
  thisWeekForms: 156
}

const recentSubmissions = [
  { 
    id: 1, 
    type: 'Admission Enquiry', 
    name: 'John Doe', 
    email: 'john@example.com', 
    time: '2 minutes ago', 
    status: 'pending',
    href: '/dashboard/forms/admission'
  },
  { 
    id: 2, 
    type: 'Contact Form', 
    name: 'Jane Smith', 
    email: 'jane@example.com', 
    time: '5 minutes ago', 
    status: 'contacted',
    href: '/dashboard/forms/contact'
  },
  // Note: GAET and GVET form entries removed as functionality has been removed
]

export default function FormsOverviewPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Form Data Management</h1>
        <p className="text-gray-600">Overview and management of all form submissions</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formStats.totalForms.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Forms</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formStats.pendingForms}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Forms</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formStats.todayForms}</div>
            <p className="text-xs text-muted-foreground">
              +8% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formStats.thisWeekForms}</div>
            <p className="text-xs text-muted-foreground">
              +23% from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Form Types Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Form Types Overview</CardTitle>
            <CardDescription>Distribution of different form types</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Admission Enquiries</span>
              </div>
              <div className="text-sm font-bold">{formStats.admissionEnquiries}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Contact Forms</span>
              </div>
              <div className="text-sm font-bold">{formStats.contactForms}</div>
            </div>
            {/* Note: GAET and GVET form stats removed as functionality has been removed */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>Latest form submissions across all types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSubmissions.map((submission) => (
                <div key={submission.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <ClipboardList className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{submission.name}</p>
                      <p className="text-xs text-gray-500">{submission.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{submission.time}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      submission.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                      submission.status === 'verified' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {submission.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" /> Admission Enquiries
            </CardTitle>
            <CardDescription>Manage admission enquiries</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              View and manage all admission enquiries from prospective students.
            </p>
            <div className="text-2xl font-bold mb-2">{formStats.admissionEnquiries}</div>
            <p className="text-xs text-gray-500">Total enquiries</p>
          </CardContent>
          <div className="p-6 pt-0">
            <Button asChild className="w-full">
              <Link href="/dashboard/forms/admission">Manage Enquiries</Link>
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" /> Contact Forms
            </CardTitle>
            <CardDescription>Manage contact form submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              View and manage all contact form submissions and inquiries.
            </p>
            <div className="text-2xl font-bold mb-2">{formStats.contactForms}</div>
            <p className="text-xs text-gray-500">Total contacts</p>
          </CardContent>
          <div className="p-6 pt-0">
            <Button asChild className="w-full">
              <Link href="/dashboard/forms/contact">Manage Contacts</Link>
            </Button>
          </div>
        </Card>

        {/* Note: GAET and GVET form management cards removed as functionality has been removed */}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/dashboard/analytics">
                <BarChart3 className="h-6 w-6 mb-2" />
                View Analytics
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/dashboard/export">
                <Download className="h-6 w-6 mb-2" />
                Export All Data
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/dashboard/forms/admission">
                <TrendingUp className="h-6 w-6 mb-2" />
                View Pending Forms
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
