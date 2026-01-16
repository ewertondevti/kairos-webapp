import { churchRoleOptions as defaultChurchRoleOptions } from "@/constants/churchRoles";
import { MembershipFields } from "@/enums/membership";
import { dateInputFormat, disabledDate } from "@/utils/app";
import { Col, DatePicker, Divider, Form, Input, Row, Select } from "antd";
import Title from "antd/es/typography/Title";

type EcclesiasticalInfoProps = {
  showChurchRole?: boolean;
  churchRoleOptions?: { label: string; value: string }[];
};

export const EcclesiasticalInfo = ({
  showChurchRole = true,
  churchRoleOptions,
}: EcclesiasticalInfoProps) => {
  const roleOptions = churchRoleOptions ?? defaultChurchRoleOptions;
  return (
    <>
      <Divider orientation="vertical" />
      <Title level={3} className="text-uppercase">
        Informações Eclasiásticas
      </Title>

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
            <DatePicker
              format={dateInputFormat}
              disabledDate={disabledDate}
              className="w-full"
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Form.Item
            name={MembershipFields.AdmissionType}
            label="Tipo de admissão"
          >
            <Input placeholder="Selecione o tipo de admissão" />
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
            <DatePicker
              format={dateInputFormat}
              disabledDate={disabledDate}
              className="w-full"
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item name={MembershipFields.Congregation} label="Congregação">
            <Input placeholder="Nome da congregação..." />
          </Form.Item>
        </Col>

        {showChurchRole && (
          <Col xs={24} sm={12}>
            <Form.Item
              name={MembershipFields.ChurchRole}
              label="Cargo na igreja"
              rules={[{ required: true, message: "Selecione o cargo." }]}
            >
              <Select options={roleOptions} placeholder="Selecione o cargo" />
            </Form.Item>
          </Col>
        )}

        <Col xs={24} sm={12}>
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
