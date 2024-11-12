import { MembershipFields } from "@/enums/membership";
import { getAddress } from "@/services/membershipServices";
import { postalCodeRegex } from "@/utils/app";
import { Card, Divider, Flex, Form, Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";
import { useEffect } from "react";
import { EcclesiasticalInfo } from "./EcclesiasticalInfo";
import { ParentInfo } from "./ParentInfo";
import { PersonalInfo } from "./PersonalInfo";

export const MembershipForm = () => {
  const [form] = Form.useForm();

  const postalCodeValue = Form.useWatch(MembershipFields.PostalCode, form);

  useEffect(() => {
    if (postalCodeValue?.match(postalCodeRegex)) {
      getAddress(postalCodeValue)
        .then((res) => {
          if (res.length) {
            const { Morada, Freguesia, Concelho, Distrito } = res[0];

            form.setFieldsValue({
              [MembershipFields.Address]: Morada,
              [MembershipFields.Neighborhood]: Freguesia,
              [MembershipFields.City]: Concelho,
              [MembershipFields.State]: Distrito,
            });
          }
        })
        .catch(() => {
          form.setFields([
            {
              name: MembershipFields.PostalCode,
              errors: ["Código postal não encontrado!"],
            },
          ]);
        });
    }
  }, [postalCodeValue]);

  return (
    <Layout>
      <Content style={{ padding: 20 }}>
        <Title>Ficha de membro</Title>

        <Flex justify="center">
          <Form form={form} layout="vertical" style={{ maxWidth: 900 }}>
            <Card>
              <Title level={3}>Informações Pessoais</Title>

              <PersonalInfo />

              <Divider />

              <ParentInfo />

              <Divider />

              <EcclesiasticalInfo />
            </Card>
          </Form>
        </Flex>
      </Content>
    </Layout>
  );
};
