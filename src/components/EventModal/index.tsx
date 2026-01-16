import { DatabaseTableKeys } from "@/enums/app";
import { QueryNames } from "@/react-query/queryNames";
import { onImageUpload, onRemoveImage } from "@/services/commonServices";
import { createEvents } from "@/services/eventServices";
import { UploadCommonResponse } from "@/types/event";
import { CreateCommonPayload } from "@/types/store";
import { getUploadUrl } from "@/utils/upload";
import { InboxOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { Grid, message, Modal, Upload, UploadFile, UploadProps } from "antd";
import { FC, useState } from "react";

type Props = {
  isOpen: boolean;
  onCancel: () => void;
};

export const EventModal: FC<Props> = ({ isOpen, onCancel }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

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
        url: getUploadUrl(file.response as UploadCommonResponse | undefined),
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
      onCancel={isLoading ? undefined : onCancel}
      onOk={onSave}
      destroyOnHidden
      okText="Gravar"
      okButtonProps={{ loading: isLoading }}
      width={isMobile ? "100%" : 720}
      style={isMobile ? { top: 12 } : undefined}
      styles={{
        body: isMobile
          ? { maxHeight: "calc(100vh - 160px)", overflowY: "auto" }
          : undefined,
      }}
    >
      <Upload
        type="drag"
        listType="picture"
        customRequest={onImageUpload(DatabaseTableKeys.Events)}
        fileList={fileList}
        onChange={handleChange}
        onRemove={onRemoveImage(DatabaseTableKeys.Events)}
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
