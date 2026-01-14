import { WorshipContent } from "@/components/WorshipContent";
import { Col, Divider, Flex, Row } from "antd";
import Title from "antd/es/typography/Title";

export const WorshipDays = () => {
  return (
    <Col span={24}>
      <Divider>
        <Title level={3} className="text-uppercase">
          Dias de culto
        </Title>
      </Divider>

      <Flex
        align="center"
        justify="center"
        className="my-[100px] md:my-[75px] sm:my-[50px]"
      >
        <Row gutter={[32, 8]} justify="center">
          <Col>
            <WorshipContent
              title="Domingo"
              label1="Todos os domingos"
              label2="À partir das 18 horas."
            />
          </Col>

          <Col>
            <Divider type="vertical" className="h-full" />
          </Col>

          <Col>
            <WorshipContent
              title="Quarta-feira"
              label1="Todas as quartas-feiras"
              label2="À partir das 20 horas."
            />
          </Col>
        </Row>
      </Flex>
    </Col>
  );
};
