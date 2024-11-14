import { useGetPresentations } from "@/react-query";
import { Carousel, Col, Flex, Image } from "antd";

export const PresentationSlider = () => {
  const { data: images } = useGetPresentations();

  if (!images?.length) return null;

  return (
    <Col span={24} className="home__content-presentation">
      <Carousel
        className="home__content-carousel"
        infinite
        arrows
        autoplay
        speed={2000}
        autoplaySpeed={5000}
        adaptiveHeight
      >
        {images?.map(({ id, url }) => (
          <div key={id}>
            <Flex justify="center">
              <Image
                src={url}
                className="home__content-image"
                preview={false}
              />
            </Flex>
          </div>
        ))}
      </Carousel>
    </Col>
  );
};
