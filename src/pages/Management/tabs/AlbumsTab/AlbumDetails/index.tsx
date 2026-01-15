"use client";

import { ImagesSkeleton } from "@/components/ImagesSkeleton";
import { LazyImage } from "@/components/LazyImage";
import { useGetImageSize } from "@/hooks/app";
import { useGetAlbumById } from "@/react-query";
import { Col, Empty, Flex, Row } from "antd";
import { useCallback, useMemo } from "react";
import { AutoSizer } from "react-virtualized-auto-sizer";
import { Grid, type CellComponentProps } from "react-window";

type AlbumDetailsProps = {
  albumId?: string;
};

type CellProps = {
  images: Array<{ id?: string; name: string; url: string }>;
  columnCount: number;
};

const CellComponent = ({
  columnIndex,
  rowIndex,
  style,
  images,
  columnCount,
}: CellComponentProps<CellProps>) => {
  const index = rowIndex * columnCount + columnIndex;

  if (index >= images.length) {
    return <div style={style} />;
  }

  const image = images[index];

  return (
    <div style={style}>
      <Flex
        className="relative p-[3px] rounded-[10px] h-full w-full [&>div]:rounded-md [&>div]:w-full [&>div]:h-full"
        key={image.url}
        style={{ height: "100%", width: "100%" }}
      >
        <LazyImage {...image} isLoading={false} />
      </Flex>
    </div>
  );
};

export const AlbumDetails = ({ albumId }: AlbumDetailsProps) => {
  const {
    height: ROW_HEIGHT,
    width: COLUMN_WIDTH,
    columns,
  } = useGetImageSize();

  const { data: album, isLoading } = useGetAlbumById(albumId);

  const columnCount = useMemo(() => {
    if (!album?.images?.length) return columns;
    return Math.min(columns, album.images.length);
  }, [album?.images?.length, columns]);

  const rowCount = useMemo(() => {
    if (!album?.images?.length) return 0;
    return Math.ceil(album.images.length / columnCount);
  }, [album?.images?.length, columnCount]);

  const GridChild = useCallback(
    ({
      height,
      width,
    }: {
      height: number | undefined;
      width: number | undefined;
    }) => {
      if (!height || !width || height === 0 || width === 0) {
        return (
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Empty description="Carregando dimensões..." />
          </div>
        );
      }

      return (
        <Grid
          cellComponent={CellComponent}
          cellProps={{
            images: album!.images,
            columnCount,
          }}
          columnCount={columnCount}
          columnWidth={COLUMN_WIDTH}
          rowCount={rowCount}
          rowHeight={ROW_HEIGHT}
          style={{ height, width }}
        />
      );
    },
    [album, columnCount, COLUMN_WIDTH, rowCount, ROW_HEIGHT]
  );

  if (isLoading) return <ImagesSkeleton />;

  if (!album?.images?.length) return <Empty style={{ marginTop: 50 }} />;

  return (
    <Row style={{ width: "100%", height: "100%" }}>
      <Col span={24}>
        <div
          style={{
            height: "calc(100vh - 300px)",
            width: "100%",
            minHeight: "500px",
          }}
        >
          <AutoSizer ChildComponent={GridChild} />
        </div>
      </Col>
    </Row>
  );
};
