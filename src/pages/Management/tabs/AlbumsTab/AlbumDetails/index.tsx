import { LazyImage } from "@/components/LazyImage";
import { useGetImageSize } from "@/hooks/app";
import { useGetAlbumById } from "@/react-query";
import { Col, Empty, Flex, Row, Skeleton } from "antd";
import { useParams } from "react-router-dom";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeGrid } from "react-window";

export const AlbumDetails = () => {
  const { id } = useParams();

  const {
    height: ROW_HEIGHT,
    width: COLUMN_WIDTH,
    columns,
  } = useGetImageSize();

  const { data: album, isLoading } = useGetAlbumById(id);

  if (!album?.images?.length) return <Empty style={{ marginTop: 50 }} />;

  if (isLoading) {
    return (
      <Flex justify="center" style={{ minWidth: "50dvw" }}>
        <Skeleton.Image active className="image-skeleton" />
        <Skeleton.Image active className="image-skeleton" />
        <Skeleton.Image active className="image-skeleton" />
        <Skeleton.Image active className="image-skeleton" />
      </Flex>
    );
  }

  return (
    <Row className="width-100perc height-100perc">
      <Col span={24}>
        <Flex className="management__image-container--auto-sizer">
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
                        className="management__image-content"
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
