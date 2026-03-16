import { ServerClient } from "postmark"

const postmarkClient = new ServerClient(process.env.POSTMARK_API_TOKEN || "")

export interface EmailTemplate {
  to: string
  from?: string
  subject: string
  htmlBody: string
  textBody?: string
  tag?: string
}

const DEFAULT_FROM = "info@coachingdigs.com"

export async function sendEmail(template: EmailTemplate) {
  if (!process.env.POSTMARK_API_TOKEN) {
    console.log("Email would be sent:", template)
    return { success: true, messageId: "preview-mode" }
  }

  try {
    const result = await postmarkClient.sendEmail({
      From: template.from || DEFAULT_FROM,
      To: template.to,
      Subject: template.subject,
      HtmlBody: template.htmlBody,
      TextBody: template.textBody || stripHtml(template.htmlBody),
      Tag: template.tag,
    })

    return { success: true, messageId: result.MessageID }
  } catch (error) {
    console.error("Email sending error:", error)
    return { success: false, error: error.message }
  }
}

// Payment-related email templates
export function createPaymentFailedEmail(data: {
  customerName: string
  organizationName?: string
  amount: string
  updatePaymentLink: string
  customMessage?: string
}) {
  const subject = `Payment Failed - Action Required`

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Payment Failed</h2>
      
      <p>Hello ${data.customerName},</p>
      
      <p>We were unable to process your payment of <strong>${data.amount}</strong> for your Coachability Assessment subscription${data.organizationName ? ` (${data.organizationName})` : ""}.</p>
      
      ${
        data.customMessage
          ? `
        <div style="background-color: #f3f4f6; padding: 15px; margin: 20px 0; border-left: 4px solid #6b7280;">
          ${data.customMessage}
        </div>
      `
          : ""
      }
      
      <div style="background-color: #fef2f2; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #dc2626;">
        <h3 style="margin-top: 0; color: #dc2626;">Immediate Action Required</h3>
        <p>To avoid service interruption, please update your payment method immediately.</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.updatePaymentLink}" 
           style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Update Payment Method
        </a>
      </div>
      
      <p>If you have any questions, please contact our support team.</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #666;">
        This email was sent by Coaching Digs regarding your subscription payment.
      </p>
    </div>
  `

  return {
    subject,
    htmlBody,
    tag: "payment-failed",
  }
}

export function createPaymentRetryReminderEmail(data: {
  customerName: string
  organizationName?: string
  nextRetryDate: string
  updatePaymentLink: string
  customMessage?: string
}) {
  const subject = `Payment Retry Reminder - Update Required`

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">Payment Retry Reminder</h2>
      
      <p>Hello ${data.customerName},</p>
      
      <p>This is a reminder that your payment for the Coachability Assessment subscription${data.organizationName ? ` (${data.organizationName})` : ""} is still pending.</p>
      
      <p>We will automatically retry your payment on <strong>${new Date(data.nextRetryDate).toLocaleDateString()}</strong>.</p>
      
      ${
        data.customMessage
          ? `
        <div style="background-color: #f3f4f6; padding: 15px; margin: 20px 0; border-left: 4px solid #6b7280;">
          ${data.customMessage}
        </div>
      `
          : ""
      }
      
      <div style="background-color: #fef3c7; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #f59e0b;">
        <h3 style="margin-top: 0; color: #f59e0b;">Avoid Service Interruption</h3>
        <p>To ensure uninterrupted service, please update your payment method before the next retry attempt.</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.updatePaymentLink}" 
           style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Update Payment Method
        </a>
      </div>
      
      <p>Thank you for your prompt attention to this matter.</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #666;">
        This email was sent by Coaching Digs regarding your subscription payment.
      </p>
    </div>
  `

  return {
    subject,
    htmlBody,
    tag: "payment-retry-reminder",
  }
}

