import { redirect } from "next/navigation";
import { ManagementRoutesEnums } from "@/enums/routesEnums";

export default function ManagementPage() {
  redirect(`/management/${ManagementRoutesEnums.Albums}`);
}
