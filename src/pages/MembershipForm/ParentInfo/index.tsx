import { MembershipFields } from "@/enums/membership";
import { disabledDate } from "@/utils/app";
import { Col, DatePicker, Divider, Form, Input, Row } from "antd";
import Title from "antd/es/typography/Title";
import { SonFields } from "./SonFields";

export const ParentInfo = () => {
  return (
    <>
      <Divider orientation="left">
        <Title level={3} className="text-uppercase">
          Informações Familiares
        </Title>
      </Divider>

      <Row gutter={10}>
        <Col xs={24} md={12}>
          <Form.Item name={MembershipFields.MotherName} label="Nome da mãe">
            <Input placeholder="Nome completo da mãe..." />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item name={MembershipFields.FatherName} label="Nome do pai">
            <Input placeholder="Nome completo do pai..." />
          </Form.Item>
        </Col>

        <Col xs={24} sm={16} md={18}>
          <Form.Item name={MembershipFields.SpouseName} label="Nome do cônjuge">
            <Input placeholder="Nome completo do conjuge..." />
          </Form.Item>
        </Col>

        <Col xs={24} sm={8} md={6}>
          <Form.Item
            name={MembershipFields.WeddingDate}
            label="Data de casamento"
          >
            <DatePicker disabledDate={disabledDate} style={{ width: "100%" }} />
          </Form.Item>
        </Col>

        <Col span={24}>
          <SonFields />
        </Col>
      </Row>
    </>
  );
};
