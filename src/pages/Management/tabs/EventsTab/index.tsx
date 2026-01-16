import { LazyImage } from "@/components/LazyImage";
import { useGetEvents } from "@/react-query";
import { Col, Empty, Flex, Row } from "antd";

export const EventsTab = () => {
  const { data, isLoading } = useGetEvents();

  if (!data?.length) return <Empty style={{ marginTop: 50 }} />;

  return (
    <Flex gap={8} justify="center" className="h-full">
      <Row gutter={[8, 8]} className="w-[60dvw] flex-wrap justify-center sm:w-[100dvw]">
        {data.map((image) => (
          <Col key={image.id}>
            <Flex className="[&_.ant-image-img]:object-cover [&_.ant-image-img]:rounded-md [&_.ant-image-img]:w-[315px] [&_.ant-image-img]:h-[177px]">
              <LazyImage {...image} key={image.id} isLoading={isLoading} />
            </Flex>
          </Col>
        ))}
      </Row>
    </Flex>
  );
};

export default EventsTab;
