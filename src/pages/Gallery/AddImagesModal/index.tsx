import firebaseDB from "@/firebase";
import { QueryNames } from "@/react-query/queryNames";
import { getBase64, removeBase64Prefix } from "@/utils/app";
import { InboxOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { message, Modal, Upload, UploadFile, UploadProps } from "antd";
import { RcFile } from "antd/es/upload";
import { addDoc, collection } from "firebase/firestore";
import { FC, useState } from "react";
import "./AddImagesModal.scss";

type Props = {
  isOpen: boolean;
  onCancel: () => void;
};

export const AddImagesModal: FC<Props> = ({ isOpen, onCancel }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  const onSave = async () => {
    setIsLoading(true);

    const newBase64fileList = await Promise.all(
      fileList.map((file) => getBase64(file.originFileObj as RcFile))
    ).then((res) =>
      res.map((r) => ({ ...r, image: removeBase64Prefix(r.image) }))
    );

    try {
      await Promise.all(
        newBase64fileList.map(async (img) => {
          await addDoc(collection(firebaseDB, "images"), img);
        })
      );

      onCancel();
      message.success("Imagen(s) adicionada(s) com sucesso!");
      queryClient.refetchQueries({ queryKey: [QueryNames.GetImages] });
    } catch (error) {
      console.error(error);
    }

    setIsLoading(false);
  };

  return (
    <Modal
      title="Adicionar imagen(s)"
      open={isOpen}
      onCancel={onCancel}
      onOk={onSave}
      destroyOnClose
      okText="Guardar"
      okButtonProps={{ loading: isLoading }}
    >
      <Upload
        type="drag"
        listType="picture"
        fileList={fileList}
        onChange={handleChange}
        beforeUpload={() => false}
        multiple
        className="upload-images"
        accept="image/png, image/jpeg"
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Clique ou arraste a(s) imagen(s) para esta área
        </p>
        <p className="ant-upload-hint">
          Pode selecionar uma ou várias imagens ao mesmo tempo.
        </p>
        <p className="ant-upload-hint">
          (Suporta apenas imagens do tipo PNG, JPG, JPEG)
        </p>
      </Upload>
    </Modal>
  );
};
