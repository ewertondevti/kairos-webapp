import { NextRequest } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

const getAuthorization = (request: NextRequest) =>
  request.headers.get("authorization") || "";

export async function GET(request: NextRequest) {
  const authorization = getAuthorization(request);
  return proxyRequest("GET", "/getUsers", undefined, undefined, {
    authorization,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authorization = getAuthorization(request);
    return proxyRequest("POST", "/createUser", body, undefined, {
      authorization,
    });
  } catch (error: any) {
    return proxyRequest("POST", "/createUser", {});
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const authorization = getAuthorization(request);
    return proxyRequest("PATCH", "/updateUserProfile", body, undefined, {
      authorization,
    });
  } catch (error: any) {
    return proxyRequest("PATCH", "/updateUserProfile", {});
  }
}
