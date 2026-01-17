"use client";

import { EcclesiasticalInfo } from "@/components/pages/MembershipForm/EcclesiasticalInfo";
import { ParentInfo } from "@/components/pages/MembershipForm/ParentInfo";
import { PersonalInfo } from "@/components/pages/MembershipForm/PersonalInfo";
import { churchRoleOptions } from "@/constants/churchRoles";
import { MembershipFields } from "@/features/membership/membership.enums";
import { firebaseAuth } from "@/firebase";
import { useGetUserProfile } from "@/react-query";
import { logAuditEvent } from "@/services/auditService";
import { updateUserProfile } from "@/services/userServices";
import { useAuth } from "@/store";
import { mapChildrenToPayload, normalizeMemberChildren } from "@/utils/membership";
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

    const userProfile = data.user;
    form.setFieldsValue({
      [MembershipFields.Fullname]: userProfile.fullname,
      [MembershipFields.Email]: userProfile.email,
      [MembershipFields.BirthDate]: userProfile.birthDate
        ? dayjs(userProfile.birthDate)
        : undefined,
      [MembershipFields.Gender]: userProfile.gender,
      [MembershipFields.MaritalStatus]: userProfile.maritalStatus,
      [MembershipFields.PostalCode]: userProfile.postalCode,
      [MembershipFields.Address]: userProfile.address,
      [MembershipFields.AddressNumber]: userProfile.addressNumber,
      [MembershipFields.AddressFloor]: userProfile.addressFloor,
      [MembershipFields.AddressDoor]: userProfile.addressDoor,
      [MembershipFields.City]: userProfile.city,
      [MembershipFields.County]: userProfile.county,
      [MembershipFields.State]: userProfile.state,
      [MembershipFields.MotherName]: userProfile.motherName,
      [MembershipFields.FatherName]: userProfile.fatherName,
      [MembershipFields.SpouseName]: userProfile.spouseName,
      [MembershipFields.WeddingDate]: userProfile.weddingDate
        ? dayjs(userProfile.weddingDate)
        : undefined,
      [MembershipFields.Children]: normalizeMemberChildren(userProfile.children),
      [MembershipFields.BaptismChurch]: userProfile.baptismChurch,
      [MembershipFields.BaptismDate]: userProfile.baptismDate
        ? dayjs(userProfile.baptismDate)
        : undefined,
      [MembershipFields.AdmissionType]: userProfile.admissionType,
      [MembershipFields.BaptizedPastor]: userProfile.baptizedPastor,
      [MembershipFields.AdmissionDate]: userProfile.admissionDate
        ? dayjs(userProfile.admissionDate)
        : undefined,
      [MembershipFields.Congregation]: userProfile.congregation,
      [MembershipFields.ChurchRole]: userProfile.churchRole,
      [MembershipFields.BelongsTo]: userProfile.belongsTo,
      [MembershipFields.Photo]: userProfile.photo,
    });
  }, [data, form]);

  const onSaveProfile = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
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
        [MembershipFields.Children]: mapChildrenToPayload(
          values?.[MembershipFields.Children]
        ),
      };

      await updateUserProfile(payload);
      message.success("Dados atualizados com sucesso!");
      void logAuditEvent({
        action: "member.self.update",
        targetType: "user",
        metadata: { fields: Object.keys(values) },
      });
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
      void logAuditEvent({
        action: "auth.password.update",
        targetType: "user",
        targetId: user.uid,
      });
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
