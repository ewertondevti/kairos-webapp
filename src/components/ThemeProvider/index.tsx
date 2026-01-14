'use client';

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
      fontFamily: '"Nunito", sans-serif',
      fontSize: 14,
      fontSizeSM: 14,
      fontSizeLG: 16,
      fontSizeXL: 18,
    },
    components: {
      Layout: {
        headerBg: "linear-gradient(to top, #000000, #002c00)",
      },
      Card: {
        colorBgContainer: Colors.ColorContent,
      },
      Typography: {
        colorTextHeading: Colors.ColorPrimary,
        fontSizeHeading1: 36,
        fontSizeHeading2: 32,
        fontSizeHeading3: 28,
        fontSizeHeading4: 24,
        fontSizeHeading5: 20,
        fontSizeSM: 14,
        fontSizeLG: 16,
        fontSizeXL: 18,
      },
      Drawer: {
        colorIcon: Colors.ColorPrimary,
        colorText: Colors.ColorPrimary,
        colorSplit: Colors.ColorPrimary,
      },
      Modal: {
        colorTextHeading: Colors.ColorPrimary,
      },
      Button: {
        colorLink: Colors.ColorPrimary,
      },
    },
  };

  return (
    <ConfigProvider theme={theme} locale={BR}>
      {children}
    </ConfigProvider>
  );
};
