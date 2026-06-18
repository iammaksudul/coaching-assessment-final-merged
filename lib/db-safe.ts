// Safe database connection with comprehensive error handling
let sql: any = null
let isConnected = false

// Initialize database connection safely
async function initializeDatabase() {
  if (isConnected) return sql

  try {
    // Check if we have required environment variables
    if (!process.env.DATABASE_URL) {
      console.log("No DATABASE_URL found")
      sql = () => Promise.resolve([])
      isConnected = true
      return sql
    }

    // Try to import and initialize Neon
    const { neon } = await import("@neondatabase/serverless")
    sql = neon(process.env.DATABASE_URL)

    // Test the connection
    await sql`SELECT 1`
    isConnected = true
    console.log("Database connected successfully")

    return sql
  } catch (error) {
    console.error("Database initialization failed:", error)
    // Fallback mode
    sql = () => Promise.resolve([])
    isConnected = true
    return sql
  }
}

// Safe query wrapper
export async function safeQuery(queryTemplate: any, fallback: any = []) {
  try {
    if (!sql) {
      await initializeDatabase()
    }

    const result = await sql(queryTemplate)
    return result || fallback
  } catch (error) {
    console.error("Query failed:", error)
    return fallback
  }
}

// Export the safe query function as default
export { safeQuery as sql }
