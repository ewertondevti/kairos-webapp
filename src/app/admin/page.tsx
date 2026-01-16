import { redirect } from "next/navigation";
import { adminPortalNav } from "@/config/portalNavigation";

export default function AdminPage() {
  redirect(adminPortalNav[0]?.href ?? "/");
}
