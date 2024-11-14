import { DatabaseTableKeys } from "@/enums/app";
import firebaseDB, { firebaseStorage } from "@/firebase";
import { useGetListItemSize } from "@/hooks/app";
import { QueryNames } from "@/react-query/queryNames";
import { IAlbumDTO, IImageDTO } from "@/types/store";
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
import { addDoc, collection } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
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

  const onRemove = (uid: string) =>
    setFileList((state) => state.filter((file) => file.uid !== uid));

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onCancel();
  };

  const onSave = async (values: { name: string }) => {
    setIsLoading(true);
    setFileList((state) =>
      state.map((file) => ({ ...file, status: "uploading", percent: 0 }))
    );

    const images: IImageDTO[] = [];
    const newProgress: number[] = new Array(fileList.length).fill(0);

    fileList.forEach((file, idx) => {
      const storageRef = ref(
        firebaseStorage,
        `${DatabaseTableKeys.AllPhotos}/${file.name}`
      );

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
          console.error(
            `Erro ao fazer upload do arquivo ${file.name}: ${error.message}`,
            5
          );
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          images.push({
            name: file.name,
            url: downloadURL,
          });

          if (images.length === fileList.length) {
            const payload: Partial<IAlbumDTO> = {
              name: values.name,
              images,
            };

            try {
              await addDoc(
                collection(firebaseDB, DatabaseTableKeys.Albums),
                payload
              );

              refresh();
              handleCancel();
              message.success("Álbum criado com sucesso!");
            } catch (error) {
              console.error(error);
              message.error("Houve um erro ao tentar criar o álbum.");
            } finally {
              setIsLoading(false);
            }
          }
        }
      );
    });
  };

  return (
    <Modal
      title="Criar álbum"
      open={isOpen}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      destroyOnClose
      okText="Gravar"
      okButtonProps={{ loading: isLoading }}
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
            onChange={handleChange}
            beforeUpload={() => false}
            multiple
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
              Pode selecionar uma ou várias imagens ao mesmo tempo.
            </p>
            <p className="ant-upload-hint">
              (Suporta apenas imagens do tipo PNG, JPG, JPEG)
            </p>
          </Upload>

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
        </Form.Item>
      </Form>
    </Modal>
  );
};
