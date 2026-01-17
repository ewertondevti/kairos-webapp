import { NextRequest } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

const getAuthorization = (request: NextRequest) =>
  request.headers.get("authorization") || "";

export async function DELETE(request: NextRequest) {
  const authorization = getAuthorization(request);
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") ?? "";
  return proxyRequest("DELETE", "/deleteUserDocument", undefined, { id }, {
    authorization,
  });
}
