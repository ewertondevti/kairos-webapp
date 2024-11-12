import { RoutesEnums } from "@/enums/routesEnums";
import { useGetPresentations } from "@/react-query";
import { Button, Carousel, Col, Flex, Image } from "antd";

export const Presentation = () => {
  const { data: images } = useGetPresentations();

  return (
    <Col span={24} className="home__content-presentation">
      <Flex justify="flex-end" align="center">
        <Button type="link" href={`/${RoutesEnums.Gallery}`}>
          Ver todas
        </Button>
      </Flex>

      <Carousel
        className="home__content-carousel"
        infinite
        dotPosition="left"
        arrows
        autoplay
        speed={2000}
        autoplaySpeed={5000}
        style={{ height: "100%" }}
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
