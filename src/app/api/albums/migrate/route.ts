import { NextRequest } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  return proxyRequest("POST", "/migrateAlbumImages", undefined, undefined, {
    authorization,
  });
}
