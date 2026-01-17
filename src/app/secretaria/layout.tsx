"use client";

import "../globals.scss";
import PortalLayout from "@/components/PortalLayout";
import { secretariaPortalNav } from "@/config/portalNavigation";
import { UserRole } from "@/features/auth/auth.enums";

export default function SecretariaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalLayout
      title="Portal da Secretaria"
      subtitle="Gestão de membros e informações cadastrais"
      navItems={secretariaPortalNav}
      allowedRoles={[UserRole.Secretaria, UserRole.Admin]}
    >
      {children}
    </PortalLayout>
  );
}
