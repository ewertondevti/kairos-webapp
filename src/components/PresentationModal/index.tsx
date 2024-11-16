import { DatabaseTableKeys } from "@/enums/app";
import { useGetListItemSize } from "@/hooks/app";
import { QueryNames } from "@/react-query/queryNames";
import { onImageUpload, onRemoveImage } from "@/services/commonServices";
import { createPresentations } from "@/services/presentationServices";
import { UploadCommonResponse } from "@/types/event";
import { CreateCommonPayload } from "@/types/store";
import {
  DeleteOutlined,
  InboxOutlined,
  LoadingOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Flex,
  message,
  Modal,
  Progress,
  Typography,
  Upload,
  UploadFile,
  UploadProps,
} from "antd";
import { FC, useState } from "react";
import { FixedSizeList } from "react-window";

const { Text } = Typography;

type Props = {
  isOpen: boolean;
  onCancel: () => void;
};

export const PresentationModal: FC<Props> = ({ isOpen, onCancel }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();

  const { height, width } = useGetListItemSize();

  const refresh = () =>
    queryClient.refetchQueries({ queryKey: [QueryNames.GetPresentations] });

  const onRemove = (uid: string) =>
    setFileList((state) => state.filter((file) => file.uid !== uid));

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  const handleCancel = () => {
    setFileList([]);
    onCancel();
  };

  const onUpload = async () => {
    setIsLoading(true);

    const payload: CreateCommonPayload = {
      images: fileList.map(({ name, response }) => ({
        name,
        url: (response as UploadCommonResponse).url,
      })),
    };

    createPresentations(payload)
      .then(() => {
        message.success("Fotos adicionadas com sucesso á apresentação!", 3);
        setFileList([]);
        refresh();
        onCancel();
      })
      .catch(() => {
        message.error(
          "Houve um erro ao tentar adicionar imagens á apresentação."
        );
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <Modal
      title="Adicionar apresentação"
      open={isOpen}
      onCancel={isLoading ? undefined : handleCancel}
      onOk={onUpload}
      destroyOnClose
      okText="Gravar"
      okButtonProps={{ loading: isLoading }}
      cancelButtonProps={{ disabled: isLoading }}
    >
      <Upload
        type="drag"
        customRequest={onImageUpload(DatabaseTableKeys.Presentations)}
        showUploadList={false}
        onChange={handleChange}
        onRemove={onRemoveImage(DatabaseTableKeys.Presentations)}
        multiple
        className="upload-images"
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

      <Text>
        Imagens selecionadas:&nbsp;
        <i>
          <b>{fileList.length}</b>
        </i>
      </Text>

      {!!fileList.length && (
        <Text className="ant-upload-wrapper upload-images">
          <FixedSizeList
            height={height}
            width={width}
            itemCount={fileList.length}
            itemSize={30}
            style={{ marginTop: 10 }}
            className="ant-upload-list ant-upload-list-text"
          >
            {({ index, style }) => {
              const item = fileList[index];

              return (
                <Flex
                  justify="space-between"
                  align="center"
                  flex={1}
                  style={style}
                  className="ant-upload-list-item-container"
                >
                  <Flex
                    className={`ant-upload-list-item ant-upload-list-item-${item.status} width-100perc`}
                  >
                    <Flex className="ant-upload-icon">
                      {item.status === "uploading" && <LoadingOutlined />}

                      {item.status !== "uploading" && <PaperClipOutlined />}
                    </Flex>

                    <Text
                      className="ant-upload-list-item-name"
                      title={item.name}
                    >
                      {item.name}
                    </Text>

                    <Text className="ant-upload-list-item-actions">
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => onRemove(item.uid)}
                        className="ant-upload-list-item-action"
                      />
                    </Text>

                    {!!item.percent && item.percent < 100 && (
                      <Flex className="ant-upload-list-item-progress">
                        <Progress
                          percent={item.percent}
                          showInfo={false}
                          size={{ height: 2 }}
                        />
                      </Flex>
                    )}
                  </Flex>
                </Flex>
              );
            }}
          </FixedSizeList>
        </Text>
      )}
    </Modal>
  );
};
