import { DatabaseTableKeys } from "@/enums/app";
import firebaseDB from "@/firebase";
import { useGetListItemSize } from "@/hooks/app";
import { useGetAlbums } from "@/react-query";
import { deleteUploadedImage, onImageUpload } from "@/services/commonServices";
import { useAppState } from "@/store";
import { AlbumValuesType } from "@/types/album";
import { IAlbumDTO } from "@/types/store";
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
import { doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FixedSizeList } from "react-window";
import "./EditAlbumModal.scss";

const { Text } = Typography;

export const EditAlbumModal = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [form] = Form.useForm();
  const { id: albumId } = useParams();
  const queryClient = useQueryClient();
  const { height, width } = useGetListItemSize();

  const { data: albums } = useGetAlbums();

  const albumIdValue = Form.useWatch("albumId", form);

  const album = albums?.find((a) => a.id === albumId);

  const {
    editAlbumOpen,
    selectedImages,
    toogleEditAlbumModal,
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
  }, [album, form]);

  useEffect(() => {
    if (albumIdValue && albums) {
      const album = albums.find((a) => a.id === albumIdValue)!;
      form.setFieldValue("name", album.name);
    }
  }, [albumIdValue, albums, form]);

  const onRemove = (file: UploadFile) => {
    setFileList((state) => state.filter((f) => f.uid !== file.uid));

    deleteUploadedImage(`${DatabaseTableKeys.Images}/${file.name}`).catch(
      (error) => console.error(error)
    );
  };

  const onUpdate = async (values: AlbumValuesType) => {
    setIsLoading(true);

    const payload: Partial<IAlbumDTO> = {
      name: values.name,
      images: values.images,
    };

    if (albumId) {
      const albumRef = doc(firebaseDB, DatabaseTableKeys.Albums, albumId!);

      const album = albums?.find((a) => a.id === albumIdValue);
      const images =
        album?.images!.filter((img) =>
          selectedImages.every((i) => i.url !== img.url)
        ) ?? [];

      payload.images = [...images, ...selectedImages];

      try {
        await updateDoc(albumRef, payload);
        onCancel();
        queryClient.refetchQueries();
        message.success("Álbum atualizado com sucesso!");
      } catch (error) {
        console.error(error);
        message.error("Houve um erro ao tentar atualizar o álbum.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  const onCancel = () => {
    form.resetFields();
    toogleEditAlbumModal(false);
    updateSelectedImages([]);
    updateMode("default");
  };

  return (
    <Modal
      open={editAlbumOpen}
      onOk={() => form.submit()}
      onCancel={onCancel}
      title="Editar álbum"
      okText="Gravar"
      className="album__modal"
      zIndex={1300}
      okButtonProps={{ loading: isLoading }}
    >
      <Form form={form} layout="vertical" onFinish={onUpdate}>
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
