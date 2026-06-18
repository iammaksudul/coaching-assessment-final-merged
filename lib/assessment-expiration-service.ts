// Assessment Expiration Service
// Handles automatic expiration, plan limit adjustments, and notifications

interface AssessmentExpirationRule {
  type: "DRAFT" | "IN_PROGRESS" | "REFEREE_INVITATION" | "COMMISSIONED"
  expirationDays: number
  gracePeriodDays: number
  maxExtensions: number
  canReactivate: boolean
  reactivationWindowDays: number
}

interface ExpirationResult {
  assessmentId: string
  action: "EXPIRED" | "GRACE_PERIOD" | "WARNING" | "ARCHIVED"
  planLimitAdjustment: number // Negative number means credits returned
  notificationsToSend: string[]
}

export class AssessmentExpirationService {
  private static readonly EXPIRATION_RULES: Record<string, AssessmentExpirationRule> = {
    DRAFT: {
      type: "DRAFT",
      expirationDays: 90,
      gracePeriodDays: 7,
      maxExtensions: 1,
      canReactivate: true,
      reactivationWindowDays: 30,
    },
    IN_PROGRESS: {
      type: "IN_PROGRESS",
      expirationDays: 180, // 6 months
      gracePeriodDays: 14,
      maxExtensions: 2,
      canReactivate: true,
      reactivationWindowDays: 30,
    },
    REFEREE_INVITATION: {
      type: "REFEREE_INVITATION",
      expirationDays: 30,
      gracePeriodDays: 7,
      maxExtensions: 3,
      canReactivate: true,
      reactivationWindowDays: 30,
    },
    COMMISSIONED: {
      type: "COMMISSIONED",
      expirationDays: 60, // Longer for commissioned assessments
      gracePeriodDays: 14,
      maxExtensions: 2,
      canReactivate: true,
      reactivationWindowDays: 60, // Longer reactivation window
    },
  }

  /**
   * Process expiration for a single assessment
   */
  static processAssessmentExpiration(assessment: any): ExpirationResult {
    const rule = this.EXPIRATION_RULES[assessment.type] || this.EXPIRATION_RULES.IN_PROGRESS
    const now = new Date()
    const expiresAt = new Date(assessment.expires_at)
    const createdAt = new Date(assessment.created_at)
    const daysUntilExpiration = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    const result: ExpirationResult = {
      assessmentId: assessment.id,
      action: "WARNING",
      planLimitAdjustment: 0,
      notificationsToSend: [],
    }

    // Check if assessment has expired
    if (daysUntilExpiration <= 0) {
      const daysExpired = Math.abs(daysUntilExpiration)

      if (daysExpired <= rule.gracePeriodDays) {
        // Still in grace period
        result.action = "GRACE_PERIOD"
        result.notificationsToSend.push("GRACE_PERIOD_WARNING")
      } else if (daysExpired <= rule.reactivationWindowDays) {
        // Expired but can be reactivated
        result.action = "EXPIRED"
        result.notificationsToSend.push("ASSESSMENT_EXPIRED")

        // Return plan limit credit for commissioned assessments
        if (assessment.sponsored_by_organization && assessment.counts_toward_limit) {
          result.planLimitAdjustment = -1 // Return 1 credit
        }
      } else {
        // Permanently expired - archive
        result.action = "ARCHIVED"
        result.notificationsToSend.push("ASSESSMENT_ARCHIVED")

        // Return plan limit credit if not already returned
        if (assessment.sponsored_by_organization && assessment.counts_toward_limit) {
          result.planLimitAdjustment = -1
        }
      }
    } else if (daysUntilExpiration <= 3) {
      // Critical warning
      result.action = "WARNING"
      result.notificationsToSend.push("EXPIRATION_CRITICAL")
    } else if (daysUntilExpiration <= 7) {
      // Standard warning
      result.action = "WARNING"
      result.notificationsToSend.push("EXPIRATION_WARNING")
    }

    return result
  }

  /**
   * Process expiration for multiple assessments
   */
  static processBatchExpiration(assessments: any[]): ExpirationResult[] {
    return assessments.map((assessment) => this.processAssessmentExpiration(assessment))
  }

