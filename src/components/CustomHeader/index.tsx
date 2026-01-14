"use client";

import { RoutesEnums } from "@/enums/routesEnums";
import { useAuth } from "@/store";
import { faBars, faLock, faLockOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Flex, Popover, PopoverProps } from "antd";
import { Header } from "antd/es/layout/layout";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Colors } from "../ThemeProvider/colors.config";
import { LoginContent } from "./LoginContent";
import { MenuContent } from "./MenuContent";

export const CustomHeader = () => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [loginIsOpen, setLoginIsOpen] = useState(false);

  const router = useRouter();

  const { user } = useAuth();

  const onLoginOpenChange: PopoverProps["onOpenChange"] = (bool) =>
    setLoginIsOpen(bool);

  const onMenuOpenChange: PopoverProps["onOpenChange"] = (bool) =>
    setMenuIsOpen(bool);

  const onCloseLogin = () => setLoginIsOpen(false);
  const onCloseMenu = () => setMenuIsOpen(false);

  const onRedirect = () => router.push(RoutesEnums.Home);

  const isAuthenticated = useMemo(() => !!user, [user]);

  return (
    <Header className="border-b border-white/12">
      <Flex align="center" justify="space-between" className="h-full">
        <div onClick={onRedirect} className="cursor-pointer">
          <Image
            src="/kairos-logo.png"
            height={50}
            width={50}
            alt="Kairós Logo"
            priority
          />
        </div>

        <Flex gap={16} align="center">
          <Popover
            trigger="click"
            content={<LoginContent onClose={onCloseLogin} />}
            onOpenChange={onLoginOpenChange}
            open={loginIsOpen}
            destroyOnHidden
          >
            <Button
              type="primary"
              size="small"
              icon={
                <FontAwesomeIcon icon={isAuthenticated ? faLockOpen : faLock} />
              }
              className="text-xs leading-normal"
              disabled={isAuthenticated}
            >
              {isAuthenticated ? "Logado" : "Login"}
            </Button>
          </Popover>

          <Popover
            trigger="click"
            content={<MenuContent onClose={onCloseMenu} />}
            title="Menu"
            overlayStyle={{ maxWidth: 250 }}
            open={menuIsOpen}
            onOpenChange={onMenuOpenChange}
          >
            <Button
              type="text"
              icon={
                <FontAwesomeIcon icon={faBars} color={Colors.ColorPrimary} />
              }
            />
          </Popover>
        </Flex>
      </Flex>
    </Header>
  );
};
