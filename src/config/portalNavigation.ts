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

export const mediaPortalNav: PortalNavItem[] = [
  {
    key: "media-albums",
    label: "Álbuns",
    description: "Crie, edite e organize álbuns de mídia",
    href: "/midia/albums",
  },
  {
    key: "media-images",
    label: "Imagens",
    description: "Gerencie imagens e desassociações",
    href: "/midia/images",
  },
  {
    key: "media-events",
    label: "Eventos",
    description: "Gerencie os próximos eventos",
    href: "/midia/events",
  },
];
