import { MembershipFields } from "@/enums/membership";
import { disabledDate } from "@/utils/app";
import { Col, DatePicker, Divider, Form, Input, Row, Select } from "antd";
import Title from "antd/es/typography/Title";

export const EcclesiasticalInfo = () => {
  return (
    <>
      <Divider orientation="left">
        <Title level={3} className="text-uppercase">
          Informações Eclasiásticas
        </Title>
      </Divider>

      <Row gutter={10}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            name={MembershipFields.BaptismChurch}
            label="Igreja de batismo"
          >
            <Input placeholder="Nome da igreja de batismo..." />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Form.Item
            name={MembershipFields.BaptismDate}
            label="Data de batismo"
          >
            <DatePicker disabledDate={disabledDate} style={{ width: "100%" }} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Form.Item
            name={MembershipFields.AdmissionType}
            label="Tipo de admissão"
          >
            <Select placeholder="Selecione o tipo de admissão" />
          </Form.Item>
        </Col>

        <Col xs={24} sm={16}>
          <Form.Item
            name={MembershipFields.BaptizedPastor}
            label="Pastor que batizou"
          >
            <Input placeholder="Nome do pastor que batizou..." />
          </Form.Item>
        </Col>

        <Col xs={24} sm={8}>
          <Form.Item
            name={MembershipFields.AdmissionDate}
            label="Data de admissão"
          >
            <DatePicker disabledDate={disabledDate} style={{ width: "100%" }} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={8}>
          <Form.Item name={MembershipFields.Congregation} label="Congregação">
            <Input placeholder="Nome da congregação..." />
          </Form.Item>
        </Col>

        <Col xs={24} sm={8}>
          <Form.Item
            name={MembershipFields.ChurchRole}
            label="Função na igreja"
          >
            <Input placeholder="Função na igreja..." />
          </Form.Item>
        </Col>

        <Col xs={24} sm={8}>
          <Form.Item
            name={MembershipFields.BelongsTo}
            label="Ministério que pertence"
          >
            <Input placeholder="Nome do ministério que pertence..." />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};
