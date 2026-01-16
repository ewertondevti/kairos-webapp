import { MaritalStatusEnum, MembershipFields } from "@/enums/membership";
import { dateInputFormat, disabledDate } from "@/utils/app";
import { Col, DatePicker, Divider, Form, Input, Row } from "antd";
import Title from "antd/es/typography/Title";
import { SonFields } from "./SonFields";

export const ParentInfo = () => {
  const form = Form.useFormInstance();

  const maritalStateValue = Form.useWatch(MembershipFields.MaritalStatus, form);

  const isShowFields = (fieldname: MembershipFields) => {
    if (fieldname === MembershipFields.SpouseName) {
      return [
        MaritalStatusEnum.Married,
        MaritalStatusEnum.StableUnion,
      ].includes(maritalStateValue);
    }

    return maritalStateValue === MaritalStatusEnum.Married;
  };

  return (
    <>
      <Divider orientation="vertical" />
      <Title level={3} className="text-uppercase">
        Informações Familiares
      </Title>

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

        {isShowFields(MembershipFields.SpouseName) && (
          <Col xs={24} sm={16} md={18}>
            <Form.Item
              name={MembershipFields.SpouseName}
              label="Nome do cônjuge"
            >
              <Input placeholder="Nome completo do conjuge..." />
            </Form.Item>
          </Col>
        )}

        {isShowFields(MembershipFields.WeddingDate) && (
          <Col xs={24} sm={8} md={6}>
            <Form.Item
              name={MembershipFields.WeddingDate}
              label="Data de casamento"
            >
              <DatePicker
                format={dateInputFormat}
                disabledDate={disabledDate}
                className="w-full"
              />
            </Form.Item>
          </Col>
        )}

        <Col span={24}>
          <SonFields />
        </Col>
      </Row>
    </>
  );
};
