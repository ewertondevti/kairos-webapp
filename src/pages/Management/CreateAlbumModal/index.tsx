import { DatabaseTableKeys } from "@/enums/app";
import { useGetListItemSize } from "@/hooks/app";
import { QueryNames } from "@/react-query/queryNames";
import { createAlbum } from "@/services/albumServices";
import { deleteUploadedImage, onImageUpload } from "@/services/commonServices";
import { UploadCommonResponse } from "@/types/event";
import { IAlbum } from "@/types/store";
import { requiredRules } from "@/utils/app";
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
  Form,
  Input,
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
import "./CreateAlbumModal.scss";

const { Text } = Typography;

type Props = {
  isOpen: boolean;
  onCancel: () => void;
};

export const CreateAlbumModal: FC<Props> = ({ isOpen, onCancel }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { height, width } = useGetListItemSize();

  const refresh = () =>
    queryClient.refetchQueries({ queryKey: [QueryNames.GetAlbums] });

  const onRemove = (file: UploadFile) => {
    setFileList((state) => state.filter((f) => f.uid !== file.uid));

    deleteUploadedImage(`${DatabaseTableKeys.Images}/${file.name}`).catch(
      (error) => console.error(error)
    );
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onCancel();
  };

  const onSave = async (values: { name: string }) => {
    setIsLoading(true);

    const payload: IAlbum = {
      ...values,
      images: fileList.map(({ name, response }) => ({
        name,
        url: (response as UploadCommonResponse).url,
      })),
    };

    createAlbum(payload)
      .then(() => {
        message.success("Álbum criado com sucesso!", 3);
        setFileList([]);
        refresh();
        onCancel();
      })
      .catch(() => {
        message.error("Houve um erro ao tentar criar álbum.");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <Modal
      title="Criar álbum"
      open={isOpen}
      onCancel={isLoading ? undefined : handleCancel}
      onOk={() => form.submit()}
      destroyOnClose
      okText="Gravar"
      okButtonProps={{ loading: isLoading }}
      cancelButtonProps={{ disabled: isLoading }}
      className="album__modal-create"
    >
      <Form form={form} layout="vertical" onFinish={onSave}>
        <Form.Item name="name" label="Nome do álbum" rules={requiredRules}>
          <Input placeholder="Digite o nome do álbum..." />
        </Form.Item>

        <Form.Item>
          <Upload
            type="drag"
            showUploadList={false}
            customRequest={onImageUpload(DatabaseTableKeys.Images)}
            onChange={handleChange}
            multiple
            maxCount={30}
            className="upload-images"
            accept="image/x-adobe-dng"
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Clique ou arraste a(s) imagen(s) para esta área
            </p>
            <p className="ant-upload-hint">
              Pode selecionar até 30 imagens ao mesmo tempo.
            </p>
            <p className="ant-upload-hint">
              (Suporta apenas imagens do tipo PNG, JPG, JPEG)
            </p>
          </Upload>

          <Form.Item>
            <Text>
              Imagens selecionadas:&nbsp;
              <i>
                <b>{fileList.length}</b>
              </i>
            </Text>
          </Form.Item>

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
                            onClick={() => onRemove(item)}
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
        </Form.Item>
      </Form>
    </Modal>
  );
};
