import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PublicHeader } from "@/components/public-header"

export const metadata = {
  title: "Privacy & Cookie Policy | Coaching Digs",
  description: "Privacy and Cookie Policy for Coaching Digs - 360-degree coachability assessment platform",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm border p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy & Cookie Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last Updated: February 26, 2026</p>

          <div className="prose prose-gray max-w-none">
            {/* Section 1 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Guiding Star Communications and Consulting Inc. ("Guiding Star," "we," "us") provides Coaching Digs, 
                a 360-degree assessment platform that explores the ability of individuals to receive coaching. We are 
                committed to protecting the privacy of our Candidates/Participants (those being coached), Referees 
                (those providing feedback on coachability), and Client Organizations (employers seeking insights into coachability).
              </p>
            </section>

            {/* Section 2 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Account Information:</strong> Name, professional (or personal) email, and job title for all users.
                </li>
                <li>
                  <strong>Assessment Data:</strong> Candidate self-assessments and Referee survey responses.
                </li>
                <li>
                  <strong>Corporate Data:</strong> In Corporate accounts, we collect name, organization name, professional 
                  email of (prospective) managers or HR representatives.
                </li>
                <li>
                  <strong>Technical Data:</strong> IP addresses, browser types, and cookies to ensure platform security.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Special Notice to End Users (Employer-Sponsored Accounts)</h2>
              <p className="text-gray-700 mb-4">If you use Coaching Digs through your employer or organization:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Data Visibility:</strong> Your organization acts as the primary Data Controller. Authorized 
                  representatives of your employer will have access to your scores across the 12 Coachability Domains.
                </li>
                <li>
                  <strong>Confidentiality:</strong> Unless otherwise stated by your organization's specific program, 
                  Referee feedback is typically aggregated or anonymized to protect the identity of those providing feedback.
                </li>
                <li>
                  <strong>Administrator Control:</strong> Your organization's administrator may have the ability to access, 
                  restrict, or terminate your account and view targeted (i.e., employer-level views) reports generated within the platform.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. How We Use and Share Data</h2>
              <p className="text-gray-700 mb-4">
                We use your data solely to provide the coaching service. <strong>We do not sell your data.</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Internal Sharing:</strong> Candidate scores are shared with authorized (with consent controlled 
                  by the Candidate) employer representatives as part of the 360-degree process.
                </li>
                <li>
                  <strong>Third-Party Sub-Processors:</strong> We use Hetzner Online GmbH for secure data hosting within 
                  the European Union (EU). We may use anonymized, aggregated data to improve our coaching benchmarks, 
                  but this data never identifies an individual or organization.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Cookie Policy</h2>
              <p className="text-gray-700 mb-4">
                Coaching Digs uses "cookies" (small text files) to function effectively:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Necessary Cookies:</strong> Required for you to log in and remain authenticated during your 
                  session. These cannot be disabled.
                </li>
                <li>
                  <strong>Performance Cookies:</strong> We use tools like Google Analytics to understand how users move 
                  through the app so we can improve the interface.
                </li>
                <li>
                  <strong>Your Choice:</strong> You can block cookies via your browser settings, but the Coaching Digs 
                  platform will not function correctly without Necessary Cookies.
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Security and Global Compliance</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Data Residency:</strong> Your data is stored in the EU (Germany/Finland), providing high-level 
                  GDPR protection by default.
                </li>
                <li>
                  <strong>Canada (PIPEDA):</strong> We comply with Canadian federal privacy standards.
                </li>
                <li>
                  <strong>Security:</strong> We utilize SSL encryption, regular backups, and strict access controls. 
                  Access to raw database records is limited to essential technical staff under strict NDAs.
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
              <p className="text-gray-700 mb-4">Regardless of your location, you have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Request a copy of the data we hold about you.</li>
                <li>Correct inaccurate profile information.</li>
                <li>
                  Request account deletion (subject to your employer's data retention policies if they are the account sponsor).
                </li>
              </ul>
              <p className="text-gray-700 mt-4">
                Inquiries should be sent to{" "}
                <a href="mailto:info@guidingstarcc.com" className="text-blue-600 hover:underline">
                  info@guidingstarcc.com
                </a>.
              </p>
            </section>

            {/* Section 8 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Legal Terms</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Limitation of Liability:</strong> Guiding Star is not liable for indirect, incidental, or 
                  consequential damages arising from the use of Coaching Digs.
                </li>
                <li>
                  <strong>Governing Law:</strong> This policy is governed by the laws of Ontario, Canada. Any disputes 
                  shall be settled via binding arbitration in Ontario.
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>&copy; 2026 Coaching Digs. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
