import { NextRequest } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return proxyRequest("POST", "/requestAccess", body);
  } catch (error: any) {
    return proxyRequest("POST", "/requestAccess", {});
  }
}
