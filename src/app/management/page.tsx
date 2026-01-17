import { redirect } from "next/navigation";
import { ManagementRoutesEnums } from "@/features/navigation/routes.enums";

export default function ManagementPage() {
  redirect(`/management/${ManagementRoutesEnums.Albums}`);
}
