import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PublicHeader } from "@/components/public-header"

export const metadata = {
  title: "Terms and Conditions | Coaching Digs",
  description: "Terms and Conditions of Use for Coaching Digs",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms and Conditions of Use</h1>
        <p className="text-lg text-gray-600 mb-8">Coaching Digs</p>
        <p className="text-sm text-gray-500 mb-8">Last Updated: February 26, 2026</p>

        <div className="prose prose-gray max-w-none">
          {/* Section 1 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing or using Coaching Digs (the "Service"), owned and operated by Guiding Star 
              Communications and Consulting Inc. ("Guiding Star"), you agree to be bound by these Terms 
              and Conditions. If you are using the Service on behalf of an employer, you represent that 
              you have the authority to bind that organization to these terms.
            </p>
          </section>

          {/* Section 2 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Eligibility & Account Security</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                <strong>Age:</strong> You must be at least 16 years old to use this Service.
              </p>
              <p>
                <strong>Accounts:</strong> You are responsible for maintaining the confidentiality of your 
                login credentials. You agree to notify us immediately of any unauthorized use of your account.
              </p>
              <p>
                <strong>Accuracy:</strong> You agree to provide true and accurate information during registration. 
                Guiding Star reserves the right to suspend accounts providing false or misleading data.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Roles & Data Access</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Service involves different types of users with varying access levels:
            </p>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                <strong>Candidates:</strong> Individuals undergoing assessment. You consent to your results 
                being generated and shared with your sponsoring organization (if applicable).
              </p>
              <p>
                <strong>Referees:</strong> Individuals providing feedback. You agree that your feedback will 
                be used to generate coaching insights for the Candidate.
              </p>
              <p>
                <strong>Administrators:</strong> Corporate representatives who may view aggregated or individual 
                domain scores as part of a professional development program.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Acceptable Use (The "Rules of the Dig")</h2>
            <p className="text-gray-700 leading-relaxed mb-4">You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Submit defamatory, harassing, or offensive content in survey responses.</li>
              <li>Impersonate any person or misrepresent your affiliation with an organization.</li>
              <li>Attempt to "hack," probe, or scan the Service for vulnerabilities.</li>
              <li>Use automated systems (bots, spiders) to scrape data or overwhelm the servers.</li>
              <li>Reverse-engineer or copy the proprietary "12 Coachability Domains" or report logic.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Intellectual Property</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                <strong>Our Property:</strong> Guiding Star owns all rights to the Coaching Digs name, logos, 
                survey methodology, assessment algorithms, and the "12 Coachability Domains."
              </p>
              <p>
                <strong>Your Content:</strong> You retain ownership of the specific text and data you input. 
                However, by submitting feedback or responses, you grant Guiding Star a perpetual, royalty-free 
                license to use that data in an anonymized and aggregated format to improve our coaching 
                benchmarks and analytics.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Corporate Billing & Refunds</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                <strong>Payments:</strong> Fees for Corporate Editions or individual seat licenses are governed 
                by the specific order form or invoice provided at the time of purchase.
              </p>
              <p>
                <strong>Refunds:</strong> Generally, all charges are non-refundable once an assessment has been 
                initiated or a report has been generated, as the Service is deemed "consumed" at that point.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Disclaimers & Limitation of Liability</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                <strong>"As Is" Basis:</strong> The Service is provided without warranties of any kind. We do 
                not guarantee that the coaching insights will lead to specific career or business outcomes.
              </p>
              <p>
                <strong>No Advice:</strong> The content within Coaching Digs is for informational and developmental 
                purposes and does not constitute legal, psychological, or medical advice.
              </p>
              <p>
                <strong>Liability Cap:</strong> To the maximum extent permitted by law, Guiding Star's total 
                liability for any claim arising from the Service shall not exceed the amount you (or your 
                organization) paid to use the Service in the 12 months preceding the claim.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify and hold Guiding Star harmless from any claims, damages, or legal fees 
              resulting from your violation of these Terms or your misuse of the Service.
            </p>
          </section>

          {/* Section 9 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Governing Law & Dispute Resolution</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                <strong>Jurisdiction:</strong> These terms are governed by the laws of Ontario, Canada.
              </p>
              <p>
                <strong>Mandatory Arbitration:</strong> Any disputes arising from these Terms shall be resolved 
                through final and binding arbitration in Ontario, Canada, rather than in court.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to suspend or terminate your access to the Service at any time, without 
              notice, if we believe you have violated these Terms or if your sponsoring organization's 
              contract ends.
            </p>
          </section>

          {/* Section 11 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
            <div className="text-gray-700 leading-relaxed">
              <p className="font-medium">Guiding Star Communications and Consulting Inc.</p>
              <p>P.O. Box 316, Atwood, ON N0G 1B0 Canada</p>
              <p>Email: info@guidingstarcc.com</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>&copy; 2026 Coaching Digs. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
