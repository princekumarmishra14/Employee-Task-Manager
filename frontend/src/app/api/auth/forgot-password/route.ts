import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config/api";

export async function POST(request: Request) {
  console.log("Forgot Password API Hit");
  try {
    const body = await request.json();
    const backendUrl = `${API_BASE_URL}/auth/forgot-password`;
    
    console.log(`[Next.js API Router] Proxying forgot-password to ${backendUrl}...`);
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    console.error("[Next.js API Router] Proxying failed:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
