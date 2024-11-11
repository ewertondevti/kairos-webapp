import { CustomImage } from "@/components/CustomImage";
import { useGetPresentations } from "@/react-query";
import { Col, Empty, Flex, Row } from "antd";

export const PresentationTab = () => {
  const { data: images, isLoading } = useGetPresentations();

  if (!images?.length) return <Empty style={{ marginTop: 50 }} />;

  return (
    <Flex gap={8} justify="center" className="management__image-container">
      <Row className="management__image-container--photos">
        {images?.map((image) => (
          <Col key={image.id}>
            <CustomImage {...image} key={image.id} isLoading={isLoading} />
          </Col>
        ))}
      </Row>
    </Flex>
  );
};
