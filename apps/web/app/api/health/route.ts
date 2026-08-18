import { NextResponse } from "next/server";
import { createHealthResponse } from "../../../src/health";

export function GET() {
  return NextResponse.json(createHealthResponse());
}