export function createFinalNoticeEmail(data: {
  customerName: string
  organizationName?: string
  suspensionDate: string
  updatePaymentLink: string
  customMessage?: string
}) {
  const subject = `Final Notice - Account Suspension Pending`

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Final Notice - Account Suspension</h2>
      
      <p>Hello ${data.customerName},</p>
      
      <p><strong>This is your final notice.</strong> Your Coachability Assessment subscription${data.organizationName ? ` (${data.organizationName})` : ""} payment remains outstanding.</p>
      
      <div style="background-color: #fef2f2; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #dc2626;">
        <h3 style="margin-top: 0; color: #dc2626;">Account Suspension Warning</h3>
        <p>Your account will be suspended on <strong>${new Date(data.suspensionDate).toLocaleDateString()}</strong> if payment is not received.</p>
        <p>After suspension:</p>
        <ul>
          <li>You will lose access to create new assessments</li>
          <li>Existing assessments will become read-only</li>
          <li>Your account data will be preserved for 30 days</li>
        </ul>
      </div>
      
      ${
        data.customMessage
          ? `
        <div style="background-color: #f3f4f6; padding: 15px; margin: 20px 0; border-left: 4px solid #6b7280;">
          ${data.customMessage}
        </div>
      `
          : ""
      }
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.updatePaymentLink}" 
           style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          Update Payment Method Now
        </a>
      </div>
      
      <p>If you need assistance or have questions about your account, please contact our support team immediately.</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #666;">
        This email was sent by Coaching Digs regarding your subscription payment.
      </p>
    </div>
  `

  return {
    subject,
    htmlBody,
    tag: "final-notice",
  }
}

export function createAccountSuspensionEmail(data: {
  customerName: string
  organizationName?: string
  reason: string
  reactivationInstructions: string
}) {
  const subject = `Account Suspended - ${data.organizationName || "Your Subscription"}`

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Account Suspended</h2>
      
      <p>Hello ${data.customerName},</p>
      
      <p>Your Coachability Assessment subscription${data.organizationName ? ` (${data.organizationName})` : ""} has been suspended.</p>
      
      <div style="background-color: #fef2f2; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #dc2626;">
        <h3 style="margin-top: 0; color: #dc2626;">Suspension Reason</h3>
        <p>${data.reason}</p>
      </div>
      
      <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 5px;">
        <h3 style="margin-top: 0;">What This Means</h3>
        <ul>
          <li>You cannot create new assessments</li>
          <li>Existing assessments are read-only</li>
          <li>Your data is preserved and can be restored</li>
        </ul>
      </div>
      
      <div style="background-color: #ecfdf5; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #10b981;">
        <h3 style="margin-top: 0; color: #10b981;">Reactivation</h3>
        <p>${data.reactivationInstructions}</p>
      </div>
      
      <p>If you have any questions or need assistance, please contact our support team.</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #666;">
        This email was sent by Coaching Digs regarding your account status.
      </p>
    </div>
  `

  return {
    subject,
    htmlBody,
    tag: "account-suspended",
  }
}

