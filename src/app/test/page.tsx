import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard Test Page</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
            <CardDescription>This is a test card to verify styling is working</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">If you can see this card with proper styling, the basic components are working.</p>
            <div className="flex space-x-2">
              <Button>Primary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="secondary">Secondary Button</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stats Card</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-sm text-gray-600">Total Forms</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="pending">Pending</Badge>
                <Badge variant="contacted">Contacted</Badge>
                <Badge variant="enrolled">Enrolled</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Colors Test</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="w-full h-4 bg-blue-500 rounded"></div>
                <div className="w-full h-4 bg-green-500 rounded"></div>
                <div className="w-full h-4 bg-yellow-500 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
