import { NextRequest } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

export async function PATCH(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  const body = await request.json();
  return proxyRequest("PATCH", "/setUserRole", body, undefined, {
    authorization,
  });
}
