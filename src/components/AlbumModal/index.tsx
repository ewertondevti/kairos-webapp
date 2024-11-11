import { DatabaseTableKeys } from "@/enums/app";
import firebaseDB from "@/firebase";
import { useGetAlbums } from "@/react-query";
import { useAppState } from "@/store";
import { AlbumValuesType } from "@/types/album";
import { AlbumResult } from "@/types/store";
import { requiredRules } from "@/utils/app";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Input, message, Modal, Select, SelectProps } from "antd";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./AlbumModal.scss";

export const AlbumModal = () => {
  const [isLoading, setIsLoading] = useState(false);

  const [form] = Form.useForm();
  const { id: albumId } = useParams();
  const queryClient = useQueryClient();

  const { data: albums } = useGetAlbums();

  const albumIdValue = Form.useWatch("albumId", form);

  const options: SelectProps["options"] = albums?.map(({ id, name }) => ({
    label: name,
    value: id,
  }));

  const album = albums?.find((a) => a.id === albumId);

  const {
    albumModalOpen,
    selectedImages,
    toogleAlbumModal,
    updateSelectedImages,
    updateMode,
  } = useAppState();

  useEffect(() => {
    if (album) {
      form.setFieldsValue(album);
    }

    return () => {
      form.resetFields();
    };
  }, [album]);

  useEffect(() => {
    if (albumIdValue && albums) {
      const album = albums.find((a) => a.id === albumIdValue)!;
      form.setFieldValue("name", album.name);
    }
  }, [albumIdValue]);

  const onUpdate = async (values: AlbumValuesType) => {
    setIsLoading(true);

    const payload: AlbumResult = {
      name: values.name,
    };

    const albumRef = doc(
      firebaseDB,
      DatabaseTableKeys.Albums,
      values.albumId ?? albumId!
    );

    if (values.albumId) {
      const album = albums?.find((a) => a.id === albumIdValue)!;
      const images = album.images!.filter((img) =>
        selectedImages.every((i) => i.id !== img.id)
      );

      payload.images = [...images, ...selectedImages];
    }

    try {
      await updateDoc(albumRef, payload);

      message.success("Álbum atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      message.error("Houve um erro ao tentar atualizar o álbum.");
    }

    setIsLoading(false);
    onCancel();
    queryClient.refetchQueries();
  };

  const onCreate = async (values: AlbumValuesType) => {
    setIsLoading(true);

    const payload: AlbumResult = {
      name: values.name,
      images: selectedImages,
    };

    try {
      await addDoc(collection(firebaseDB, DatabaseTableKeys.Albums), payload);

      message.success("Álbum criado com sucesso!");
    } catch (error) {
      console.error(error);
      message.error("Houve um erro ao tentar criar o álbum.");
    }

    setIsLoading(false);
    onCancel();
    queryClient.refetchQueries();
  };

  const onCancel = () => {
    form.resetFields();
    toogleAlbumModal(false);
    updateSelectedImages([]);
    updateMode("default");
  };

  return (
    <Modal
      open={albumModalOpen}
      onOk={() => form.submit()}
      onCancel={onCancel}
      title={album || albumIdValue ? "Editar álbum" : "Criar álbum"}
      okText="Gravar"
      className="album__modal"
      zIndex={1300}
      okButtonProps={{ loading: isLoading }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={album || albumIdValue ? onUpdate : onCreate}
      >
        <Form.Item name="name" label="Nome do álbum" rules={requiredRules}>
          <Input placeholder="Digite o nome do álbum..." />
        </Form.Item>

        {!albumId && (
          <Form.Item name="albumId" label="Adicionar ao álbum">
            <Select placeholder="Selecione o álbum..." options={options} />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};
