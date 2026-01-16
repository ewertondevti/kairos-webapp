import { NextRequest } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imagePath = searchParams.get("imagePath");
  const authorization = request.headers.get("authorization") || "";

  if (!imagePath) {
    return proxyRequest("DELETE", "/deleteUploadedImage", undefined, { imagePath: "" }); // Will return error from proxy
  }

  return proxyRequest("DELETE", "/deleteUploadedImage", undefined, { imagePath }, {
    authorization,
  });
}
