import { apiPost } from "@/lib/axios";

export interface SignupResponse {
  success: boolean;
  message: string;
  data?: {
    userId: string;
    employeeId: string;
    employeeCode: string;
  };
}

export interface GenericResponse {
  success: boolean;
  message: string;
}

export class AuthService {
  static async signup(data: Record<string, unknown>): Promise<SignupResponse> {
    return apiPost<SignupResponse>("/auth/signup", data);
  }

  static async forgotPassword(email: string): Promise<GenericResponse> {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const error = new Error(data.message || `Request failed with status code ${res.status}`);
      (error as any).response = { data };
      throw error;
    }
    return res.json();
  }

  static async verifyOtp(email: string, otp: string): Promise<GenericResponse> {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const error = new Error(data.message || `Request failed with status code ${res.status}`);
      (error as any).response = { data };
      throw error;
    }
    return res.json();
  }

  static async resetPassword(data: Record<string, unknown>): Promise<GenericResponse> {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const error = new Error(data.message || `Request failed with status code ${res.status}`);
      (error as any).response = { data };
      throw error;
    }
    return res.json();
  }

  static async resendOtp(email: string): Promise<GenericResponse> {
    const res = await fetch("/api/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const error = new Error(data.message || `Request failed with status code ${res.status}`);
      (error as any).response = { data };
      throw error;
    }
    return res.json();
  }

  static async verifyEmail(token: string): Promise<GenericResponse> {
    const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const error = new Error(data.message || `Request failed with status code ${res.status}`);
      (error as any).response = { data };
      throw error;
    }
    return res.json();
  }

  static async resendVerification(email: string): Promise<GenericResponse> {
    const res = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const error = new Error(data.message || `Request failed with status code ${res.status}`);
      (error as any).response = { data };
      throw error;
    }
    return res.json();
  }
}
