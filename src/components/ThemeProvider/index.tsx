'use client';

import { ConfigProvider, theme } from "antd";
import { ThemeConfig } from "antd/es/config-provider/context";
import BR from "antd/es/locale/pt_BR";
import { FC, ReactNode } from "react";
import { Colors } from "./colors.config";

const { defaultAlgorithm } = theme;

type Props = {
  children: ReactNode;
};

export const ThemeProvider: FC<Props> = ({ children }) => {
  const themeConfig: ThemeConfig = {
    algorithm: defaultAlgorithm,
    token: {
      colorPrimary: Colors.ColorPrimary,
      colorText: Colors.ColorText,
      colorBgBase: Colors.ColorBg,
      colorTextSecondary: Colors.ColorTextSecondary,
      colorBorder: Colors.ColorBorder,
      fontFamily: 'var(--font-poppins), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontFamilyCode: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
      fontSize: 16,
      fontSizeSM: 14,
      fontSizeLG: 18,
      fontSizeXL: 20,
      borderRadius: 8,
      borderRadiusLG: 12,
      lineHeight: 1.6,
    },
    components: {
      Layout: {
        headerBg: Colors.ColorBlackPure,
        headerHeight: 80,
        headerPadding: "0 24px",
        bodyBg: Colors.ColorBg,
        headerColor: Colors.ColorTextOnDark,
      },
      Card: {
        colorBgContainer: Colors.ColorWhite,
        borderRadius: 12,
        borderRadiusLG: 16,
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        boxShadowTertiary: "0 4px 16px rgba(0,0,0,0.1)",
        padding: 24,
        paddingLG: 40,
        headerBg: Colors.ColorWhite,
        actionsBg: Colors.ColorWhiteSoft,
      },
      Typography: {
        colorTextHeading: Colors.ColorText,
        colorText: Colors.ColorText,
        colorTextSecondary: Colors.ColorTextSecondary,
        fontSizeHeading1: 56,
        fontSizeHeading2: 42,
        fontSizeHeading3: 32,
        fontSizeHeading4: 26,
        fontSizeHeading5: 20,
        fontSizeHeading6: 18,
        fontFamilyCode: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
        fontWeightStrong: 600,
        lineHeightHeading1: 1.2,
        lineHeightHeading2: 1.3,
        lineHeightHeading3: 1.4,
        lineHeightHeading4: 1.5,
        lineHeightHeading5: 1.6,
      },
      Button: {
        borderRadius: 8,
        controlHeight: 48,
        controlHeightLG: 56,
        controlHeightSM: 40,
        fontWeight: 500,
        primaryColor: Colors.ColorTextOnGreen,
        primaryShadow: "0 2px 8px rgba(26, 93, 46, 0.2)",
        defaultShadow: "0 2px 4px rgba(0,0,0,0.1)",
        paddingInline: 24,
        paddingInlineLG: 40,
        paddingInlineSM: 16,
        fontSize: 16,
        fontSizeLG: 17,
      },
      Drawer: {
        colorBgElevated: Colors.ColorWhite,
        colorText: Colors.ColorText,
      },
      Modal: {
        colorTextHeading: Colors.ColorText,
        borderRadius: 16,
      },
      Menu: {
        colorText: Colors.ColorTextOnDark,
        colorItemText: Colors.ColorTextOnDark,
        colorItemTextHover: Colors.ColorTextOnDark,
        colorItemBgHover: "rgba(26, 93, 46, 0.2)",
        colorItemTextSelected: Colors.ColorTextOnDark,
        colorItemBgSelected: Colors.ColorPrimary,
        itemMarginInline: 12,
        itemBorderRadius: 8,
        itemPaddingInline: 20,
        horizontalItemSelectedBg: Colors.ColorPrimary,
        horizontalItemSelectedColor: Colors.ColorTextOnDark,
        horizontalItemHoverBg: "rgba(26, 93, 46, 0.2)",
        horizontalItemHoverColor: Colors.ColorTextOnDark,
        horizontalItemBorderRadius: 8,
        itemActiveBg: "rgba(26, 93, 46, 0.15)",
        fontSize: 15,
        fontWeightStrong: 500,
      },
      Input: {
        borderRadius: 8,
        colorBorder: Colors.ColorBorder,
        colorBorderHover: Colors.ColorPrimary,
      },
      Select: {
        borderRadius: 8,
        colorBorder: Colors.ColorBorder,
        colorBorderHover: Colors.ColorPrimary,
      },
      Image: {
        borderRadius: 8,
      },
      Space: {
        size: 16,
        sizeSmall: 8,
        sizeLarge: 24,
      },
      Tabs: {
        itemColor: Colors.ColorTextSecondary,
        itemSelectedColor: Colors.ColorPrimary,
        itemHoverColor: Colors.ColorPrimary,
        itemActiveColor: Colors.ColorPrimary,
        inkBarColor: Colors.ColorPrimary,
        cardBg: Colors.ColorWhite,
        horizontalMargin: "0 0 16px 0",
      },
      Empty: {
        colorTextDisabled: Colors.ColorTextTertiary,
      },
      Spin: {
        colorPrimary: Colors.ColorPrimary,
      },
    },
  };

  return (
    <ConfigProvider theme={themeConfig} locale={BR}>
      {children}
    </ConfigProvider>
  );
};
