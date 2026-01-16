import { NextRequest } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const limit = searchParams.get("limit") || undefined;
  const cursor = searchParams.get("cursor") || undefined;

  return proxyRequest("GET", "/getAlbumsPaged", undefined, {
    limit: limit ?? "",
    cursor: cursor ?? "",
  });
}
