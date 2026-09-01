/**
 * frontend/src/app/actions/auth.ts
 * Server Actions for authentication (login/logout/signup).
 * These run on the Next.js server tier and delegate database operations to the Express API.
 */

"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export interface LoginResult {
  error?: string;
}

export async function loginAction(
  formData: FormData
): Promise<LoginResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    await signIn("credentials", {
      email: email.toLowerCase().trim(),
      password,
      redirect: false,
    });
    // Success — no error returned, caller handles redirect
    return {};
  } catch (err) {
    if (err instanceof AuthError) {
      switch (err.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password. Please try again." };
        default:
          // Check for custom error messages (ACCOUNT_LOCKED, EMAIL_UNVERIFIED)
          if (err.message?.includes("ACCOUNT_LOCKED")) {
            return {
              error:
                "Your account has been temporarily locked due to multiple failed login attempts. Please try again in 15 minutes.",
            };
          }
          if (err.message?.includes("EMAIL_UNVERIFIED")) {
            return { error: "EMAIL_UNVERIFIED" };
          }
          return { error: "Login failed. Please try again." };
      }
    }
    throw err; // Re-throw unexpected errors
  }
}

export async function googleLoginAction(
  idToken: string
): Promise<LoginResult> {
  if (!idToken) {
    return { error: "Google ID Token is required." };
  }

  try {
    await signIn("credentials", {
      googleIdToken: idToken,
      redirect: false,
    });
    return {};
  } catch (err) {
    if (err instanceof AuthError) {
      if (err.message?.includes("GOOGLE_UNREGISTERED")) {
        return {
          error: "Access Denied. Your Google account is not pre-registered on the platform. Please contact your administrator."
        };
      }
      return { error: "Google authentication failed. Please try again." };
    }
    throw err;
  }
}

export async function logoutAction(): Promise<void> {
  try {
    // Session logout audit is handled inside NextAuth configuration or backend endpoint.
    await signOut({ redirect: false });
  } catch (err) {
    console.error("[Logout Action] Error on signOut:", err);
  } finally {
    redirect("/login");
  }
}

export interface SignupResult {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function signupAction(
  formData: FormData
): Promise<SignupResult> {
  // Extract all fields
  const raw = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    email: formData.get("email") as string,
    mobile: formData.get("mobile") as string,
    employeeId: formData.get("employeeId") as string,
    department: formData.get("department") as string,
    designation: formData.get("designation") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    acceptTerms: formData.get("acceptTerms") as string,
  };

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
    const res = await fetch(`${apiUrl}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(raw),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        error: data.message || "Signup failed.",
        fieldErrors: data.errors || {},
      };
    }

    return { success: true };
  } catch (err) {
    console.error("[Signup Action] Delegate signup error:", err);
    return {
      error: "Authentication service connection failed. Please try again later.",
    };
  }
}
