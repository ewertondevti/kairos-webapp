"use client";

import "../globals.scss";
import PortalLayout from "@/components/PortalLayout";
import { adminPortalNav } from "@/config/portalNavigation";
import { UserRole } from "@/features/auth/auth.enums";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalLayout
      title="Portal Admin"
      subtitle="Gestão de utilizadores e permissões"
      navItems={adminPortalNav}
      allowedRoles={[UserRole.Admin]}
    >
      {children}
    </PortalLayout>
  );
}
