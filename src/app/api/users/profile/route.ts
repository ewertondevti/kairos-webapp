import { NextRequest } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  return proxyRequest("GET", "/getUserProfile", undefined, undefined, {
    authorization,
  });
}
