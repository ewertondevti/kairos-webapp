import firebaseDB, { firebaseStorage } from "@/firebase";
import { QueryNames } from "@/react-query/queryNames";
import { InboxOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { message, Modal, Upload, UploadFile, UploadProps } from "antd";
import { addDoc, collection } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
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

  const refresh = () =>
    queryClient.refetchQueries({ queryKey: [QueryNames.GetImages] });

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  const onSave = async () => {
    setIsLoading(true);
    setFileList((state) =>
      state.map((file) => ({ ...file, status: "uploading", percent: 0 }))
    );

    const newProgress: number[] = new Array(fileList.length).fill(0);

    fileList.forEach((file, idx) => {
      const storageRef = ref(firebaseStorage, `images/${file.name}`);
      const uploadTask = uploadBytesResumable(
        storageRef,
        file.originFileObj as File
      );

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const percent =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          newProgress[idx] = percent;

          const status = percent === 100 ? "done" : "uploading";

          setFileList((state) =>
            state.map((file, index) => {
              if (idx === index) return { ...file, percent, status };
              return file;
            })
          );
        },
        (error) => {
          message.error(
            `Erro ao fazer upload do arquivo ${file.name}: ${error.message}`,
            5
          );
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(firebaseDB, "images"), {
            url: downloadURL,
            name: file.name,
          });

          if (idx === fileList.length - 1) {
            setIsLoading(false);
            setFileList([]);

            refresh();
            onCancel();

            message.success("Upload completo!", 3);
          }
        }
      );
    });
  };

  return (
    <Modal
      title="Adicionar imagem(s)"
      open={isOpen}
      onCancel={onCancel}
      onOk={onSave}
      destroyOnClose
      okText="Gravar"
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
