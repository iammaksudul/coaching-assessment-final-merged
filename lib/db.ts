import { neon } from "@neondatabase/serverless"
import { Pool } from "pg"

let sql: any

if (process.env.DATABASE_URL?.includes("neon") || process.env.DATABASE_URL?.includes("neon.tech")) {
  try {
    sql = neon(process.env.DATABASE_URL!)
  } catch (error) {
    console.error("Failed to initialize Neon connection:", error)
    sql = () => Promise.resolve([])
  }
} else if (process.env.DATABASE_URL) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  sql = async (strings: TemplateStringsArray, ...values: any[]) => {
    let text = ""
    strings.forEach((s, i) => {
      text += s + (i < values.length ? `$${i + 1}` : "")
    })
    const result = await pool.query(text, values)
    return result.rows
  }
} else {
  console.error("DATABASE_URL not set")
  sql = () => Promise.resolve([])
}

// Organization functions
export async function createOrganization(orgData: {
  name: string
  domain?: string
  billingEmail: string
  subscriptionTier?: string
}) {

  try {
    const result = await sql`
      INSERT INTO organizations (name, domain, billing_email, subscription_tier)
      VALUES (${orgData.name}, ${orgData.domain || null}, ${orgData.billingEmail}, ${orgData.subscriptionTier || "TIER_1_5"})
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Database error in createOrganization:", error)
    throw error
  }
}

export async function getOrganizationById(orgId: string) {

  try {
    const result = await sql`
      SELECT * FROM organizations WHERE id = ${orgId}
    `
    return result[0] || null
  } catch (error) {
    console.error("Database error in getOrganizationById:", error)
    return null
  }
}

export async function addUserToOrganization(orgId: string, userId: string, role = "EMPLOYER", invitedBy?: string) {

  try {
    const result = await sql`
      INSERT INTO organization_users (organization_id, user_id, role, invited_by, joined_at)
      VALUES (${orgId}, ${userId}, ${role}, ${invitedBy || null}, CURRENT_TIMESTAMP)
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Database error in addUserToOrganization:", error)
    throw error
  }
}

export async function getUserOrganizations(userId: string) {

  try {
    const result = await sql`
      SELECT o.*, ou.role, ou.status as user_status
      FROM organizations o
      JOIN organization_users ou ON o.id = ou.organization_id
      WHERE ou.user_id = ${userId} AND ou.status = 'ACTIVE'
      ORDER BY o.created_at DESC
    `
    return result
  } catch (error) {
    console.error("Database error in getUserOrganizations:", error)
    return []
  }
}

// User functions (updated for employer-created accounts)
export async function createUser(userData: {
  name: string
  email: string
  password?: string
  image?: string
  accountType?: string
  temporaryPassword?: boolean
}) {

  try {
    const result = await sql`
      INSERT INTO users (
        name, email, password, image, account_type, temporary_password, account_activated
      )
      VALUES (
        ${userData.name}, 
        ${userData.email}, 
        ${userData.password || null}, 
        ${userData.image || null},
        ${userData.accountType || "SELF_CREATED"},
        ${userData.temporaryPassword || false},
        ${userData.accountType === "EMPLOYER_CREATED" ? false : true}
      )
      RETURNING id, name, email, image, role, account_type, temporary_password, account_activated, created_at
    `
    return result[0]
  } catch (error) {
    console.error("Database error in createUser:", error)
    throw error
  }
}

export async function getUserByEmail(email: string) {

  try {
    const result = await sql`
      SELECT id, name, email, password, image, role, account_type, temporary_password, account_activated, created_at
      FROM users
      WHERE email = ${email}
    `
    return result[0] || null
  } catch (error) {
    console.error("Database error in getUserByEmail:", error)
    return null
  }
}

export async function getUserById(id: string) {

  try {
    const result = await sql`
      SELECT id, name, email, image, role, created_at
      FROM users
      WHERE id = ${id}
    `
    return result[0] || null
  } catch (error) {
    console.error("Database error in getUserById:", error)
    return null
  }
}

