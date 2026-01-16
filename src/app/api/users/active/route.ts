import { proxyRequest } from "@/app/api/_utils/proxy";
import { NextRequest } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const authorization = request.headers.get("authorization") || "";
    return proxyRequest("PATCH", "/setUserActive", body, undefined, {
      authorization,
    });
  } catch (error: any) {
    return proxyRequest("PATCH", "/setUserActive", {});
  }
}
