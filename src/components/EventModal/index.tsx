import { DatabaseTableKeys } from "@/enums/app";
import { QueryNames } from "@/react-query/queryNames";
import { onImageUpload, onRemoveImage } from "@/services/commonServices";
import { createEvents } from "@/services/eventServices";
import { UploadCommonResponse } from "@/types/event";
import { CreateCommonPayload } from "@/types/store";
import { InboxOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { message, Modal, Upload, UploadFile, UploadProps } from "antd";
import { FC, useState } from "react";

type Props = {
  isOpen: boolean;
  onCancel: () => void;
};

export const EventModal: FC<Props> = ({ isOpen, onCancel }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();

  const refresh = () =>
    queryClient.refetchQueries({ queryKey: [QueryNames.GetEvents] });

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  const onSave = async () => {
    setIsLoading(true);

    const payload: CreateCommonPayload = {
      images: fileList.map((file) => ({
        name: file.name,
        url: (file.response as UploadCommonResponse).url,
      })),
    };

    createEvents(payload)
      .then(() => {
        message.success("Evento(s) criado com sucesso!", 3);
        setFileList([]);
        refresh();
        onCancel();
      })
      .catch(() => {
        message.error("Houve um erro ao tentar criar evento(s).");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <Modal
      title="Apresentação"
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
        customRequest={onImageUpload(DatabaseTableKeys.Events)}
        fileList={fileList}
        onChange={handleChange}
        onRemove={onRemoveImage(DatabaseTableKeys.Events)}
        multiple
        maxCount={100}
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
          Pode selecionar até&nbsp;
          <i>
            <b style={{ color: "green" }}>100</b>
          </i>
          &nbsp;imagens ao mesmo tempo.
        </p>
        <p className="ant-upload-hint">
          (Suporta apenas imagens do tipo PNG, JPG, JPEG)
        </p>
      </Upload>
    </Modal>
  );
};
