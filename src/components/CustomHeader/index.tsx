import { useAuth } from "@/store";
import { faBars, faLock, faUnlock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Flex, Popover, PopoverProps } from "antd";
import { Header } from "antd/es/layout/layout";
import { useMemo, useState } from "react";
import { Colors } from "../ThemeProvider/colors.config";
import { LoginContent } from "./LoginContent";
import { MenuContent } from "./MenuContent";
import AppLogo from "/kairos-logo.png";

export const CustomHeader = () => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [loginIsOpen, setLoginIsOpen] = useState(false);

  const { user } = useAuth();

  const onLoginOpenChange: PopoverProps["onOpenChange"] = (bool) =>
    setLoginIsOpen(bool);

  const onMenuOpenChange: PopoverProps["onOpenChange"] = (bool) =>
    setMenuIsOpen(bool);

  const onCloseLogin = () => setLoginIsOpen(false);
  const onCloseMenu = () => setMenuIsOpen(false);

  const isAuthenticated = useMemo(() => !!user, [user]);

  return (
    <Header className="layout__app-header">
      <Flex align="center" justify="space-between" style={{ height: "100%" }}>
        <img src={AppLogo} height={50} width={50} />

        <Flex gap={16} align="center">
          <Popover
            trigger="click"
            content={<LoginContent onClose={onCloseLogin} />}
            onOpenChange={onLoginOpenChange}
            open={loginIsOpen}
            destroyTooltipOnHide
          >
            <Button
              type="primary"
              size="small"
              icon={
                <FontAwesomeIcon icon={isAuthenticated ? faUnlock : faLock} />
              }
              className="button__small"
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