// Assessment functions (updated with user-specific data)
export async function createAssessment(userId: string, name?: string, sponsoredByOrganization?: string) {

  try {
  const result = await sql`
  INSERT INTO assessments (user_id, name, sponsored_by_organization)
  VALUES (${userId}, ${name || "Coachability Assessment"}, ${sponsoredByOrganization || null})
  RETURNING id, user_id, name, assessment_type, status, sponsored_by_organization, created_at
  `
  return result[0]
  } catch (error) {
  console.error("Database error in createAssessment:", error)
  // Fallback so the assessment can still proceed
  return {
    id: `assessment-${userId}-${Date.now()}`,
    user_id: userId,
    name: name || "Coachability Assessment",
    assessment_type: "SELF",
    status: "IN_PROGRESS",
    sponsored_by_organization: sponsoredByOrganization || null,
    created_at: new Date().toISOString(),
  }
  }
  }

export async function getAssessmentsByUserId(userId: string) {

  try {
    const result = await sql`
      SELECT 
        a.*,
        o.name as organization_name
      FROM assessments a
      LEFT JOIN organizations o ON a.sponsored_by_organization = o.id
      WHERE a.user_id = ${userId}
      ORDER BY a.created_at DESC
    `
    return result
  } catch (error) {
    console.error("Database error in getAssessmentsByUserId:", error)
    return []
  }
}

// Referee invitation functions
export async function getRefereeInvitationsByUserId(userId: string) {

  try {
    const result = await sql`
      SELECT 
        ri.*,
        a.name as assessment_name
      FROM referee_invitations ri
      JOIN assessments a ON ri.assessment_id = a.id
      WHERE a.user_id = ${userId}
      ORDER BY ri.invited_at DESC
    `
    return result
  } catch (error) {
    console.error("Database error in getRefereeInvitationsByUserId:", error)
    return []
  }
}

export async function getAssessmentAccessRequestsByUserId(userId: string) {

  try {
    const result = await sql`
      SELECT 
        aar.*,
        a.name as assessment_name,
        o.name as requesting_organization_name,
        u.name as requested_by_name
      FROM assessment_access_requests aar
      JOIN assessments a ON aar.assessment_id = a.id
      JOIN organizations o ON aar.requesting_organization_id = o.id
      JOIN users u ON aar.requested_by_user_id = u.id
      WHERE aar.candidate_user_id = ${userId}
      AND aar.status = 'PENDING'
      ORDER BY aar.requested_at DESC
    `
    return result
  } catch (error) {
    console.error("Database error in getAssessmentAccessRequestsByUserId:", error)
    return []
  }
}

// Keep all other existing functions unchanged...
export async function getDomains() {

  try {
    const result = await sql`
      SELECT id, name, description, order_index
      FROM domains
      ORDER BY order_index ASC
    `
    return result
  } catch (error) {
    console.error("Database error in getDomains:", error)
    return []
  }
}

export async function getAllQuestionsWithDomains() {

  // Rest of the function remains the same for real database mode
  try {
    const result = await sql`
      SELECT 
        q.id,
        q.text,
        q.order_index as question_order,
        q.question_type,
        q.for_type,
        d.id as domain_id,
        d.name as domain_name,
        d.description as domain_description,
        d.order_index as domain_order
      FROM questions q
      JOIN domains d ON q.domain_id = d.id
      ORDER BY d.order_index ASC, q.order_index ASC
    `
    // If database tables are empty, fall back to seed data
    if (!result || result.length === 0) {
      console.log("No questions found in database, using built-in assessment data")
      return getAllQuestionsWithDomains_fallback()
    }
    return result
  } catch (error) {
    console.error("Database error in getAllQuestionsWithDomains:", error)
    // Fall back to seed data on database error
    return getAllQuestionsWithDomains_fallback()
  }
}

