import { useGetEvents } from "@/react-query";
import { Col, Divider, Flex, Image, Row } from "antd";

export const Events = () => {
  const { data: events } = useGetEvents();

  if (!events?.length) return null;

  return (
    <Col span={24}>
      <Flex align="center" style={{ padding: 20 }}>
        <Row gutter={[8, 8]} justify="center">
          {events?.map(({ id, url }, idx) => (
            <>
              {idx < events.length - 1 && (
                <Col>
                  <Divider />
                </Col>
              )}

              <Col key={id}>
                <Image src={url} />
              </Col>
            </>
          ))}
        </Row>
      </Flex>
    </Col>
  );
};
