"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, BarChart3, Users, TrendingUp, Eye, Share2, CheckCircle } from "lucide-react"
import Link from "next/link"

import { PublicHeader } from "@/components/public-header"

export default function ReportsAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <PublicHeader />
      <div className="container mx-auto px-4 py-8">

        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Reports & Analytics</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform assessment data into actionable insights with our comprehensive reporting suite. Experience
            different access levels and see how organizations can leverage coachability data.
          </p>
        </div>

        {/* Interactive Report Demonstrations */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Interactive Report Demonstrations</h2>
          <p className="text-lg text-gray-600 text-center mb-8 max-w-4xl mx-auto">
            Experience our three different report access levels. Each provides the right amount of detail for different
            organizational needs and privacy preferences.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Full Access Demo */}
            <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Full Access Report</CardTitle>
                  <Badge className="bg-blue-600 text-white">Complete</Badge>
                </div>
                <CardDescription>
                  Comprehensive analysis with all assessment details, coaching recommendations, and 360-degree feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Complete domain breakdown</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Self vs referee comparison</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Coach-client fit analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Detailed recommendations</span>
                  </div>
                </div>
                <Link href="/shared-report/full-access-token-123">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Eye className="h-4 w-4 mr-2" />
                    Try Full Access Demo
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Summary Only Demo */}
            <Card className="border-2 border-green-200 hover:border-green-400 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Summary Only</CardTitle>
                  <Badge className="bg-green-600 text-white">Balanced</Badge>
                </div>
                <CardDescription>
                  Key insights and overall performance summary without detailed breakdowns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Overall coachability score</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Key strengths & development areas</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>High-level recommendations</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Coaching style preferences</span>
                  </div>
                </div>
                <Link href="/shared-report/summary-only-token-456">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Eye className="h-4 w-4 mr-2" />
                    Try Summary Demo
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Scores Only Demo */}
            <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Scores Only</CardTitle>
                  <Badge className="bg-purple-600 text-white">Essential</Badge>
                </div>
                <CardDescription>
                  Pure numerical data and domain scores without detailed analysis or recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Domain scores (1-5 scale)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Overall coachability rating</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Self vs referee comparison</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Numerical data only</span>
                  </div>
                </div>
                <Link href="/shared-report/scores-only-token-789">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Eye className="h-4 w-4 mr-2" />
                    Try Scores Demo
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How Report Sharing Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">How Report Sharing Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Individual Shares</h3>
              <p className="text-gray-600">
                Assessment takers choose what level of detail to share with organizations, maintaining full control over
                their data privacy.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Organization Views</h3>
              <p className="text-gray-600">
                Employers receive secure access to exactly the information level granted, with clear indicators of
                what's included.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Actionable Insights</h3>
              <p className="text-gray-600">
                Organizations use the insights to make informed decisions about coaching, development, and team
                dynamics.
              </p>
            </div>
          </div>
        </div>

        {/* Advanced Analytics Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Advanced Analytics Features</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  360-Degree Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Compare self-assessments with referee feedback to identify blind spots and areas of alignment in
                  coachability perceptions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Progress Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Monitor coachability development over time with longitudinal assessments and trend analysis across
                  multiple evaluation periods.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Coaching Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Receive AI-powered coaching suggestions tailored to individual coachability profiles and development
                  priorities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Why Our Reports Stand Out */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Why Our Reports Stand Out</h2>
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-600">Privacy-First Design</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Granular sharing controls</li>
                  <li>• Time-limited access</li>
                  <li>• Revocable permissions</li>
                  <li>• Audit trail tracking</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-green-600">Actionable Insights</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Evidence-based recommendations</li>
                  <li>• Coaching style matching</li>
                  <li>• Development prioritization</li>
                  <li>• Team dynamics analysis</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/tour/assessment-process">
            <Button variant="outline" size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous: Assessment Process
            </Button>
          </Link>
          <div className="flex gap-4">
            <Link href="/tour/overview">
              <Button variant="ghost" size="lg">
                Tour Overview
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Start Your Free Trial
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
