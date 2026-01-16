"use client";

import { EcclesiasticalInfo } from "@/components/pages/MembershipForm/EcclesiasticalInfo";
import { ParentInfo } from "@/components/pages/MembershipForm/ParentInfo";
import { PersonalInfo } from "@/components/pages/MembershipForm/PersonalInfo";
import { churchRoleOptions } from "@/constants/churchRoles";
import { MembershipFields } from "@/enums/membership";
import { firebaseAuth } from "@/firebase";
import { useGetUserProfile } from "@/react-query";
import { updateUserProfile } from "@/services/userServices";
import { useAuth } from "@/store";
import {
  Button,
  Card,
  Flex,
  Form,
  Input,
  Layout,
  Result,
  Spin,
  message,
} from "antd";
import { Content } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";
import dayjs from "dayjs";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import styles from "./Profile.module.scss";

export const ProfilePage = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const { user, role, active, loading } = useAuth();
  const hasAccess = useMemo(
    () => Boolean(user && active && role !== null),
    [active, role, user]
  );
  const { data, isLoading } = useGetUserProfile(!loading && hasAccess);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!data?.user) return;

    const member = data.member;
    const user = data.user;
    form.setFieldsValue({
      [MembershipFields.Fullname]: member?.fullname ?? user.fullname,
      [MembershipFields.Email]: member?.email ?? user.email,
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
      [MembershipFields.ChurchRole]: member?.churchRole,
      [MembershipFields.BelongsTo]: member?.belongsTo,
      [MembershipFields.Photo]: member?.photo,
    });
  }, [data, form]);

  const onSaveProfile = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const photoValue = values?.[MembershipFields.Photo];
      const safePhoto = typeof photoValue === "string" ? photoValue : undefined;

      const payload = {
        ...values,
        [MembershipFields.BirthDate]:
          values?.[MembershipFields.BirthDate]?.toISOString(),
        [MembershipFields.WeddingDate]:
          values?.[MembershipFields.WeddingDate]?.toISOString(),
        [MembershipFields.BaptismDate]:
          values?.[MembershipFields.BaptismDate]?.toISOString(),
        [MembershipFields.AdmissionDate]:
          values?.[MembershipFields.AdmissionDate]?.toISOString(),
        [MembershipFields.Photo]: safePhoto,
      };

      await updateUserProfile(payload);
      message.success("Dados atualizados com sucesso!");
    } catch (error) {
      console.error(error);
      message.error("Não foi possível salvar os dados.");
    } finally {
      setSaving(false);
    }
  };

  const onSavePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      const user = firebaseAuth.currentUser;
      if (!user || !user.email) {
        message.error("Sessão inválida. Faça login novamente.");
        return;
      }

      setSavingPassword(true);
      const credential = EmailAuthProvider.credential(
        user.email,
        values.currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, values.newPassword);
      message.success("Senha atualizada com sucesso!");
      passwordForm.resetFields();
    } catch (error) {
      console.error(error);
      message.error("Não foi possível atualizar a senha.");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading || isLoading) {
    return (
      <Flex justify="center" align="center" className="min-h-[200px]">
        <Spin spinning />
      </Flex>
    );
  }

  if (!user) {
    return (
      <Flex justify="center" align="center" className="min-h-[200px]">
        <Spin spinning />
      </Flex>
    );
  }

  if (!hasAccess) {
    return (
      <Result
        status="403"
        title="Acesso restrito"
        subTitle="Você não possui permissão para acessar esta página."
        extra={
          <Button type="primary" href="/">
            Voltar ao início
          </Button>
        }
      />
    );
  }

  return (
    <Layout>
      <Content className={styles.page} style={{ padding: 20 }}>
        <Title className={styles.title}>Meu perfil</Title>

        <Flex justify="center">
          <Flex vertical gap={24} className={styles.container}>
            <Form
              form={form}
              layout="vertical"
              className={styles.form}
              style={{ maxWidth: 900, width: "100%" }}
              initialValues={{ [MembershipFields.Children]: [] }}
            >
              <Card>
                <PersonalInfo />
                <ParentInfo />
                <EcclesiasticalInfo churchRoleOptions={churchRoleOptions} />

                <Flex justify="flex-end">
                  <Button
                    type="primary"
                    onClick={onSaveProfile}
                    loading={saving}
                  >
                    Salvar alterações
                  </Button>
                </Flex>
              </Card>
            </Form>

            <Form
              form={passwordForm}
              layout="vertical"
              className={styles.form}
              style={{ maxWidth: 900, width: "100%" }}
            >
              <Card title="Atualizar senha">
                <Form.Item
                  name="currentPassword"
                  label="Senha atual"
                  rules={[
                    { required: true, message: "Informe a senha atual." },
                  ]}
                >
                  <Input.Password placeholder="Senha atual" />
                </Form.Item>
                <Form.Item
                  name="newPassword"
                  label="Nova senha"
                  rules={[
                    { required: true, message: "Informe a nova senha." },
                    {
                      min: 8,
                      message: "A senha deve ter pelo menos 8 caracteres.",
                    },
                  ]}
                >
                  <Input.Password placeholder="Nova senha" />
                </Form.Item>
                <Form.Item
                  name="confirmPassword"
                  label="Confirmar nova senha"
                  dependencies={["newPassword"]}
                  rules={[
                    { required: true, message: "Confirme a nova senha." },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("newPassword") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject("As senhas não coincidem.");
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Confirmar nova senha" />
                </Form.Item>

                <Flex justify="flex-end">
                  <Button
                    type="primary"
                    onClick={onSavePassword}
                    loading={savingPassword}
                  >
                    Atualizar senha
                  </Button>
                </Flex>
              </Card>
            </Form>
          </Flex>
        </Flex>
      </Content>
    </Layout>
  );
};
