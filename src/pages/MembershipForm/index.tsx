import { DatabaseTableKeys } from "@/enums/app";
import { MembershipFields } from "@/enums/membership";
import firebaseDB, { firebaseStorage } from "@/firebase";
import { getAddress } from "@/services/membershipServices";
import { MembershipValues } from "@/types/membership";
import { MemberType } from "@/types/store";
import { postalCodeRegex } from "@/utils/app";
import {
  Button,
  Card,
  Divider,
  Flex,
  Form,
  FormProps,
  Layout,
  message,
} from "antd";
import { Content } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";
import { addDoc, collection } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
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

  const onSubmit: FormProps["onFinish"] = async (values: MembershipValues) => {
    setIsLoading(true);

    const file = values[MembershipFields.Photo];
    const birthdate = values?.[MembershipFields.Birthdate];
    const weddingDate = values?.[MembershipFields.WeddingDate];
    const baptismDate = values?.[MembershipFields.BaptismDate];
    const admissionDate = values?.[MembershipFields.AdmissionDate];

    const payload: MemberType = {
      ...values,
      [MembershipFields.Birthdate]: birthdate?.toISOString(),
      [MembershipFields.WeddingDate]: weddingDate?.toISOString(),
      [MembershipFields.BaptismDate]: baptismDate?.toISOString(),
      [MembershipFields.AdmissionDate]: admissionDate?.toISOString(),
      [MembershipFields.Photo]: undefined,
    };

    if (file) {
      const storageRef = ref(
        firebaseStorage,
        `${DatabaseTableKeys.Members}/${file.name}`
      );

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          message.error(
            `Erro ao fazer upload do arquivo ${file.name}: ${error.message}`,
            5
          );
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          payload[MembershipFields.Photo] = downloadURL;
        }
      );
    }

    await addDoc(collection(firebaseDB, DatabaseTableKeys.Members), payload)
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
          >
            <Card>
              <Title level={3}>Informações Pessoais</Title>

              <PersonalInfo />

              <Divider />

              <ParentInfo />

              <Divider />

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
