"use client";

import { ImagesSkeleton } from "@/components/ImagesSkeleton";
import { LazyImage } from "@/components/LazyImage";
import { useGetImageSize } from "@/hooks/app";
import { useGetAlbumById } from "@/react-query";
import { Col, Empty, Flex, Row } from "antd";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeGrid } from "react-window";

type AlbumDetailsProps = {
  albumId?: string;
};

export const AlbumDetails = ({ albumId }: AlbumDetailsProps) => {
  const {
    height: ROW_HEIGHT,
    width: COLUMN_WIDTH,
    columns,
  } = useGetImageSize();

  const { data: album, isLoading } = useGetAlbumById(albumId);

  if (isLoading) return <ImagesSkeleton />;

  if (!album?.images?.length) return <Empty style={{ marginTop: 50 }} />;

  return (
    <Row className="w-full h-full">
      <Col span={24}>
        <Flex className="h-full [&>div>div]:flex [&>div>div]:justify-center [&>div>div>div]:absolute">
          <AutoSizer>
            {({ height, width }) => {
              const columnCount = Math.min(columns, album.images.length);

              return (
                <FixedSizeGrid
                  height={height}
                  columnCount={columnCount}
                  columnWidth={COLUMN_WIDTH}
                  rowCount={Math.ceil(album.images!.length / columnCount)}
                  rowHeight={ROW_HEIGHT}
                  width={width}
                >
                  {({ columnIndex, rowIndex, style }) => {
                    const index = rowIndex * columnCount + columnIndex;

                    if (index >= album.images!.length) return null;

                    const image = album.images![index];

                    return (
                      <Flex
                        style={style}
                        className="relative p-[3px] rounded-[10px] h-full w-full [&>div]:rounded-md [&>div]:w-full [&>div]:h-full"
                        key={image.url}
                      >
                        <LazyImage {...image} isLoading={isLoading} />
                      </Flex>
                    );
                  }}
                </FixedSizeGrid>
              );
            }}
          </AutoSizer>
        </Flex>
      </Col>
    </Row>
  );
};
