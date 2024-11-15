import { LIST_ITEM_VALUES, SCREEN_VALUES } from "@/utils/app";
import { useWindowSize } from "@uidotdev/usehooks";
import { isDesktop } from "react-device-detect";

export const useCheckDevice = () => {
  const { width } = useWindowSize();

  return {
    isMobilePortrait: width! <= 480,
    isMobileLandscape: width! > 480 && width! < 768,
    isTabletPortrait: width! >= 768 && width! <= 1024,
    isTabletLandscape: width! > 1024 && width! <= 1366,
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

export const useGetListItemSize = () => {
  const {
    isMobilePortrait,
    isMobileLandscape,
    isTabletPortrait,
    isTabletLandscape,
  } = useCheckDevice();

  if (isMobilePortrait) return LIST_ITEM_VALUES["mobile-portrait"];
  if (isMobileLandscape) return LIST_ITEM_VALUES["mobile-landscape"];
  if (isTabletPortrait) return LIST_ITEM_VALUES["tablet-portrait"];
  if (isTabletLandscape) return LIST_ITEM_VALUES["tablet-landscape"];

  return LIST_ITEM_VALUES.desktop;
};
