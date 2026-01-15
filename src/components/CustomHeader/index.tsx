"use client";

import { RoutesEnums } from "@/enums/routesEnums";
import { useAuth } from "@/store";
import { MenuOutlined } from "@ant-design/icons";
import { Button, Drawer, Flex, Layout, Menu, Typography } from "antd";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { MenuContent } from "./MenuContent";

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
      ? [{ key: `/${RoutesEnums.Management}`, label: "Gerenciamento" }]
      : []),
    ...(!isAuthenticated
      ? [
          {
            key: "/login",
            label: (
              <span className="px-3 py-1 rounded-full border border-primary/40 text-primary bg-primary/10 transition-colors hover:bg-primary/20">
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
    <Header className="sticky top-0 z-[1000] relative">
      {/* Elegant green gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-50" />
      {/* Green accent bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="max-w-7xl mx-auto h-full px-4 md:px-6 lg:px-8 relative z-10">
        <Flex align="center" className="h-full gap-2 md:gap-4">
          {/* Logo */}
          <Flex
            align="center"
            gap={12}
            onClick={onRedirect}
            className="logo-container cursor-pointer flex-shrink-0"
          >
            <div className="relative w-14 h-14">
              {/* Outer black ring with green accent */}
              <div className="absolute inset-0 rounded-full bg-black border-2 border-black shadow-[0_0_0_1px_rgba(26,93,46,0.3)]" />
              {/* Green gradient ring */}
              <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-primary via-[#2d7a47] to-[#0f3a1c] border border-primary/50 shadow-inner kairos-logo-ring" />
              {/* Inner dark circle with logo */}
              <div className="absolute inset-[6px] rounded-full bg-gradient-to-br from-[#0a0a0a] to-black flex items-center justify-center border border-primary/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] transition-all duration-300">
                <Image
                  src="/kairos-logo.png"
                  height={32}
                  width={32}
                  alt="Kairós Logo"
                  priority
                  className="brightness-0 invert transition-transform duration-300"
                />
              </div>
            </div>
            <Flex
              vertical
              gap={0}
              align="center"
              className="flex-shrink-0 relative"
            >
              <Text
                strong
                className="whitespace-nowrap leading-none relative kairos-logo-title"
                style={{
                  fontSize: 26,
                  letterSpacing: "0.1em",
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  fontWeight: 700,
                  lineHeight: 1.1,
                  position: "relative",
                }}
              >
                KAIRÓS
                {/* Decorative underline */}
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 kairos-logo-underline"
                  style={{
                    transform: "translateY(2px)",
                  }}
                />
              </Text>
              <Text
                className="whitespace-nowrap leading-none text-center kairos-logo-subtitle"
                style={{
                  fontSize: 9,
                  letterSpacing: "0.2em",
                  fontFamily: "var(--font-poppins), sans-serif",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  marginTop: 4,
                  position: "relative",
                }}
              >
                PORTUGAL
              </Text>
            </Flex>
          </Flex>

          {/* Desktop Navigation */}
          <div className="hidden md:block flex-1 min-w-0">
            <Menu
              mode="horizontal"
              selectedKeys={selectedKeys}
              onClick={handleMenuClick}
              items={navItems}
              className="border-none bg-transparent"
              theme="dark"
              style={{
                lineHeight: "80px",
                backgroundColor: "transparent",
              }}
            />
          </div>

          {/* Mobile Menu Button */}
          <Button
            type="text"
            icon={<MenuOutlined />}
            className="md:hidden text-white"
            style={{ fontSize: 20 }}
            onClick={() => setDrawerOpen(true)}
          />

          {/* Mobile Drawer */}
          <Drawer
            title="Menu"
            placement="right"
            onClose={() => setDrawerOpen(false)}
            open={drawerOpen}
            width={280}
          >
            <MenuContent onClose={() => setDrawerOpen(false)} />
          </Drawer>
        </Flex>
      </div>
    </Header>
  );
};
