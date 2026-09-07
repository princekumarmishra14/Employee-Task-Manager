import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config/api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token") || "";
    const backendUrl = `${API_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}`;

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    console.error("[Next.js API Router] Proxying verify-email failed:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
