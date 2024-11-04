import { ConfigProvider, theme } from "antd";
import { ThemeConfig } from "antd/es/config-provider/context";
import BR from "antd/es/locale/pt_BR";
import { FC, ReactNode } from "react";
import { Colors } from "./colors.config";

const { darkAlgorithm } = theme;

type Props = {
  children: ReactNode;
};

export const ThemeProvider: FC<Props> = ({ children }) => {
  const theme: ThemeConfig = {
    algorithm: darkAlgorithm,
    token: {
      colorPrimary: Colors.ColorPrimary,
      colorText: Colors.ColorPrimaryText,
    },
    components: {
      Layout: {
        headerBg: Colors.ColorHeader,
        bodyBg: Colors.ColorContent,
      },
      Card: {
        colorBgContainer: Colors.ColorContent,
        colorBorderSecondary: Colors.ColorHeader,
      },
    },
  };

  return (
    <ConfigProvider theme={theme} locale={BR}>
      {children}
    </ConfigProvider>
  );
};
