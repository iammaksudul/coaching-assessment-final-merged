"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, ArrowRight, BarChart3, Building2, Star } from "lucide-react"

import { PublicHeader } from "@/components/public-header"

interface Tier {
  tier: string; name: string; assessments: string; isFree: boolean; isPopular: boolean
  features: string[]
  monthly: { id: string | null; amount: number }
  annual: { id: string | null; amount: number }
}

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [tiers, setTiers] = useState<Tier[]>([])

  useEffect(() => {
    fetch("/api/stripe/prices").then(r => r.json()).then(d => setTiers(d.prices || [])).catch(() => {})
  }, [])

  const getSignupUrl = (tier: Tier) => {
    if (tier.isFree) return `/register?plan=FREE`
    const billing = isAnnual ? "annual" : "monthly"
    return `/employer/register?plan=${tier.tier}&billing=${billing}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <PublicHeader />

      {/* Hero Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Coachability Assessment Plan</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Start with a free assessment to experience the power of 360-degree feedback. Upgrade anytime to unlock
            unlimited assessments for your organization.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-12">
            <span className={`mr-3 ${!isAnnual ? "text-gray-900 font-medium" : "text-gray-500"}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`ml-3 ${isAnnual ? "text-gray-900 font-medium" : "text-gray-500"}`}>Annual</span>
            {isAnnual && <Badge className="ml-2 bg-green-100 text-green-800">Save 7.5%</Badge>}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {tiers.map((tier) => {
              const monthlyPrice = tier.monthly.amount / 100
              const annualPrice = tier.annual.amount / 100
              return (
              <Card
                key={tier.name}
                className={`relative ${tier.isPopular ? "border-blue-500 border-2" : ""} ${tier.isFree ? "border-green-500 border-2" : ""}`}
              >
                {tier.isPopular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                    Most Popular
                  </Badge>
                )}
                {tier.isFree && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600">
                    <Star className="w-3 h-3 mr-1" />
                    Free Forever
                  </Badge>
                )}

                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <p className="text-sm text-gray-600">{tier.assessments}</p>
                  <div className="mt-4">
                    {tier.isFree ? (
                      <span className="text-3xl font-bold text-green-600">Free</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold">${isAnnual ? annualPrice : monthlyPrice}</span>
                        <span className="text-gray-600">/{isAnnual ? "year" : "month"}</span>
                      </>
                    )}
                  </div>
                  {isAnnual && !tier.isFree && (
                    <p className="text-sm text-green-600">Save ${Math.round(monthlyPrice * 12 - annualPrice)}/year</p>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {(tier.features || []).map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    className={`w-full ${tier.isPopular ? "bg-blue-600 hover:bg-blue-700" : ""} ${tier.isFree ? "bg-green-600 hover:bg-green-700" : ""}`}
                  >
                    <Link href={getSignupUrl(tier)}>
                      {tier.isFree ? "Start Free" : "Get Started"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Free Tier Benefits */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Why Start with Our Free Plan?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Experience the Full Assessment</h3>
              <p className="text-gray-600 text-sm">
                Get a complete 12-domain coachability assessment with 360-degree feedback - no limitations.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Full Reporting Access</h3>
              <p className="text-gray-600 text-sm">
                View comprehensive reports and analytics to understand your coachability profile.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Easy Upgrade Path</h3>
              <p className="text-gray-600 text-sm">
                Upgrade to a paid plan anytime to create unlimited assessments for your team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="font-semibold mb-2">What's included in the free plan?</h3>
              <p className="text-gray-600 text-sm">
                One complete coachability assessment with 360-degree feedback, full reporting, and the ability to
                respond to referee invitations from paying customers.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Can I upgrade from free anytime?</h3>
              <p className="text-gray-600 text-sm">
                Yes! Upgrade to any paid plan instantly to unlock unlimited assessments and additional features.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Can free users be referees for paid customers?</h3>
              <p className="text-gray-600 text-sm">
                Free users can accept and complete referee invitations from organizations with paid plans.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Is there a time limit on the free plan?</h3>
              <p className="text-gray-600 text-sm">
                No time limits! Your free assessment and account remain active forever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Start with a free assessment or choose a plan that fits your organization
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-green-600 hover:bg-green-700" asChild>
              <Link href="/register">
                <Star className="mr-2 h-5 w-5" />
                Start Free Assessment
              </Link>
            </Button>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link href="/employer/register">
                <Building2 className="mr-2 h-5 w-5" />
                Create Organization Account
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2024 Coaching Digs. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