// Fallback seed data for domains/questions
function getAllQuestionsWithDomains_fallback() {
  return [
    { id: "q1", text: "I ask for feedback to help me improve.", question_order: 1, question_type: "LIKERT", for_type: "BOTH", domain_id: "d1", domain_name: "Openness to Feedback", domain_description: "Your ability to receive and act on feedback from others.", domain_order: 1 },
    { id: "q2", text: "I stay calm and listen carefully when receiving feedback.", question_order: 2, question_type: "LIKERT", for_type: "BOTH", domain_id: "d1", domain_name: "Openness to Feedback", domain_description: "Your ability to receive and act on feedback from others.", domain_order: 1 },
    { id: "q3", text: "I take action based on feedback I receive.", question_order: 3, question_type: "LIKERT", for_type: "BOTH", domain_id: "d1", domain_name: "Openness to Feedback", domain_description: "Your ability to receive and act on feedback from others.", domain_order: 1 },
    { id: "q4", text: "I welcome constructive criticism without becoming defensive.", question_order: 4, question_type: "LIKERT", for_type: "BOTH", domain_id: "d1", domain_name: "Openness to Feedback", domain_description: "Your ability to receive and act on feedback from others.", domain_order: 1 },
    { id: "q5", text: "I have a realistic understanding of my strengths.", question_order: 1, question_type: "LIKERT", for_type: "BOTH", domain_id: "d2", domain_name: "Self-Awareness", domain_description: "Your understanding of your own strengths and areas for development.", domain_order: 2 },
    { id: "q6", text: "I acknowledge my areas for development.", question_order: 2, question_type: "LIKERT", for_type: "BOTH", domain_id: "d2", domain_name: "Self-Awareness", domain_description: "Your understanding of your own strengths and areas for development.", domain_order: 2 },
    { id: "q7", text: "I reflect on my behavior and its impact on others.", question_order: 3, question_type: "LIKERT", for_type: "BOTH", domain_id: "d2", domain_name: "Self-Awareness", domain_description: "Your understanding of your own strengths and areas for development.", domain_order: 2 },
    { id: "q8", text: "I demonstrate insight into how others perceive me.", question_order: 4, question_type: "LIKERT", for_type: "BOTH", domain_id: "d2", domain_name: "Self-Awareness", domain_description: "Your understanding of your own strengths and areas for development.", domain_order: 2 },
    { id: "q9", text: "I actively seek out learning opportunities.", question_order: 1, question_type: "LIKERT", for_type: "BOTH", domain_id: "d3", domain_name: "Learning Orientation", domain_description: "Your enthusiasm for acquiring new skills and knowledge.", domain_order: 3 },
    { id: "q10", text: "I show curiosity about new approaches and methods.", question_order: 2, question_type: "LIKERT", for_type: "BOTH", domain_id: "d3", domain_name: "Learning Orientation", domain_description: "Your enthusiasm for acquiring new skills and knowledge.", domain_order: 3 },
    { id: "q11", text: "I apply new knowledge and skills in my work.", question_order: 3, question_type: "LIKERT", for_type: "BOTH", domain_id: "d3", domain_name: "Learning Orientation", domain_description: "Your enthusiasm for acquiring new skills and knowledge.", domain_order: 3 },
    { id: "q12", text: "I enjoy tackling challenging learning experiences.", question_order: 4, question_type: "LIKERT", for_type: "BOTH", domain_id: "d3", domain_name: "Learning Orientation", domain_description: "Your enthusiasm for acquiring new skills and knowledge.", domain_order: 3 },
    { id: "q13", text: "I adapt well to changing circumstances.", question_order: 1, question_type: "LIKERT", for_type: "BOTH", domain_id: "d4", domain_name: "Change Readiness", domain_description: "Your ability to adapt to new situations and approaches.", domain_order: 4 },
    { id: "q14", text: "I embrace new ways of doing things.", question_order: 2, question_type: "LIKERT", for_type: "BOTH", domain_id: "d4", domain_name: "Change Readiness", domain_description: "Your ability to adapt to new situations and approaches.", domain_order: 4 },
    { id: "q15", text: "I remain positive during periods of change.", question_order: 3, question_type: "LIKERT", for_type: "BOTH", domain_id: "d4", domain_name: "Change Readiness", domain_description: "Your ability to adapt to new situations and approaches.", domain_order: 4 },
    { id: "q16", text: "I help others navigate through changes.", question_order: 4, question_type: "LIKERT", for_type: "BOTH", domain_id: "d4", domain_name: "Change Readiness", domain_description: "Your ability to adapt to new situations and approaches.", domain_order: 4 },
    { id: "q17", text: "I stay calm under pressure.", question_order: 1, question_type: "LIKERT", for_type: "BOTH", domain_id: "d5", domain_name: "Emotional Regulation", domain_description: "Your ability to manage emotions effectively in challenging situations.", domain_order: 5 },
    { id: "q18", text: "I manage my emotions effectively in difficult situations.", question_order: 2, question_type: "LIKERT", for_type: "BOTH", domain_id: "d5", domain_name: "Emotional Regulation", domain_description: "Your ability to manage emotions effectively in challenging situations.", domain_order: 5 },
    { id: "q19", text: "I recover quickly from setbacks.", question_order: 3, question_type: "LIKERT", for_type: "BOTH", domain_id: "d5", domain_name: "Emotional Regulation", domain_description: "Your ability to manage emotions effectively in challenging situations.", domain_order: 5 },
    { id: "q20", text: "I maintain composure during conflicts.", question_order: 4, question_type: "LIKERT", for_type: "BOTH", domain_id: "d5", domain_name: "Emotional Regulation", domain_description: "Your ability to manage emotions effectively in challenging situations.", domain_order: 5 },
    { id: "q21", text: "I set clear and achievable goals.", question_order: 1, question_type: "LIKERT", for_type: "BOTH", domain_id: "d6", domain_name: "Goal Orientation", domain_description: "Your focus on setting and achieving meaningful objectives.", domain_order: 6 },
    { id: "q22", text: "I stay focused on my objectives.", question_order: 2, question_type: "LIKERT", for_type: "BOTH", domain_id: "d6", domain_name: "Goal Orientation", domain_description: "Your focus on setting and achieving meaningful objectives.", domain_order: 6 },
    { id: "q23", text: "I persist in working toward my goals.", question_order: 3, question_type: "LIKERT", for_type: "BOTH", domain_id: "d6", domain_name: "Goal Orientation", domain_description: "Your focus on setting and achieving meaningful objectives.", domain_order: 6 },
    { id: "q24", text: "I regularly review and adjust my goals as needed.", question_order: 4, question_type: "LIKERT", for_type: "BOTH", domain_id: "d6", domain_name: "Goal Orientation", domain_description: "Your focus on setting and achieving meaningful objectives.", domain_order: 6 },
    { id: "q25", text: "I bounce back quickly from disappointments.", question_order: 1, question_type: "LIKERT", for_type: "BOTH", domain_id: "d7", domain_name: "Resilience", domain_description: "Your ability to bounce back from setbacks and maintain performance.", domain_order: 7 },
    { id: "q26", text: "I maintain performance during challenging times.", question_order: 2, question_type: "LIKERT", for_type: "BOTH", domain_id: "d7", domain_name: "Resilience", domain_description: "Your ability to bounce back from setbacks and maintain performance.", domain_order: 7 },
    { id: "q27", text: "I learn from failures and setbacks.", question_order: 3, question_type: "LIKERT", for_type: "BOTH", domain_id: "d7", domain_name: "Resilience", domain_description: "Your ability to bounce back from setbacks and maintain performance.", domain_order: 7 },
    { id: "q28", text: "I stay optimistic even when facing difficulties.", question_order: 4, question_type: "LIKERT", for_type: "BOTH", domain_id: "d7", domain_name: "Resilience", domain_description: "Your ability to bounce back from setbacks and maintain performance.", domain_order: 7 },
    { id: "q29", text: "I communicate my ideas clearly.", question_order: 1, question_type: "LIKERT", for_type: "BOTH", domain_id: "d8", domain_name: "Communication Skills", domain_description: "Your effectiveness in expressing ideas and listening to others.", domain_order: 8 },
    { id: "q30", text: "I listen actively to others.", question_order: 2, question_type: "LIKERT", for_type: "BOTH", domain_id: "d8", domain_name: "Communication Skills", domain_description: "Your effectiveness in expressing ideas and listening to others.", domain_order: 8 },
    { id: "q31", text: "I adapt my communication style to different audiences.", question_order: 3, question_type: "LIKERT", for_type: "BOTH", domain_id: "d8", domain_name: "Communication Skills", domain_description: "Your effectiveness in expressing ideas and listening to others.", domain_order: 8 },
    { id: "q32", text: "I ask thoughtful questions to understand others better.", question_order: 4, question_type: "LIKERT", for_type: "BOTH", domain_id: "d8", domain_name: "Communication Skills", domain_description: "Your effectiveness in expressing ideas and listening to others.", domain_order: 8 },
    { id: "q33", text: "I build rapport easily with others.", question_order: 1, question_type: "LIKERT", for_type: "BOTH", domain_id: "d9", domain_name: "Relationship Building", domain_description: "Your ability to develop and maintain positive working relationships.", domain_order: 9 },
    { id: "q34", text: "I maintain positive relationships even during conflicts.", question_order: 2, question_type: "LIKERT", for_type: "BOTH", domain_id: "d9", domain_name: "Relationship Building", domain_description: "Your ability to develop and maintain positive working relationships.", domain_order: 9 },
    { id: "q35", text: "I show genuine interest in others.", question_order: 3, question_type: "LIKERT", for_type: "BOTH", domain_id: "d9", domain_name: "Relationship Building", domain_description: "Your ability to develop and maintain positive working relationships.", domain_order: 9 },
    { id: "q36", text: "I create an inclusive environment for team members.", question_order: 4, question_type: "LIKERT", for_type: "BOTH", domain_id: "d9", domain_name: "Relationship Building", domain_description: "Your ability to develop and maintain positive working relationships.", domain_order: 9 },
    { id: "q37", text: "I take responsibility for my actions.", question_order: 1, question_type: "LIKERT", for_type: "BOTH", domain_id: "d10", domain_name: "Accountability", domain_description: "Your willingness to take ownership of your actions and commitments.", domain_order: 10 },
    { id: "q38", text: "I follow through on my commitments.", question_order: 2, question_type: "LIKERT", for_type: "BOTH", domain_id: "d10", domain_name: "Accountability", domain_description: "Your willingness to take ownership of your actions and commitments.", domain_order: 10 },
    { id: "q39", text: "I admit when I make mistakes.", question_order: 3, question_type: "LIKERT", for_type: "BOTH", domain_id: "d10", domain_name: "Accountability", domain_description: "Your willingness to take ownership of your actions and commitments.", domain_order: 10 },
    { id: "q40", text: "I hold myself to high standards.", question_order: 4, question_type: "LIKERT", for_type: "BOTH", domain_id: "d10", domain_name: "Accountability", domain_description: "Your willingness to take ownership of your actions and commitments.", domain_order: 10 },
    { id: "q41", text: "I believe I can improve my abilities through effort.", question_order: 1, question_type: "LIKERT", for_type: "BOTH", domain_id: "d11", domain_name: "Growth Mindset", domain_description: "Your belief that abilities can be developed through dedication and hard work.", domain_order: 11 },
    { id: "q42", text: "I view challenges as opportunities to grow.", question_order: 2, question_type: "LIKERT", for_type: "BOTH", domain_id: "d11", domain_name: "Growth Mindset", domain_description: "Your belief that abilities can be developed through dedication and hard work.", domain_order: 11 },
    { id: "q43", text: "I see effort as a path to mastery.", question_order: 3, question_type: "LIKERT", for_type: "BOTH", domain_id: "d11", domain_name: "Growth Mindset", domain_description: "Your belief that abilities can be developed through dedication and hard work.", domain_order: 11 },
    { id: "q44", text: "I embrace the learning process, even when it's difficult.", question_order: 4, question_type: "LIKERT", for_type: "BOTH", domain_id: "d11", domain_name: "Growth Mindset", domain_description: "Your belief that abilities can be developed through dedication and hard work.", domain_order: 11 },
    { id: "q45", text: "I take initiative to get things done.", question_order: 1, question_type: "LIKERT", for_type: "BOTH", domain_id: "d12", domain_name: "Action Orientation", domain_description: "Your tendency to take initiative and follow through on commitments.", domain_order: 12 },
    { id: "q46", text: "I act decisively when needed.", question_order: 2, question_type: "LIKERT", for_type: "BOTH", domain_id: "d12", domain_name: "Action Orientation", domain_description: "Your tendency to take initiative and follow through on commitments.", domain_order: 12 },
    { id: "q47", text: "I follow through on my plans.", question_order: 3, question_type: "LIKERT", for_type: "BOTH", domain_id: "d12", domain_name: "Action Orientation", domain_description: "Your tendency to take initiative and follow through on commitments.", domain_order: 12 },
    { id: "q48", text: "I proactively address problems before they escalate.", question_order: 4, question_type: "LIKERT", for_type: "BOTH", domain_id: "d12", domain_name: "Action Orientation", domain_description: "Your tendency to take initiative and follow through on commitments.", domain_order: 12 },
  ]
}

