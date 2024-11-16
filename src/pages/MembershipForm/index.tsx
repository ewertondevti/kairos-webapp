import { MembershipFields } from "@/enums/membership";
import { createNewMember, getAddress } from "@/services/membershipServices";
import { MembershipValues } from "@/types/membership";
import { MemberPayload } from "@/types/store";
import { postalCodeRegex } from "@/utils/app";
import { Button, Card, Flex, Form, FormProps, Layout, message } from "antd";
import { Content } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";
import { useEffect, useState } from "react";
import { EcclesiasticalInfo } from "./EcclesiasticalInfo";
import { ParentInfo } from "./ParentInfo";
import { PersonalInfo } from "./PersonalInfo";

export const MembershipForm = () => {
  const [isLoading, setIsLoading] = useState(false);

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
              [MembershipFields.City]: Freguesia,
              [MembershipFields.County]: Concelho,
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

  const onSubmit: FormProps["onFinish"] = async (values: MembershipValues) => {
    setIsLoading(true);

    const birthdate = values?.[MembershipFields.BirthDate];
    const weddingDate = values?.[MembershipFields.WeddingDate];
    const baptismDate = values?.[MembershipFields.BaptismDate];
    const admissionDate = values?.[MembershipFields.AdmissionDate];

    const payload: MemberPayload = {
      ...values,
      [MembershipFields.BirthDate]: birthdate?.toISOString(),
      [MembershipFields.WeddingDate]: weddingDate?.toISOString(),
      [MembershipFields.BaptismDate]: baptismDate?.toISOString(),
      [MembershipFields.AdmissionDate]: admissionDate?.toISOString(),
      [MembershipFields.Photo]: undefined,
    };

    createNewMember(payload)
      .then(() => {
        form.resetFields();
        message.success(
          "Novo membro da Kairós Portugal adicionado com sucesso!"
        );
      })
      .catch((error) => {
        console.error(error);
        message.error(
          "Não foi possível adicionar novo membro da Kairós Portugal!"
        );
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <Layout>
      <Content style={{ padding: 20 }}>
        <Title>Ficha de membro</Title>

        <Flex justify="center">
          <Form
            form={form}
            layout="vertical"
            style={{ maxWidth: 900 }}
            onFinish={onSubmit}
            onFinishFailed={(error) => console.log(error)}
            initialValues={{ [MembershipFields.Children]: [] }}
          >
            <Card>
              <PersonalInfo />

              <ParentInfo />

              <EcclesiasticalInfo />

              <Flex justify="flex-end">
                <Button type="primary" htmlType="submit" loading={isLoading}>
                  Gravar
                </Button>
              </Flex>
            </Card>
          </Form>
        </Flex>
      </Content>
    </Layout>
  );
};
