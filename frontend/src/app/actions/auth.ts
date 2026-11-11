/**
 * frontend/src/app/actions/auth.ts
 * Server Actions for authentication (login/logout/signup).
 * These run on the Next.js server tier and delegate database operations to the Express API.
 */

"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { API_BASE_URL } from "@/config/api";

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
  } catch (err: any) {
    const errorMsg = err?.message || String(err || "");
    if (errorMsg.includes("ACCOUNT_LOCKED")) {
      return {
        error:
          "Your account has been temporarily locked due to multiple failed login attempts. Please try again in 15 minutes.",
      };
    }
    if (errorMsg.includes("EMAIL_UNVERIFIED")) {
      return { error: "EMAIL_UNVERIFIED" };
    }
    if (errorMsg.includes("DATABASE_UNAVAILABLE")) {
      return {
        error:
          "Database service is currently unavailable. Please verify the Render PostgreSQL database is active and reachable.",
      };
    }
    if (err instanceof AuthError) {
      return { error: "Invalid email or password. Please try again." };
    }
    if (errorMsg.includes("CredentialsSignin") || errorMsg.includes("credential")) {
      return { error: "Invalid email or password. Please try again." };
    }
    console.error("[loginAction] Handled login error:", err);
    return { error: "Login failed. Please verify your credentials and network connection." };
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
  } catch (err: any) {
    const errorMsg = err?.message || String(err || "");
    if (errorMsg.includes("GOOGLE_UNREGISTERED")) {
      return {
        error:
          "Access Denied. Your Google account is not pre-registered on the platform. Please contact your administrator.",
      };
    }
    console.error("[googleLoginAction] Handled Google auth error:", err);
    return { error: "Google authentication failed. Please try again." };
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
    const apiUrl = API_BASE_URL;
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
