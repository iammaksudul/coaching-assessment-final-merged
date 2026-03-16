import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, BarChart3 } from "lucide-react"

export default function IndividualDashboardTourPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Coaching Digs</span>
          </div>
          <Button variant="outline" asChild>
            <Link href="/tour/overview">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tour
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Individual Dashboard</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Personal development tracking and assessment management
          </p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Dashboard Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-100 rounded-lg p-12 text-center">
              <p className="text-gray-600 mb-4 text-lg">
                Screenshots of the individual dashboard will be displayed here
              </p>
              <p className="text-sm text-gray-500">Ready for image uploads showing:</p>
              <ul className="text-sm text-gray-500 mt-2 space-y-1">
                <li>• Assessment overview and progress</li>
                <li>• Referee invitation management</li>
                <li>• Personal development insights</li>
                <li>• Report access and sharing</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