  /**
   * Calculate plan limit adjustments for an organization
   */
  static calculatePlanLimitAdjustments(expirationResults: ExpirationResult[]): {
    totalCreditsReturned: number
    affectedAssessments: string[]
  } {
    const creditsReturned = expirationResults.reduce((total, result) => {
      return total + Math.abs(result.planLimitAdjustment)
    }, 0)

    const affectedAssessments = expirationResults
      .filter((result) => result.planLimitAdjustment < 0)
      .map((result) => result.assessmentId)

    return {
      totalCreditsReturned: creditsReturned,
      affectedAssessments,
    }
  }

  /**
   * Generate notification messages
   */
  static generateNotificationMessages(
    assessment: any,
    notificationType: string,
  ): {
    subject: string
    message: string
    urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  } {
    const daysUntilExpiration = Math.ceil(
      (new Date(assessment.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    )

    switch (notificationType) {
      case "EXPIRATION_WARNING":
        return {
          subject: `Assessment Expiring Soon: ${assessment.name}`,
          message: `Your assessment "${assessment.name}" will expire in ${Math.abs(daysUntilExpiration)} days. Please complete any pending actions or request an extension.`,
          urgency: "MEDIUM",
        }

      case "EXPIRATION_CRITICAL":
        return {
          subject: `URGENT: Assessment Expires in ${Math.abs(daysUntilExpiration)} Days`,
          message: `Your assessment "${assessment.name}" will expire very soon. Immediate action is required to avoid losing your progress.`,
          urgency: "HIGH",
        }

      case "GRACE_PERIOD_WARNING":
        return {
          subject: `Assessment Expired - Grace Period Active`,
          message: `Your assessment "${assessment.name}" has expired but is still accessible during the grace period. Please complete it soon or request reactivation.`,
          urgency: "CRITICAL",
        }

      case "ASSESSMENT_EXPIRED":
        return {
          subject: `Assessment Expired: ${assessment.name}`,
          message: `Your assessment "${assessment.name}" has expired. You can reactivate it within 30 days or create a new assessment.${
            assessment.sponsored_by_organization
              ? " This assessment no longer counts toward your organization's plan limits."
              : ""
          }`,
          urgency: "HIGH",
        }

      case "ASSESSMENT_ARCHIVED":
        return {
          subject: `Assessment Permanently Archived: ${assessment.name}`,
          message: `Your assessment "${assessment.name}" has been permanently archived due to expiration. You'll need to create a new assessment to continue.`,
          urgency: "MEDIUM",
        }

      default:
        return {
          subject: `Assessment Update: ${assessment.name}`,
          message: `There has been an update to your assessment "${assessment.name}".`,
          urgency: "LOW",
        }
    }
  }

  /**
   * Check if an assessment can be extended
   */
  static canExtendAssessment(assessment: any): boolean {
    const rule = this.EXPIRATION_RULES[assessment.type] || this.EXPIRATION_RULES.IN_PROGRESS
    return assessment.extension_count < rule.maxExtensions && new Date(assessment.expires_at) > new Date()
  }

  /**
   * Check if an assessment can be reactivated
   */
  static canReactivateAssessment(assessment: any): boolean {
    const rule = this.EXPIRATION_RULES[assessment.type] || this.EXPIRATION_RULES.IN_PROGRESS
    const now = new Date()
    const expiresAt = new Date(assessment.expires_at)
    const daysExpired = Math.ceil((now.getTime() - expiresAt.getTime()) / (1000 * 60 * 60 * 24))

    return rule.canReactivate && daysExpired > 0 && daysExpired <= rule.reactivationWindowDays
  }

  /**
   * Extend an assessment deadline
   */
  static extendAssessment(assessment: any, extensionDays = 30): any {
    const newExpirationDate = new Date(assessment.expires_at)
    newExpirationDate.setDate(newExpirationDate.getDate() + extensionDays)

    return {
      ...assessment,
      expires_at: newExpirationDate.toISOString(),
      extension_count: assessment.extension_count + 1,
      last_extended_at: new Date().toISOString(),
    }
  }

  /**
   * Reactivate an expired assessment
   */
  static reactivateAssessment(assessment: any, newExpirationDays = 30): any {
    const newExpirationDate = new Date()
    newExpirationDate.setDate(newExpirationDate.getDate() + newExpirationDays)

    return {
      ...assessment,
      expires_at: newExpirationDate.toISOString(),
      status: "REACTIVATED",
      reactivated_at: new Date().toISOString(),
      counts_toward_limit: true, // Reactivated assessments count toward limits again
    }
  }
}

// Export types for use in other files
export type { AssessmentExpirationRule, ExpirationResult }
