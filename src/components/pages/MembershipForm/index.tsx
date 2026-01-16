"use client";

import { MembershipFields } from "@/enums/membership";
import { useGetUserProfile } from "@/react-query";
import { createNewMember, getAddress } from "@/services/membershipServices";
import { useAuth } from "@/store";
import { MembershipValues } from "@/types/membership";
import { MemberPayload } from "@/types/store";
import { postalCodeRegex } from "@/utils/app";
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

  const postalCodeValue = Form.useWatch(MembershipFields.PostalCode, form);

  useEffect(() => {
    if (!profileData?.user) return;
    if (form.isFieldsTouched()) return;

    const member = profileData.member;
    const userData = profileData.user;

    form.setFieldsValue({
      [MembershipFields.Fullname]: member?.fullname ?? userData.fullname,
      [MembershipFields.Email]: member?.email ?? userData.email,
      [MembershipFields.BirthDate]: member?.birthDate
        ? dayjs(member.birthDate)
        : undefined,
      [MembershipFields.Gender]: member?.gender,
      [MembershipFields.MaritalStatus]: member?.maritalStatus,
      [MembershipFields.PostalCode]: member?.postalCode,
      [MembershipFields.Address]: member?.address,
      [MembershipFields.City]: member?.city,
      [MembershipFields.County]: member?.county,
      [MembershipFields.State]: member?.state,
      [MembershipFields.MotherName]: member?.motherName,
      [MembershipFields.FatherName]: member?.fatherName,
      [MembershipFields.SpouseName]: member?.spouseName,
      [MembershipFields.WeddingDate]: member?.weddingDate
        ? dayjs(member.weddingDate)
        : undefined,
      [MembershipFields.Children]: member?.children ?? [],
      [MembershipFields.BaptismChurch]: member?.baptismChurch,
      [MembershipFields.BaptismDate]: member?.baptismDate
        ? dayjs(member.baptismDate)
        : undefined,
      [MembershipFields.AdmissionType]: member?.admissionType,
      [MembershipFields.BaptizedPastor]: member?.baptizedPastor,
      [MembershipFields.AdmissionDate]: member?.admissionDate
        ? dayjs(member.admissionDate)
        : undefined,
      [MembershipFields.Congregation]: member?.congregation,
      [MembershipFields.BelongsTo]: member?.belongsTo,
      [MembershipFields.Photo]: member?.photo,
    });
  }, [form, profileData]);

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
  }, [postalCodeValue, form]);

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
