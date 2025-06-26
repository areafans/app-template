import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateCSRFToken } from "@/lib/security"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const csrfToken = generateCSRFToken()
    
    // Store CSRF token in session or database as needed
    // For now, we'll return it to be stored client-side
    
    return NextResponse.json({ csrfToken })
  } catch (error) {
    console.error("CSRF token generation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}