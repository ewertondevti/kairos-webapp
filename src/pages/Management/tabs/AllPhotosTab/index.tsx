import { CustomImage } from "@/components/CustomImage";
import { useGetImages } from "@/react-query";
import { useAppState } from "@/store";
import { ImageResult } from "@/types/store";
import { Col, Empty, Flex, Row, Skeleton } from "antd";
import { useCallback, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

const viewDefault = 30;
const viewSmall = 50;
const viewLarge = 10;

export const AllPhotosTab = () => {
  const [images, setImages] = useState<ImageResult[]>([]);

  const { data, isLoading } = useGetImages();

  const { view } = useAppState();

  const count = useCallback(() => {
    switch (view) {
      case "small":
        return viewSmall;
      case "large":
        return viewLarge;

      default:
        return viewDefault;
    }
  }, [view]);

  useEffect(() => {
    if (data) {
      setImages((state) => data.slice(0, state.length + count()));
    }

    return () => {
      setImages([]);
    };
  }, [data, count]);

  const getMoreImages = () =>
    setImages(data!.slice(0, images.length + count()));

  if (!images.length) return <Empty style={{ marginTop: 50 }} />;

  return (
    <div
      id="scrollableDiv"
      className="events__container"
      style={{
        height: "100%",
        overflow: "auto",
      }}
    >
      <InfiniteScroll
        dataLength={images.length}
        next={getMoreImages}
        hasMore={images.length < (data?.length ?? 0) && !isLoading}
        loader={
          <Flex gap={8} justify="center" align="center" style={{ padding: 10 }}>
            <Skeleton.Input active block />
          </Flex>
        }
        scrollableTarget="scrollableDiv"
      >
        <Flex gap={8} justify="center" className="management__image-container">
          <Row className="management__image-container--photos">
            {images?.map((image) => (
              <Col key={image.id}>
                <CustomImage {...image} key={image.id} isLoading={isLoading} />
              </Col>
            ))}
          </Row>
        </Flex>
      </InfiniteScroll>
    </div>
  );
};