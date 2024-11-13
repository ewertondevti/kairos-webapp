import { LazyImage } from "@/components/LazyImage";
import { useGetImageSize } from "@/hooks/app";
import { useGetAlbums } from "@/react-query";
import { Col, Flex, Row } from "antd";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeGrid } from "react-window";

export const AlbumDetails = () => {
  const { id } = useParams();

  const { height: ROW_HEIGHT, width: COLUMN_WIDTH } = useGetImageSize();

  const { data: albums, isLoading } = useGetAlbums();

  const album = useMemo(() => albums?.find((a) => a.id === id), [albums])!;

  return (
    <Row style={{ width: "100%" }}>
      <Col span={24}>
        <Flex className="management__image-container">
          <AutoSizer>
            {({ height, width }) => {
              const columnCount = Math.max(1, Math.floor(width / COLUMN_WIDTH));

              return (
                <FixedSizeGrid
                  height={height}
                  columnCount={columnCount}
                  columnWidth={COLUMN_WIDTH}
                  rowCount={Math.ceil(album.images.length / columnCount)}
                  rowHeight={ROW_HEIGHT}
                  width={width}
                >
                  {({ columnIndex, rowIndex, style }) => {
                    const index =
                      rowIndex *
                        Math.floor(Number(style.width) / COLUMN_WIDTH) +
                      columnIndex;

                    if (index >= album.images.length) return null;

                    return (
                      <Flex style={style} className="management__image-content">
                        <LazyImage
                          {...album.images[index]}
                          key={index}
                          isLoading={isLoading}
                        />
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
