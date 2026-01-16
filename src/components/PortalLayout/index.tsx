"use client";

import { PortalNavItem } from "@/config/portalNavigation";
import { useAuth } from "@/store";
import { UserRole } from "@/types/user";
import {
  Button,
  Drawer,
  Grid,
  Layout,
  Menu,
  Result,
  Spin,
  Typography,
} from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import styles from "./PortalLayout.module.scss";

const { Title, Text } = Typography;
const { Sider, Content } = Layout;

type PortalLayoutProps = {
  title: string;
  subtitle?: string;
  navItems: PortalNavItem[];
  allowedRoles: UserRole[];
  children: React.ReactNode;
};

const PortalLayout = ({
  title,
  subtitle,
  navItems,
  allowedRoles,
  children,
}: PortalLayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const screens = Grid.useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { user, role, loading } = useAuth();

  const hasAccess = Boolean(role && allowedRoles.includes(role));
  const isMobile = !screens.lg;

  const selectedKey = useMemo(() => {
    if (!pathname) return undefined;
    const activeItem = navItems.find((item) =>
      pathname.startsWith(item.href)
    );
    return activeItem?.key;
  }, [navItems, pathname]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, router, user]);

  const onNavigate = (key: string) => {
    const target = navItems.find((item) => item.key === key);
    if (target) {
      router.push(target.href);
    }
    setDrawerOpen(false);
  };

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.loadingWrap}>
        <Spin size="large" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className={styles.blockedWrap}>
        <Result
          status="403"
          title="Acesso restrito"
          subTitle="Você não possui permissão para acessar este portal."
          extra={
            <Button type="primary" onClick={() => router.push("/")}>
              Voltar ao início
            </Button>
          }
        />
      </div>
    );
  }

  const menu = (
    <Menu
      mode="inline"
      selectedKeys={selectedKey ? [selectedKey] : []}
      onClick={({ key }) => onNavigate(String(key))}
      items={navItems.map((item) => ({
        key: item.key,
        label: item.label,
      }))}
      className={styles.menu}
    />
  );

  return (
    <Layout className={styles.portalLayout}>
      {!isMobile && (
        <Sider width={260} className={styles.sider}>
          <div className={styles.brand}>
            <Text className={styles.brandSubtitle}>Portal</Text>
            <Title level={4} className={styles.brandTitle}>
              {title}
            </Title>
          </div>
          {menu}
        </Sider>
      )}

      <Layout>
        <Content className={styles.content}>
          <header className={styles.header}>
            <div className={styles.headerLeft}>
              {isMobile && (
                <Button
                  type="text"
                  icon={<MenuOutlined />}
                  className={styles.menuButton}
                  onClick={() => setDrawerOpen(true)}
                />
              )}
              <div>
                <Title level={2} className={styles.pageTitle}>
                  {title}
                </Title>
                {subtitle && <Text className={styles.pageSubtitle}>{subtitle}</Text>}
              </div>
            </div>
          </header>

          <section className={styles.page}>{children}</section>
        </Content>
      </Layout>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        placement="left"
        width={280}
        title={title}
      >
        {menu}
      </Drawer>
    </Layout>
  );
};

export default PortalLayout;
