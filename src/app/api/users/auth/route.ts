import { NextRequest } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

const getAuthorization = (request: NextRequest) =>
  request.headers.get("authorization") || "";

export async function GET(request: NextRequest) {
  const authorization = getAuthorization(request);
  return proxyRequest("GET", "/getAuthUsers", undefined, undefined, {
    authorization,
  });
}
