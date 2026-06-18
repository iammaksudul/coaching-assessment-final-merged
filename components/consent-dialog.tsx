"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Shield, Eye, Clock, CheckCircle } from "lucide-react"

interface ConsentDialogProps {
  isOpen: boolean
  onClose: () => void
  onConsent: (consents: ConsentData) => void
  assessment: {
    id: string
    name: string
    sponsored_by: string
    sponsor_contact: string
    sponsor_message: string
    expires_at: string
  }
}

interface ConsentData {
  shareWithEmployer: boolean
  dataProcessing: boolean
  refereeContact: boolean
  dataRetention: boolean
  marketingOptOut: boolean
  rightToWithdraw: boolean
}

export function ConsentDialog({ isOpen, onClose, onConsent, assessment }: ConsentDialogProps) {
  const [consents, setConsents] = useState<ConsentData>({
    shareWithEmployer: false,
    dataProcessing: false,
    refereeContact: false,
    dataRetention: false,
    marketingOptOut: true, // Default to opt-out
    rightToWithdraw: false,
  })

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  const handleConsentChange = (key: keyof ConsentData, value: boolean) => {
    setConsents((prev) => ({ ...prev, [key]: value }))
  }

  const canProceedStep1 = consents.shareWithEmployer
  const canProceedStep2 = consents.dataProcessing && consents.refereeContact && consents.dataRetention
  const canComplete = consents.rightToWithdraw && canProceedStep1 && canProceedStep2

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    if (canComplete) {
      onConsent(consents)
      onClose()
    }
  }

  const formatExpirationDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Assessment Consent & Privacy Settings
          </DialogTitle>
          <DialogDescription>
            Step {currentStep} of {totalSteps} - Please review and provide your consent
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step 1: Employer Data Sharing */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Assessment Request Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Assessment:</span>
                    <p className="text-muted-foreground">{assessment.name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Requested by:</span>
                    <p className="text-muted-foreground">{assessment.sponsored_by}</p>
                  </div>
                  <div>
                    <span className="font-medium">Contact:</span>
                    <p className="text-muted-foreground">{assessment.sponsor_contact}</p>
                  </div>
                  <div>
                    <span className="font-medium">Expires:</span>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatExpirationDate(assessment.expires_at)}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="font-medium text-blue-900 mb-2">Message from {assessment.sponsored_by}:</h4>
                  <p className="text-sm text-blue-800">{assessment.sponsor_message}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Sharing Consent</CardTitle>
                <CardDescription>
                  Your consent is required to share assessment results with the requesting organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="shareWithEmployer"
                      checked={consents.shareWithEmployer}
                      onCheckedChange={(checked) => handleConsentChange("shareWithEmployer", checked as boolean)}
                    />
                    <div className="space-y-1">
                      <label
                        htmlFor="shareWithEmployer"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I consent to sharing my assessment results with {assessment.sponsored_by}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        This includes your coachability scores, referee feedback, and generated recommendations.
                        {assessment.sponsored_by} will have access to view and download your complete assessment report.
                      </p>
                    </div>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                    <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      What will be shared:
                    </h4>
                    <ul className="text-sm text-amber-800 space-y-1">
                      <li>• Your self-assessment responses and scores</li>
                      <li>• Referee feedback and ratings (anonymized)</li>
                      <li>• Coachability domain analysis and recommendations</li>
                      <li>• Gap analysis between self and referee ratings</li>
                      <li>• Generated development suggestions</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Data Processing & Privacy */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Processing & Privacy Rights</CardTitle>
                <CardDescription>Your rights regarding how your data is processed and stored</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="dataProcessing"
                    checked={consents.dataProcessing}
                    onCheckedChange={(checked) => handleConsentChange("dataProcessing", checked as boolean)}
                  />
                  <div className="space-y-1">
                    <label htmlFor="dataProcessing" className="text-sm font-medium">
                      I consent to the processing of my personal data for assessment purposes
                    </label>
                    <p className="text-xs text-muted-foreground">
                      This includes analyzing your responses, generating reports, and providing insights based on your
                      assessment data.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="refereeContact"
                    checked={consents.refereeContact}
                    onCheckedChange={(checked) => handleConsentChange("refereeContact", checked as boolean)}
                  />
                  <div className="space-y-1">
                    <label htmlFor="refereeContact" className="text-sm font-medium">
                      I consent to contacting my selected referees for feedback
                    </label>
                    <p className="text-xs text-muted-foreground">
                      We will send email invitations to your chosen referees asking them to provide feedback about your
                      coachability.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="dataRetention"
                    checked={consents.dataRetention}
                    onCheckedChange={(checked) => handleConsentChange("dataRetention", checked as boolean)}
                  />
                  <div className="space-y-1">
                    <label htmlFor="dataRetention" className="text-sm font-medium">
                      I understand the data retention policy
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Your assessment data will be retained for 7 years for research and improvement purposes, or until
                      you request deletion. You can request data deletion at any time.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="marketingOptOut"
                    checked={consents.marketingOptOut}
                    onCheckedChange={(checked) => handleConsentChange("marketingOptOut", checked as boolean)}
                  />
                  <div className="space-y-1">
                    <label htmlFor="marketingOptOut" className="text-sm font-medium">
                      I do NOT want to receive marketing communications
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Check this box to opt out of promotional emails, newsletters, and marketing materials from
                      Coaching Digs.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Your Privacy Rights (GDPR Compliant):
                </h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>
                    • <strong>Right to Access:</strong> Request a copy of your personal data
                  </li>
                  <li>
                    • <strong>Right to Rectification:</strong> Correct inaccurate personal data
                  </li>
                  <li>
                    • <strong>Right to Erasure:</strong> Request deletion of your personal data
                  </li>
                  <li>
                    • <strong>Right to Portability:</strong> Receive your data in a structured format
                  </li>
                  <li>
                    • <strong>Right to Object:</strong> Object to processing of your personal data
                  </li>
                  <li>
                    • <strong>Right to Withdraw:</strong> Withdraw consent at any time
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Final Confirmation */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Final Confirmation</CardTitle>
                <CardDescription>Please confirm you understand your rights and wish to proceed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="rightToWithdraw"
                    checked={consents.rightToWithdraw}
                    onCheckedChange={(checked) => handleConsentChange("rightToWithdraw", checked as boolean)}
                  />
                  <div className="space-y-1">
                    <label htmlFor="rightToWithdraw" className="text-sm font-medium">
                      I understand I can withdraw my consent at any time
                    </label>
                    <p className="text-xs text-muted-foreground">
                      You can withdraw your consent and request data deletion by contacting info@coachingdigs.com.
                      Withdrawal will not affect the lawfulness of processing based on consent before its withdrawal.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="font-medium text-blue-900 mb-3">Summary of your consents:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Share results with {assessment.sponsored_by}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Process personal data for assessment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Contact selected referees</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Data retention policy acknowledged</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {consents.marketingOptOut ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <div className="w-4 h-4 border border-gray-300 rounded" />
                      )}
                      <span>Marketing communications: {consents.marketingOptOut ? "Opted out" : "Opted in"}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>Next steps:</strong> After providing consent, you'll be able to complete your assessment,
                    select referees, and both you and {assessment.sponsored_by} will receive access to the results once
                    all referees have completed their feedback.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>

          <div className="flex gap-2">
            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={(currentStep === 1 && !canProceedStep1) || (currentStep === 2 && !canProceedStep2)}
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={!canComplete} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Provide Consent & Begin Assessment
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
