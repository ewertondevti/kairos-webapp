import {
  MaritalStatusEnum,
  MembershipFields,
} from "@/features/membership/membership.enums";
import {
  dateInputFormat,
  disabledDate,
  formatPersonName,
  personNameRules,
} from "@/utils/app";
import { Col, DatePicker, Divider, Form, Input, Row } from "antd";
import Title from "antd/es/typography/Title";
import styles from "./ParentInfo.module.scss";
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
    <div className={styles.section}>
      <Divider orientation="vertical" />
      <Title level={3} className={`${styles.sectionTitle} text-uppercase`}>
        Informações Familiares
      </Title>

      <Row gutter={10}>
        <Col span={24}>
          <Form.Item
            name={MembershipFields.FatherName}
            label="Nome do pai"
            rules={personNameRules}
            getValueFromEvent={(event) =>
              formatPersonName(event?.target?.value ?? "")
            }
          >
            <Input placeholder="Nome completo do pai..." />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={10}>
        <Col span={24}>
          <Form.Item
            name={MembershipFields.MotherName}
            label="Nome da mãe"
            rules={personNameRules}
            getValueFromEvent={(event) =>
              formatPersonName(event?.target?.value ?? "")
            }
          >
            <Input placeholder="Nome completo da mãe..." />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={10}>
        {isShowFields(MembershipFields.SpouseName) && (
          <Col span={24}>
            <Form.Item
              name={MembershipFields.SpouseName}
              label="Nome do cônjuge"
              rules={personNameRules}
              getValueFromEvent={(event) =>
                formatPersonName(event?.target?.value ?? "")
              }
            >
              <Input placeholder="Nome completo do conjuge..." />
            </Form.Item>
          </Col>
        )}

        {isShowFields(MembershipFields.WeddingDate) && (
          <Col xs={24} md={12}>
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
    </div>
  );
};
