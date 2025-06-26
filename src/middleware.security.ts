import { NextRequest, NextResponse } from "next/server"
import { securityHeaders, isIPBlocked } from "@/lib/security"

export function securityMiddleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Get client IP
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0].trim() : 
             request.headers.get("x-real-ip") || 
             "unknown"
  
  // Check if IP is blocked
  if (isIPBlocked(ip)) {
    return new NextResponse("Access Denied", { status: 403 })
  }
  
  // Add security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // Rate limiting headers
  response.headers.set("X-RateLimit-Limit", "100")
  response.headers.set("X-RateLimit-Remaining", "99") // This should be calculated properly
  response.headers.set("X-RateLimit-Reset", new Date(Date.now() + 900000).toISOString())
  
  // Add request ID for tracking
  const requestId = crypto.randomUUID()
  response.headers.set("X-Request-ID", requestId)
  
  return response
}