// Candidate-related email templates
export function createCandidateInvitationEmail(data: {
  candidateName: string
  organizationName: string
  invitedByName: string
  assessmentName: string
  invitationLink: string
  personalMessage?: string
  isNewAccount: boolean
}) {
  const subject = `Invitation: Complete Your Coachability Assessment`

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">You're Invited to Complete a Coachability Assessment</h2>
      
      <p>Hello ${data.candidateName},</p>
      
      <p>You have been invited by <strong>${data.invitedByName}</strong> from <strong>${data.organizationName}</strong> to complete a coachability assessment.</p>
      
      ${
        data.personalMessage
          ? `
        <div style="background-color: #f8fafc; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #2563eb;">
          <h3 style="margin-top: 0; color: #2563eb;">Personal Message</h3>
          <p style="margin-bottom: 0;">${data.personalMessage}</p>
        </div>
      `
          : ""
      }
      
      <div style="background-color: #ecfdf5; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #10b981;">
        <h3 style="margin-top: 0; color: #10b981;">Assessment: ${data.assessmentName}</h3>
        <p>This comprehensive assessment will help evaluate your coachability across 12 key domains. The process includes:</p>
        <ul>
          <li>Self-assessment questionnaire (15-20 minutes)</li>
          <li>Nominating referees for additional feedback</li>
          <li>Comprehensive report generation</li>
        </ul>
      </div>
      
      ${
        data.isNewAccount
          ? `
        <div style="background-color: #fef3c7; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #f59e0b;">
          <h3 style="margin-top: 0; color: #f59e0b;">New Account Created</h3>
          <p>We've created an account for you. You'll be able to set your password when you first log in.</p>
        </div>
      `
          : ""
      }
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.invitationLink}" 
           style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          Start Assessment
        </a>
      </div>
      
      <p>This invitation will expire in 30 days. If you have any questions, please contact ${data.invitedByName} or our support team.</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #666;">
        This invitation was sent by ${data.organizationName} via Coaching Digs.
      </p>
    </div>
  `

  return {
    subject,
    htmlBody,
    tag: "candidate-invitation",
  }
}

// Referee-related email templates
export function createRefereeInvitationEmail(data: {
  refereeName: string
  candidateName: string
  relationship: string
  surveyLink: string
  personalMessage?: string
  expirationDays?: number
}) {
  const subject = `${data.candidateName} has requested your feedback`

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #8b5cf6;">You've Been Asked to Provide Feedback</h2>
      
      <p>Hello ${data.refereeName},</p>
      
      <p><strong>${data.candidateName}</strong> has nominated you as a referee for their Coachability Assessment. They value your perspective as their <strong>${data.relationship}</strong> and would appreciate your honest feedback.</p>
      
      ${
        data.personalMessage
          ? `
        <div style="background-color: #f8fafc; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #8b5cf6;">
          <h3 style="margin-top: 0; color: #8b5cf6;">Personal Message from ${data.candidateName}</h3>
          <p style="margin-bottom: 0; font-style: italic;">"${data.personalMessage}"</p>
        </div>
      `
          : ""
      }
      
      <div style="background-color: #f0f9ff; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #0ea5e9;">
        <h3 style="margin-top: 0; color: #0ea5e9;">What You'll Do</h3>
        <p>You'll answer questions about ${data.candidateName}'s coachability across 12 key domains:</p>
        <ul style="margin-bottom: 0;">
          <li>Takes about 10-15 minutes to complete</li>
          <li>All responses are confidential</li>
          <li>No account creation required</li>
          <li>Your insights will help them grow</li>
        </ul>
      </div>
      
      <div style="background-color: #fef3c7; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #f59e0b;">
        <h3 style="margin-top: 0; color: #f59e0b;">Anonymous & Confidential</h3>
        <p style="margin-bottom: 0;">Your individual responses will remain confidential. ${data.candidateName} will receive aggregated feedback from all referees without seeing individual scores.</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.surveyLink}" 
           style="background-color: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          Start Referee Survey
        </a>
      </div>
      
      <p style="color: #666;">This invitation will expire in ${data.expirationDays || 30} days. Your feedback is valuable and will help ${data.candidateName} on their professional development journey.</p>
      
      <p>If you have any questions about this survey, please contact our support team.</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #666;">
        This referee invitation was sent via Coaching Digs on behalf of ${data.candidateName}.
      </p>
    </div>
  `

  return {
    subject,
    htmlBody,
    tag: "referee-invitation",
  }
}

export function createRefereeReminderEmail(data: {
  refereeName: string
  candidateName: string
  relationship: string
  surveyLink: string
  daysRemaining: number
}) {
  const subject = `Reminder: Feedback request from ${data.candidateName}`

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">Friendly Reminder: Referee Survey</h2>
      
      <p>Hello ${data.refereeName},</p>
      
      <p>This is a friendly reminder that <strong>${data.candidateName}</strong> is still waiting for your feedback on their Coachability Assessment.</p>
      
      <div style="background-color: #fef3c7; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #f59e0b;">
        <h3 style="margin-top: 0; color: #f59e0b;">Time Remaining</h3>
        <p style="margin-bottom: 0;">You have <strong>${data.daysRemaining} days</strong> remaining to complete the survey before it expires.</p>
      </div>
      
      <div style="background-color: #f0f9ff; padding: 20px; margin: 20px 0; border-radius: 5px;">
        <p style="margin: 0;"><strong>Quick reminder:</strong> The survey takes about 10-15 minutes and your responses are completely confidential.</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.surveyLink}" 
           style="background-color: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          Complete Survey Now
        </a>
      </div>
      
      <p>Your feedback is important to ${data.candidateName}'s professional development. Thank you for taking the time to help!</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #666;">
        This reminder was sent via Coaching Digs on behalf of ${data.candidateName}.
      </p>
    </div>
  `

  return {
    subject,
    htmlBody,
    tag: "referee-reminder",
  }
}

// Utility function to strip HTML for text version
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim()
}
