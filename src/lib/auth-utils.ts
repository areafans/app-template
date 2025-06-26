import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { UserRole } from "@prisma/client"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/signin')
  }
  return user
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    redirect('/unauthorized')
  }
  return user
}

export async function requireAdmin() {
  return requireRole(['ADMIN'])
}

export async function requireParentOrAdmin() {
  return requireRole(['PARENT', 'ADMIN'])
}

export async function requirePartnerOrAdmin() {
  return requireRole(['PARTNER', 'ADMIN'])
}

export async function requireSupporterOrAdmin() {
  return requireRole(['SUPPORTER', 'ADMIN'])
}

export function hasPermission(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole)
}

export function isAdmin(userRole: UserRole): boolean {
  return userRole === 'ADMIN'
}

export function isParent(userRole: UserRole): boolean {
  return userRole === 'PARENT'
}

export function isChild(userRole: UserRole): boolean {
  return userRole === 'CHILD'
}

export function isSupporter(userRole: UserRole): boolean {
  return userRole === 'SUPPORTER'
}

export function isPartner(userRole: UserRole): boolean {
  return userRole === 'PARTNER'
}