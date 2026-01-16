"use client";

import { RoutesEnums } from "@/enums/routesEnums";
import { useAuth } from "@/store";
import { MenuOutlined } from "@ant-design/icons";
import { Button, Drawer, Flex, Layout, Menu, Typography } from "antd";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { MenuContent } from "./MenuContent";
import styles from "./CustomHeader.module.scss";

const { Header } = Layout;
const { Text } = Typography;

export const CustomHeader = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const { user } = useAuth();

  const onRedirect = () => router.push(RoutesEnums.Home);

  const isAuthenticated = useMemo(() => !!user, [user]);

  const navItems = [
    { key: RoutesEnums.Home, label: "Início" },
    { key: `/${RoutesEnums.Gallery}`, label: "Galeria" },
    { key: `/${RoutesEnums.MembershipForm}`, label: "Ficha de Membro" },
    ...(isAuthenticated
      ? [
          { key: `/${RoutesEnums.Management}`, label: "Gerenciamento" },
          { key: `/${RoutesEnums.Profile}`, label: "Perfil" },
        ]
      : []),
    ...(!isAuthenticated
      ? [
          {
            key: "/login",
            label: (
              <span className={styles.loginPill}>
                Entrar
              </span>
            ),
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
              <Text
                strong
                className={`${styles.logoTitle} kairos-logo-title`}
              >
                KAIRÓS
                {/* Decorative underline */}
                <span
                  className={`${styles.logoUnderline} kairos-logo-underline`}
                />
              </Text>
              <Text
                className={`${styles.logoSubtitle} kairos-logo-subtitle`}
              >
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
              theme="dark"
            />
          </div>

          {/* Mobile Menu Button */}
          <Button
            type="text"
            icon={<MenuOutlined />}
            className={styles.mobileButton}
            onClick={() => setDrawerOpen(true)}
          />

          {/* Mobile Drawer */}
          <Drawer
            title="Menu"
            placement="right"
            onClose={() => setDrawerOpen(false)}
            open={drawerOpen}
            size="default"
            style={{ width: 280 }}
          >
            <MenuContent onClose={() => setDrawerOpen(false)} />
          </Drawer>
        </Flex>
      </div>
    </Header>
  );
};