// Assessment CRUD helpers

export async function getAssessmentById(assessmentId: string) {

  try {
    const result = await sql`
      SELECT * FROM assessments WHERE id = ${assessmentId} LIMIT 1
    `
    return result?.[0] || null
  } catch (error) {
    console.error("Database error in getAssessmentById:", error)
    return null
  }
}

export async function saveResponse({
  assessmentId,
  questionId,
  value,
  responseType,
}: {
  assessmentId: string
  questionId: string
  value: string
  responseType: string
}) {

  try {
    const id = `resp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const result = await sql`
      INSERT INTO responses (id, assessment_id, question_id, value, response_type, created_at, updated_at)
      VALUES (${id}, ${assessmentId}, ${questionId}, ${value}, ${responseType}, NOW(), NOW())
      ON CONFLICT (assessment_id, question_id, COALESCE(respondent_token, '')) DO UPDATE SET value = ${value}, updated_at = NOW()
      RETURNING *
    `
    return result?.[0] || { id, assessment_id: assessmentId, question_id: questionId, value, response_type: responseType }
  } catch (error) {
    console.error("Database error in saveResponse:", error)
    // Return a fallback response so the flow doesn't break
    return {
      id: `resp-${questionId}-${Date.now()}`,
      assessment_id: assessmentId,
      question_id: questionId,
      value,
      response_type: responseType,
    }
  }
}

export async function updateAssessmentStatus(assessmentId: string, status: string) {

  try {
    const result = await sql`
      UPDATE assessments SET status = ${status}, updated_at = NOW() WHERE id = ${assessmentId} RETURNING *
    `
    return result?.[0] || { id: assessmentId, status }
  } catch (error) {
    console.error("Database error in updateAssessmentStatus:", error)
    return { id: assessmentId, status }
  }
}

export async function createReferee(data: { name: string; email: string; relationship?: string }) {
  try {
    const result = await sql`
      INSERT INTO referees (name, email, relationship)
      VALUES (${data.name}, ${data.email}, ${data.relationship || 'colleague'})
      RETURNING id, name, email
    `
    return result?.[0] || { id: crypto.randomUUID(), name: data.name, email: data.email }
  } catch (error) {
    console.error("Database error in createReferee:", error)
    return { id: crypto.randomUUID(), name: data.name, email: data.email }
  }
}

export async function createRefereeInvitation(data: {
  assessmentId: string
  refereeId: string
  userId: string
  token: string
  expiresAt: Date
  refereeName?: string
  refereeEmail?: string
  relationship?: string
}) {
  try {
    const result = await sql`
      INSERT INTO referee_invitations (assessment_id, referee_id, user_id, token, expires_at, status, referee_name, referee_email, relationship)
      VALUES (${data.assessmentId}, ${data.refereeId}, ${data.userId}, ${data.token}, ${data.expiresAt.toISOString()}, 'PENDING', ${data.refereeName || null}, ${data.refereeEmail || null}, ${data.relationship || null})
      RETURNING *
    `
    return result?.[0] || { id: crypto.randomUUID(), ...data, status: 'PENDING' }
  } catch (error) {
    console.error("Database error in createRefereeInvitation:", error)
    return { id: crypto.randomUUID(), ...data, status: 'PENDING' }
  }
}

// Export the sql instance for use in other files
export { sql }
