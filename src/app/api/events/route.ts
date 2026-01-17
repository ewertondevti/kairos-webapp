import { NextRequest } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  return proxyRequest("GET", "/getEvents", undefined, undefined, {
    authorization,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authorization = request.headers.get("authorization") || "";
    return proxyRequest("POST", "/createEvents", body, undefined, {
      authorization,
    });
  } catch (error: any) {
    return proxyRequest("POST", "/createEvents", {}); // Will return error
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const authorization = request.headers.get("authorization") || "";
    return proxyRequest("POST", "/deleteEvents", body, undefined, {
      authorization,
    });
  } catch (error: any) {
    return proxyRequest("POST", "/deleteEvents", {}); // Will return error
  }
}
