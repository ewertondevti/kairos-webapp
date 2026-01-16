"use client";

import { EcclesiasticalInfo } from "@/components/pages/MembershipForm/EcclesiasticalInfo";
import { ParentInfo } from "@/components/pages/MembershipForm/ParentInfo";
import { PersonalInfo } from "@/components/pages/MembershipForm/PersonalInfo";
import { MembershipFields } from "@/enums/membership";
import { useGetUserProfile } from "@/react-query";
import { updateUserProfile } from "@/services/userServices";
import { firebaseAuth } from "@/firebase";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { Button, Card, Divider, Flex, Form, Input, Spin, message } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

export const ProfilePage = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const { data, isLoading } = useGetUserProfile();
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

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
        [MembershipFields.BirthDate]: values?.[MembershipFields.BirthDate]?.toISOString(),
        [MembershipFields.WeddingDate]: values?.[MembershipFields.WeddingDate]?.toISOString(),
        [MembershipFields.BaptismDate]: values?.[MembershipFields.BaptismDate]?.toISOString(),
        [MembershipFields.AdmissionDate]: values?.[MembershipFields.AdmissionDate]?.toISOString(),
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

  if (isLoading) {
    return (
      <Flex justify="center" align="center" className="min-h-[200px]">
        <Spin spinning />
      </Flex>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] py-8 md:py-12">
      <div className="container mx-auto px-4">
        <Card title="Meu perfil">
          <Form form={form} layout="vertical" initialValues={{ [MembershipFields.Children]: [] }}>
            <PersonalInfo />
            <ParentInfo />
            <EcclesiasticalInfo />

            <Flex justify="flex-end">
              <Button type="primary" onClick={onSaveProfile} loading={saving}>
                Salvar alterações
              </Button>
            </Flex>
          </Form>
        </Card>

        <Divider />

        <Card title="Atualizar senha">
          <Form form={passwordForm} layout="vertical">
            <Form.Item
              name="currentPassword"
              label="Senha atual"
              rules={[{ required: true, message: "Informe a senha atual." }]}
            >
              <Input.Password placeholder="Senha atual" />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label="Nova senha"
              rules={[
                { required: true, message: "Informe a nova senha." },
                { min: 8, message: "A senha deve ter pelo menos 8 caracteres." },
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
              <Button type="primary" onClick={onSavePassword} loading={savingPassword}>
                Atualizar senha
              </Button>
            </Flex>
          </Form>
        </Card>
      </div>
    </div>
  );
};
