import { PublicHeader } from "@/components/public-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Users } from "lucide-react"

export default function AssessmentProcessTourPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <PublicHeader />

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Assessment Process</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">12-domain coachability evaluation experience</p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Assessment Journey</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-100 rounded-lg p-12 text-center">
              <p className="text-gray-600 mb-4 text-lg">Screenshots of the assessment process will be displayed here</p>
              <p className="text-sm text-gray-500">Ready for image uploads showing:</p>
              <ul className="text-sm text-gray-500 mt-2 space-y-1">
                <li>• Self-assessment questionnaire</li>
                <li>• 12 coachability domains</li>
                <li>• Referee invitation process</li>
                <li>• Progress tracking</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
