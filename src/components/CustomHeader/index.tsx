"use client";

import { UserRole } from "@/features/auth/auth.enums";
import { RoutesEnums } from "@/features/navigation/routes.enums";
import { firebaseAuth } from "@/firebase";
import { useAuth } from "@/store";
import {
  DownOutlined,
  LogoutOutlined,
  MenuOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Drawer,
  Dropdown,
  Flex,
  Layout,
  Menu,
  Typography,
} from "antd";
import { signOut } from "firebase/auth";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { KeyboardEvent, useMemo, useState } from "react";
import styles from "./CustomHeader.module.scss";
import { MenuContent } from "./MenuContent";

const { Header } = Layout;
const { Text } = Typography;

export const CustomHeader = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const { user, role, profile } = useAuth();

  const onRedirect = () => router.push(RoutesEnums.Home);

  const isAuthenticated = useMemo(() => !!user, [user]);

  const displayName = useMemo(() => {
    return profile?.fullname || user?.displayName || user?.email || "Conta";
  }, [profile?.fullname, user?.displayName, user?.email]);

  const initials = useMemo(() => {
    const source = displayName.trim();
    if (!source) {
      return "U";
    }

    if (source.includes("@")) {
      return source.slice(0, 1).toUpperCase();
    }

    const parts = source.split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
    return `${first}${last}`.toUpperCase() || "U";
  }, [displayName]);

  const canAccessSecretariaPortal =
    role === UserRole.Admin || role === UserRole.Secretaria;
  const canAccessAdminPortal = role === UserRole.Admin;
  const canAccessMediaPortal =
    role === UserRole.Admin || role === UserRole.Midia;

  const navItems = [
    { key: RoutesEnums.Home, label: "Início" },
    { key: `/${RoutesEnums.Gallery}`, label: "Galeria" },
    { key: `/${RoutesEnums.MembershipForm}`, label: "Ficha de Membro" },
    ...(isAuthenticated
      ? [
          ...(canAccessSecretariaPortal
            ? [{ key: "/secretaria", label: "Secretaria" }]
            : []),
          ...(canAccessMediaPortal
            ? [{ key: "/midia", label: "Portal de Mídia" }]
            : []),
          ...(canAccessAdminPortal
            ? [{ key: "/admin", label: "Portal Admin" }]
            : []),
        ]
      : []),
    ...(!isAuthenticated
      ? [
          {
            key: "/login",
            label: <span className={styles.loginPill}>Entrar</span>,
          },
        ]
      : []),
  ];

  const selectedKeys = useMemo(() => {
    const currentPath =
      pathname === RoutesEnums.Home ? RoutesEnums.Home : pathname;
    return currentPath ? [currentPath] : [];
  }, [pathname]);

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
  };

  const handleLogoKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onRedirect();
    }
  };

  const onLogout = async () => {
    await signOut(firebaseAuth);
    router.push(RoutesEnums.Home);
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Meu perfil",
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Sair",
      danger: true,
    },
  ];

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === "profile") {
      router.push(`/${RoutesEnums.Profile}`);
      return;
    }

    if (key === "logout") {
      void onLogout();
    }
  };

  return (
    <Header className={styles.header}>
      {/* Elegant green gradient overlay */}
      <div className={styles.overlay} />
      {/* Green accent bar at bottom */}
      <div className={styles.accentBar} />
      <div className={styles.inner}>
        <Flex align="center" className={styles.headerFlex}>
          {/* Logo */}
          <Flex
            align="center"
            gap={12}
            onClick={onRedirect}
            onKeyDown={handleLogoKeyDown}
            role="button"
            tabIndex={0}
            aria-label="Voltar para a página inicial"
            className={`${styles.logoContainer} logo-container`}
          >
            <div className={styles.logoCircle}>
              {/* Outer black ring with green accent */}
              <div className={styles.outerRing} />
              {/* Green gradient ring */}
              <div className={`${styles.greenRing} kairos-logo-ring`} />
              {/* Inner dark circle with logo */}
              <div className={styles.innerRing}>
                <Image
                  src="/kairos-logo.png"
                  height={32}
                  width={32}
                  alt="Kairós Logo"
                  priority
                  className={styles.logoImage}
                />
              </div>
            </div>
            <Flex
              vertical
              gap={0}
              align="center"
              className={styles.logoTextWrap}
            >
              <Text strong className={`${styles.logoTitle} kairos-logo-title`}>
                KAIRÓS
                {/* Decorative underline */}
                <span
                  className={`${styles.logoUnderline} kairos-logo-underline`}
                />
              </Text>
              <Text className={`${styles.logoSubtitle} kairos-logo-subtitle`}>
                PORTUGAL
              </Text>
            </Flex>
          </Flex>

          {/* Desktop Navigation */}
          <div className={styles.navDesktop}>
            <Menu
              mode="horizontal"
              selectedKeys={selectedKeys}
              onClick={handleMenuClick}
              items={navItems}
              className={styles.menu}
            />
          </div>

          {isAuthenticated && (
            <div className={styles.userActions}>
              <Dropdown
                trigger={["click"]}
                menu={{
                  items: userMenuItems,
                  onClick: handleUserMenuClick,
                  className: styles.userMenu,
                }}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  className={styles.userButton}
                  aria-label="Abrir menu do usuário"
                >
                  <Avatar size={32} className={styles.userAvatar}>
                    {initials}
                  </Avatar>
                  <span className={styles.userName}>{displayName}</span>
                  <DownOutlined className={styles.userChevron} />
                </Button>
              </Dropdown>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            type="text"
            icon={<MenuOutlined />}
            className={styles.mobileButton}
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menu"
          />

          {/* Mobile Drawer */}
          <Drawer
            title="Menu"
            placement="right"
            onClose={() => setDrawerOpen(false)}
            open={drawerOpen}
            size={280}
          >
            <MenuContent onClose={() => setDrawerOpen(false)} />
          </Drawer>
        </Flex>
      </div>
    </Header>
  );
};
