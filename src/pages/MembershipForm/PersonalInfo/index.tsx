import {
  GenderEnum,
  MaritalStatusEnum,
  MembershipFields,
} from "@/enums/membership";
import { beforeUpload, convertFileToBase64 } from "@/helpers/app";
import { IMemberPhoto } from "@/types/store";
import {
  dateFormat,
  disabledDate,
  postalCodeRegex,
  requiredRules,
} from "@/utils/app";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  ButtonProps,
  Col,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Tooltip,
  Upload,
} from "antd";
import Title from "antd/es/typography/Title";
import { RcFile, UploadProps } from "antd/es/upload";

export const PersonalInfo = () => {
  const form = Form.useFormInstance();

  const imageUrl = Form.useWatch(MembershipFields.Photo, form);

  const genderOptions = [
    { label: "Masculino", value: GenderEnum.Male },
    { label: "Feminino", value: GenderEnum.Female },
  ];

  const martitalOptions = [
    { label: "Casado(a)", value: MaritalStatusEnum.Married },
    { label: "União de facto", value: MaritalStatusEnum.StableUnion },
    { label: "Solteiro(a)", value: MaritalStatusEnum.Single },
    { label: "Divorciado(a)", value: MaritalStatusEnum.Divorced },
  ];

  const handleChange: UploadProps["onChange"] = async ({ file }) => {
    if (file) {
      const url = (await convertFileToBase64(file as RcFile)) as string;

      const value: IMemberPhoto = {
        file: url,
        filename: file.name,
        type: file.type!,
      };

      form.setFieldValue(MembershipFields.Photo, value);
    }
  };

  const onRemove: ButtonProps["onClick"] = (e) => {
    e.stopPropagation();
    form.setFieldValue(MembershipFields.Photo, undefined);
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Foto</div>
    </div>
  );

  return (
    <Row gutter={10}>
      <Divider orientation="left">
        <Title level={3} className="text-uppercase">
          Informações Pessoais
        </Title>
      </Divider>

      <Col xs={{ order: 2, span: 24 }} md={{ order: 1, span: 20 }}>
        <Row gutter={10}>
          <Form.Item name={MembershipFields.Id} label="Código" hidden>
            <Input placeholder="" className="width-100perc" />
          </Form.Item>

          <Col xs={24} sm={18}>
            <Form.Item
              name={MembershipFields.Fullname}
              label="Nome"
              rules={requiredRules}
            >
              <Input placeholder="Nome completo..." />
            </Form.Item>
          </Col>

          <Col xs={24} sm={6}>
            <Form.Item
              name={MembershipFields.BirthDate}
              label="Data de nascimento"
              rules={requiredRules}
            >
              <DatePicker
                disabledDate={disabledDate}
                format={dateFormat}
                className="width-100perc"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8}>
            <Form.Item
              name={MembershipFields.Gender}
              label="Sexo"
              rules={requiredRules}
            >
              <Select placeholder="Selecione o sexo" options={genderOptions} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8}>
            <Form.Item
              name={MembershipFields.MaritalStatus}
              label="Estado civil"
              rules={requiredRules}
            >
              <Select
                placeholder="Selecione seu estado civil"
                options={martitalOptions}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8}>
            <Form.Item
              name={MembershipFields.PostalCode}
              label="Código postal"
              normalize={(value: string) =>
                value.replace(/\s/, "-").replace(/-{2}/g, "-")
              }
              rules={[
                () => ({
                  validator(_, value: string) {
                    if (value?.match(postalCodeRegex)) {
                      return Promise.resolve();
                    }
                    return Promise.reject("XXXX-XXX");
                  },
                }),
              ]}
            >
              <Input placeholder="XXXX-XXX" />
            </Form.Item>
          </Col>
        </Row>
      </Col>

      <Col xs={{ order: 1, span: 24 }} md={{ order: 2, span: 4 }}>
        <Form.Item name={MembershipFields.Photo} noStyle>
          <Flex justify="center" align="center" className="height-100perc">
            <Upload
              listType="picture-circle"
              className="avatar-uploader"
              showUploadList={false}
              beforeUpload={beforeUpload}
              onChange={handleChange}
            >
              {imageUrl ? (
                <Row className="float-btn-container">
                  <Avatar
                    src={imageUrl}
                    size="small"
                    alt="userProfile"
                    className="width-100perc height-100perc"
                  />

                  <Tooltip title="Remover" placement="bottom">
                    <Button
                      shape="circle"
                      size="small"
                      icon={<DeleteOutlined />}
                      className="float-btn"
                      onClick={onRemove}
                    />
                  </Tooltip>
                </Row>
              ) : (
                uploadButton
              )}
            </Upload>
          </Flex>
        </Form.Item>
      </Col>

      <Col xs={{ order: 3, span: 24 }}>
        <Form.Item
          name={MembershipFields.Address}
          label="Morada"
          rules={requiredRules}
        >
          <Input placeholder="Rua..." />
        </Form.Item>
      </Col>

      <Col xs={{ order: 3, span: 24 }} sm={12} md={8}>
        <Form.Item
          name={MembershipFields.City}
          label="Freguesia"
          rules={requiredRules}
        >
          <Input placeholder="Ex: Samora Correia" />
        </Form.Item>
      </Col>

      <Col xs={{ order: 3, span: 24 }} sm={12} md={8}>
        <Form.Item
          name={MembershipFields.County}
          label="Concelho"
          rules={requiredRules}
        >
          <Input placeholder="Ex: Benavente" />
        </Form.Item>
      </Col>

      <Col xs={{ order: 3, span: 24 }} sm={12} md={8}>
        <Form.Item
          name={MembershipFields.State}
          label="Distrito"
          rules={requiredRules}
        >
          <Input placeholder="Ex: Santarém" />
        </Form.Item>
      </Col>
    </Row>
  );
};
