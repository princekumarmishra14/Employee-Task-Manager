/**
 * src/app/openapi.json/route.ts
 * Serves the OpenAPI JSON spec by reading it dynamically from the disk at runtime.
 * Bypasses static bundler parsing to prevent Node.js OOM crashes during build.
 */

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "docs/openapi.json");
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "OpenAPI specification file not found." }, { status: 404 });
    }
    const fileContent = fs.readFileSync(filePath, "utf8");
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Failed to read OpenAPI specification:", error);
    return NextResponse.json({ error: "Internal server error reading specification." }, { status: 500 });
  }
}
