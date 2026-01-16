import { NextRequest } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  return proxyRequest("POST", "/createAuditLog", await request.json(), undefined, {
    authorization,
  });
}

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  const limit = request.nextUrl.searchParams.get("limit") ?? "";
  return proxyRequest("GET", "/getAuditLogs", undefined, { limit }, {
    authorization,
  });
}
