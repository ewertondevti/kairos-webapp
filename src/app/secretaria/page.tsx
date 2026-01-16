import { redirect } from "next/navigation";
import { secretariaPortalNav } from "@/config/portalNavigation";

export default function SecretariaPage() {
  redirect(secretariaPortalNav[0]?.href ?? "/");
}
