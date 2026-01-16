import { NextRequest } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  return proxyRequest("GET", "/getAccessRequests", undefined, undefined, {
    authorization,
  });
}

export async function PATCH(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  const body = await request.json();
  return proxyRequest(
    "PATCH",
    "/updateAccessRequestStatus",
    body,
    undefined,
    {
      authorization,
    }
  );
}
