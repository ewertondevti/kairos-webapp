"use client";

import { MembershipFields } from "@/features/membership/membership.enums";
import { logAuditEvent } from "@/services/auditService";
import { updateUserProfile } from "@/services/userServices";
import { MembershipValues } from "@/types/membership";
import { MemberPayload } from "@/types/store";
import {
  mapChildrenToPayload,
  normalizeMemberChildren,
} from "@/utils/membership";
import { Button, Card, Flex, Form, FormProps, Layout, message } from "antd";
import { Content } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";
import { useState } from "react";
import { EcclesiasticalInfo } from "./EcclesiasticalInfo";
import styles from "./MembershipForm.module.scss";
import { ParentInfo } from "./ParentInfo";
import { PersonalInfo } from "./PersonalInfo";

export const MembershipForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const [form] = Form.useForm();

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
      [MembershipFields.Children]: mapChildrenToPayload(
        values?.[MembershipFields.Children]
      ),
    };

    updateUserProfile(payload)
      .then(() => {
        message.success("Dados atualizados com sucesso!");
        void logAuditEvent({
          action: "member.self.update",
          targetType: "user",
          metadata: { fields: Object.keys(values) },
        });
      })
      .catch((error) => {
        console.error(error);
        message.error("Não foi possível atualizar os dados.");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <Layout>
      <Content className={styles.page} style={{ padding: 20 }}>
        <Title className={styles.title}>Ficha de membro</Title>

        <Flex justify="center">
          <Form
            form={form}
            layout="vertical"
            className={styles.form}
            style={{ maxWidth: 900 }}
            onFinish={onSubmit}
            onFinishFailed={(error) => console.log(error)}
            initialValues={{
              [MembershipFields.Children]: normalizeMemberChildren([]),
            }}
          >
            <Card>
              <PersonalInfo />

              <ParentInfo />

              <EcclesiasticalInfo showChurchRole={false} />

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
