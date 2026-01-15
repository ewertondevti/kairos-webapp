declare module "react-window" {
  import * as React from "react";

  export type ListChildComponentProps = {
    index: number;
    style: React.CSSProperties;
  };

  export type FixedSizeListProps = {
    height: number;
    width: number | string;
    itemCount: number;
    itemSize: number;
    className?: string;
    style?: React.CSSProperties;
    children: React.ComponentType<ListChildComponentProps>;
  };

  export const FixedSizeList: React.ComponentType<FixedSizeListProps>;
}
