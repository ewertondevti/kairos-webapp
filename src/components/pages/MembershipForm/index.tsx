"use client";

import { MembershipFields } from "@/enums/membership";
import { useGetUserProfile } from "@/react-query";
import { updateUserProfile } from "@/services/userServices";
import { useAuth } from "@/store";
import { MembershipValues } from "@/types/membership";
import { MemberPayload } from "@/types/store";
import { mapChildrenToPayload, normalizeMemberChildren } from "@/utils/membership";
import { Button, Card, Flex, Form, FormProps, Layout, message } from "antd";
import { Content } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { EcclesiasticalInfo } from "./EcclesiasticalInfo";
import styles from "./MembershipForm.module.scss";
import { ParentInfo } from "./ParentInfo";
import { PersonalInfo } from "./PersonalInfo";

export const MembershipForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const [form] = Form.useForm();
  const { user } = useAuth();
  const { data: profileData } = useGetUserProfile(Boolean(user));

  useEffect(() => {
    if (!profileData?.user) return;
    if (form.isFieldsTouched()) return;

    const userData = profileData.user;

    form.setFieldsValue({
      [MembershipFields.Fullname]: userData.fullname,
      [MembershipFields.Email]: userData.email,
      [MembershipFields.BirthDate]: userData.birthDate
        ? dayjs(userData.birthDate)
        : undefined,
      [MembershipFields.Gender]: userData.gender,
      [MembershipFields.MaritalStatus]: userData.maritalStatus,
      [MembershipFields.PostalCode]: userData.postalCode,
      [MembershipFields.Address]: userData.address,
      [MembershipFields.AddressNumber]: userData.addressNumber,
      [MembershipFields.AddressFloor]: userData.addressFloor,
      [MembershipFields.AddressDoor]: userData.addressDoor,
      [MembershipFields.City]: userData.city,
      [MembershipFields.County]: userData.county,
      [MembershipFields.State]: userData.state,
      [MembershipFields.MotherName]: userData.motherName,
      [MembershipFields.FatherName]: userData.fatherName,
      [MembershipFields.SpouseName]: userData.spouseName,
      [MembershipFields.WeddingDate]: userData.weddingDate
        ? dayjs(userData.weddingDate)
        : undefined,
      [MembershipFields.Children]: normalizeMemberChildren(userData.children),
      [MembershipFields.BaptismChurch]: userData.baptismChurch,
      [MembershipFields.BaptismDate]: userData.baptismDate
        ? dayjs(userData.baptismDate)
        : undefined,
      [MembershipFields.AdmissionType]: userData.admissionType,
      [MembershipFields.BaptizedPastor]: userData.baptizedPastor,
      [MembershipFields.AdmissionDate]: userData.admissionDate
        ? dayjs(userData.admissionDate)
        : undefined,
      [MembershipFields.Congregation]: userData.congregation,
      [MembershipFields.BelongsTo]: userData.belongsTo,
      [MembershipFields.Photo]: userData.photo,
    });
  }, [form, profileData]);

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
      [MembershipFields.Photo]: undefined,
    };

    updateUserProfile(payload)
      .then(() => {
        message.success("Dados atualizados com sucesso!");
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
            initialValues={{ [MembershipFields.Children]: [] }}
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
