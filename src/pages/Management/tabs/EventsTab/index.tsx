import { LazyImage } from "@/components/LazyImage";
import { useGetEvents } from "@/react-query";
import { Col, Empty, Flex, Row } from "antd";

export const EventsTab = () => {
  const { data, isLoading } = useGetEvents();

  if (!data?.length) return <Empty style={{ marginTop: 50 }} />;

  return (
    <Flex gap={8} justify="center" className="management__image-container">
      <Row gutter={[8, 8]} className="management__image-container--events">
        {data.map((image) => (
          <Col key={image.id}>
            <Flex className="management__image--event-default-size">
              <LazyImage {...image} key={image.id} isLoading={isLoading} />
            </Flex>
          </Col>
        ))}
      </Row>
    </Flex>
  );
};
