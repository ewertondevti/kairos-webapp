import firebaseDB, { firebaseStorage } from "@/firebase";
import { FileType } from "@/types/app";
import { getBase64 } from "@/utils/app";
import { InboxOutlined } from "@ant-design/icons";
import { Image, Modal, Upload, UploadFile, UploadProps } from "antd";
import { addDoc, collection } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { FC, useState } from "react";

type Props = {
  isOpen: boolean;
  onCancel: () => void;
};

export const AddImagesModal: FC<Props> = ({ isOpen, onCancel }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  const customUpload = async ({ file, onSuccess, onError }: any) => {
    try {
      const storageRef = ref(firebaseStorage, `images/${file.name}`);
      await uploadBytes(storageRef, file);

      const downloadURL = await getDownloadURL(storageRef);

      await addDoc(collection(firebaseDB, "images"), {
        url: downloadURL,
        name: file.name,
      });

      onSuccess("Ok");
    } catch (error) {
      onError(error);
      console.error(error);
    }
  };

  return (
    <Modal title="Adicionar imagen(s)" open={isOpen} onCancel={onCancel}>
      <Upload
        customRequest={customUpload}
        type="drag"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        multiple
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

      {previewImage && (
        <Image
          wrapperStyle={{ display: "none" }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(""),
          }}
          src={previewImage}
        />
      )}
    </Modal>
  );
};
