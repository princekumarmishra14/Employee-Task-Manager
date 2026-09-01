import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"}/auth/reset-password`;
    
    console.log(`[Next.js API Router] Proxying reset-password to ${backendUrl}...`);
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
