import {
  GenderEnum,
  MaritalStatusEnum,
  MembershipFields,
} from "@/enums/membership";
import { beforeUpload, getBase64 } from "@/helpers/app";
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
  Flex,
  Form,
  Input,
  Row,
  Select,
  Tooltip,
  Upload,
} from "antd";
import { RcFile, UploadProps } from "antd/es/upload";
import { useState } from "react";

export const PersonalInfo = () => {
  const [imageUrl, setImageUrl] = useState("");

  const form = Form.useFormInstance();

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

  const handleChange: UploadProps["onChange"] = (info) => {
    getBase64(info.file.originFileObj as RcFile, (url) => {
      setImageUrl(url);
      form.setFieldValue(MembershipFields.Photo, info.file.originFileObj);
    });
  };

  const onRemove: ButtonProps["onClick"] = (e) => {
    e.stopPropagation();
    setImageUrl("");
    form.setFieldValue(MembershipFields.Photo, undefined);
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <Row gutter={10}>
      <Col xs={{ order: 2, span: 24 }} md={{ order: 1, span: 20 }}>
        <Row gutter={10}>
          <Col xs={24} sm={6}>
            <Form.Item
              name={MembershipFields.Code}
              label="Código"
              rules={requiredRules}
            >
              <Input placeholder="" style={{ width: "100%" }} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={18}>
            <Form.Item
              name={MembershipFields.Fullname}
              label="Nome"
              rules={requiredRules}
            >
              <Input placeholder="Nome completo..." />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8}>
            <Form.Item
              name={MembershipFields.Birthdate}
              label="Data de nascimento"
            >
              <DatePicker
                disabledDate={disabledDate}
                format={dateFormat}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8}>
            <Form.Item name={MembershipFields.Gender} label="Sexo">
              <Select placeholder="Selecione o sexo" options={genderOptions} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8}>
            <Form.Item
              name={MembershipFields.MaritalStatus}
              label="Estado civil"
            >
              <Select
                placeholder="Selecione seu estado civil"
                options={martitalOptions}
              />
            </Form.Item>
          </Col>
        </Row>
      </Col>

      <Col xs={{ order: 1, span: 24 }} md={{ order: 2, span: 4 }}>
        <Form.Item name={MembershipFields.Photo} noStyle>
          <Flex justify="center" align="center" style={{ height: "100%" }}>
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
                    style={{
                      height: "100%",
                      width: "100%",
                    }}
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

      <Col xs={{ order: 3, span: 24 }} sm={8}>
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

      <Col xs={{ order: 3, span: 24 }} sm={16}>
        <Form.Item name={MembershipFields.Address} label="Morada">
          <Input placeholder="Rua..." />
        </Form.Item>
      </Col>

      <Col xs={{ order: 3, span: 24 }} sm={12} md={8}>
        <Form.Item name={MembershipFields.Neighborhood} label="Freguesia">
          <Input placeholder="Ex: Samora Correia" />
        </Form.Item>
      </Col>

      <Col xs={{ order: 3, span: 24 }} sm={12} md={8}>
        <Form.Item name={MembershipFields.City} label="Concelho">
          <Input placeholder="Ex: Benavente" />
        </Form.Item>
      </Col>

      <Col xs={{ order: 3, span: 24 }} sm={12} md={8}>
        <Form.Item name={MembershipFields.State} label="Distrito">
          <Input placeholder="Ex: Santarém" />
        </Form.Item>
      </Col>
    </Row>
  );
};
