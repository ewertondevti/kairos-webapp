import firebaseDB from "@/firebase";
import { useAppState } from "@/store";
import { AlbumValuesType } from "@/types/album";
import { requiredRules } from "@/utils/app";
import { Form, Input, message, Modal } from "antd";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import "./AlbumModal.scss";

export const AlbumModal = () => {
  const [isLoading, setIsLoading] = useState(false);

  const [form] = Form.useForm();

  const { albumModalOpen, toogleAlbumModal } = useAppState();

  const onSave = async (values: AlbumValuesType) => {
    setIsLoading(true);

    try {
      await addDoc(collection(firebaseDB, "albums"), {
        name: values.name,
      });

      message.success("Álbum criado com sucesso!");
    } catch (error) {
      console.error(error);
      message.error("Houve um erro ao tentar criar o álbum.");
    }

    setIsLoading(false);
    onCancel();
  };

  const onCancel = () => toogleAlbumModal(false);

  return (
    <Modal
      open={albumModalOpen}
      onOk={() => form.submit()}
      onCancel={onCancel}
      title={"Criar álbum"}
      okText="Gravar"
      className="album__modal"
      zIndex={1300}
      okButtonProps={{ loading: isLoading }}
    >
      <Form form={form} layout="vertical" onFinish={onSave}>
        <Form.Item name="name" label="Nome do álbum" rules={requiredRules}>
          <Input placeholder="Digite o nome do álbum..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
