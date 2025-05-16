"use server"

import { cookies } from "next/headers"
import {
  adminClient,
  GET_USER_BY_EMAIL,
  CREATE_USER,
  CREATE_SELLER_PROFILE,
  GET_SELLER_PROFILE,
} from "@/lib/graphql-client"
import { hashPassword, verifyPassword, generateToken, createHasuraClaims } from "@/lib/auth"

export async function loginUser(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      return { success: false, error: "Email and password are required" }
    }

    // Get user from database
    const { users } = await adminClient.request(GET_USER_BY_EMAIL, { email })

    if (users.length === 0) {
      return { success: false, error: "Invalid email or password" }
    }

    const user = users[0]

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) {
      return { success: false, error: "Invalid email or password" }
    }

    // Check if seller is approved
    if (user.role === "seller") {
      // Get seller profile to check approval status
      const { seller_profiles } = await adminClient.request(GET_SELLER_PROFILE, { userId: user.id })

      if (seller_profiles.length === 0 || !seller_profiles[0].is_approved) {
        return {
          success: false,
          error: "Your seller account is pending approval. You'll be notified once it's approved.",
        }
      }
    }

    // Create JWT payload with Hasura claims
    const tokenPayload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      ...createHasuraClaims(user),
    }

    // Generate JWT token
    const token = await generateToken(tokenPayload)

    // Set cookie for server-side auth
    cookies().set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
    })

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function signupUser(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const role = formData.get("role") as string
    const businessName = formData.get("businessName") as string
    const businessDescription = formData.get("businessDescription") as string

    if (!name || !email || !password || !role) {
      return { success: false, error: "All fields are required" }
    }

    // Check if user already exists
    const { users } = await adminClient.request(GET_USER_BY_EMAIL, { email })
    if (users.length > 0) {
      return { success: false, error: "Email already in use" }
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const { insert_users_one } = await adminClient.request(CREATE_USER, {
      name,
      email,
      password_hash: passwordHash,
      role,
    })

    const user = insert_users_one

    // If role is seller, create seller profile
    if (role === "seller" && businessName) {
      await adminClient.request(CREATE_SELLER_PROFILE, {
        userId: user.id,
        businessName,
        description: businessDescription || null,
      })
    }

    // Create JWT payload with Hasura claims
    const tokenPayload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      ...createHasuraClaims(user),
    }

    // Generate JWT token
    const token = await generateToken(tokenPayload)

    // Set cookie for server-side auth - but only if not a seller or if seller is already approved
    if (role !== "seller") {
      cookies().set({
        name: "auth-token",
        value: token,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 day
      })
    }

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: role !== "seller" ? token : null,
      message:
        role === "seller"
          ? "Your seller application has been submitted for review. You'll be notified once it's approved."
          : "Account created successfully.",
    }
  } catch (error) {
    console.error("Signup error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function logoutUser() {
  cookies().delete("auth-token")
  return { success: true }
}
