import { CustomImage } from "@/components/CustomImage";
import { useGetImages } from "@/react-query";
import { useAppState } from "@/store";
import { ImageResult } from "@/types/store";
import { Col, Flex, Row, Skeleton } from "antd";
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
      console.log(count());

      setImages((state) => data.slice(0, state.length + count()));
    }

    return () => {
      setImages([]);
    };
  }, [data, count]);

  const getMoreImages = () =>
    data && setImages((state) => data.slice(0, state.length + count()));

  return (
    <InfiniteScroll
      dataLength={images.length}
      next={getMoreImages}
      hasMore={false}
      loader={
        <Flex gap={8} justify="center" align="center" style={{ padding: 10 }}>
          <Skeleton.Image active />
          <Skeleton.Image active />
          <Skeleton.Image active />
          <Skeleton.Image active />
        </Flex>
      }
      scrollableTarget="scrollableDiv"
    >
      <Flex gap={8} justify="center" className="gallery__image-container">
        <Row className="gallery__image-container--photos">
          {data?.map((image) => (
            <Col key={image.id}>
              <CustomImage {...image} key={image.id} isLoading={isLoading} />
            </Col>
          ))}
        </Row>
      </Flex>
    </InfiniteScroll>
  );
};
