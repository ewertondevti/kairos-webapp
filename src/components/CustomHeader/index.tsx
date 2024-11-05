import { useAuth } from "@/store";
import { faBars, faLock, faUnlock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Flex, Popover } from "antd";
import { Header } from "antd/es/layout/layout";
import { useMemo } from "react";
import { Colors } from "../ThemeProvider/colors.config";
import { LoginContent } from "./LoginContent";
import { MenuContent } from "./MenuContent";
import AppLogo from "/kairos-logo.png";

export const CustomHeader = () => {
  const { user } = useAuth();

  const isAuthenticated = useMemo(() => !!user, [user]);

  return (
    <Header className="layout__app-header">
      <Flex align="center" justify="space-between" style={{ height: "100%" }}>
        <img src={AppLogo} height={50} width={50} />

        <Flex gap={16} align="center">
          <Popover
            trigger="click"
            content={<LoginContent />}
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
            content={<MenuContent />}
            title="Menu"
            overlayStyle={{ maxWidth: 250 }}
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
