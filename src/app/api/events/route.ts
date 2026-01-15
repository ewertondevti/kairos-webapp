import { NextRequest } from "next/server";
import { proxyRequest } from "../_utils/proxy";

export async function GET() {
  return proxyRequest("GET", "/getEvents");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return proxyRequest("POST", "/createEvents", body);
  } catch (error: any) {
    return proxyRequest("POST", "/createEvents", {}); // Will return error
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    return proxyRequest("POST", "/deleteEvents", body);
  } catch (error: any) {
    return proxyRequest("POST", "/deleteEvents", {}); // Will return error
  }
}
