import { SCREEN_VALUES } from "@/utils/app";
import { useWindowSize } from "@uidotdev/usehooks";
import { isDesktop, isMobile, isTablet } from "react-device-detect";

export const useCheckDevice = () => {
  const { width } = useWindowSize();

  return {
    isMobilePortrait: isMobile && width! <= 480,
    isMobileLandscape: isMobile && width! > 480 && width! < 768,
    isTabletPortrait: isTablet && width! >= 768 && width! <= 1024,
    isTabletLandscape: isTablet && width! > 1024 && width! <= 1366,
    isDesktop,
  };
};

export const useGetImageSize = () => {
  const {
    isMobilePortrait,
    isMobileLandscape,
    isTabletPortrait,
    isTabletLandscape,
  } = useCheckDevice();

  if (isMobilePortrait) return SCREEN_VALUES["mobile-portrait"];
  if (isMobileLandscape) return SCREEN_VALUES["mobile-landscape"];
  if (isTabletPortrait) return SCREEN_VALUES["tablet-portrait"];
  if (isTabletLandscape) return SCREEN_VALUES["tablet-landscape"];

  return SCREEN_VALUES.desktop;
};