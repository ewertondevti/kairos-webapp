export type PortalNavItem = {
  key: string;
  label: string;
  description?: string;
  href: string;
};

export const adminPortalNav: PortalNavItem[] = [
  {
    key: "admin-users",
    label: "Gestão de utilizadores",
    description: "Controle de acessos, perfis e membros com login",
    href: "/admin/users",
  },
  {
    key: "admin-audit",
    label: "Auditoria",
    description: "Histórico de alterações e acessos",
    href: "/admin/audit",
  },
];

export const secretariaPortalNav: PortalNavItem[] = [
  {
    key: "secretaria-members",
    label: "Secretaria",
    description: "Lista de membros e atualizações cadastrais",
    href: "/secretaria/membros",
  },
];
