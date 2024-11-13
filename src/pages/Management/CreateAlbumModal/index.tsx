import { DatabaseTableKeys } from "@/enums/app";
import firebaseDB, { firebaseStorage } from "@/firebase";
import { QueryNames } from "@/react-query/queryNames";
import { AlbumResult, ImageResult } from "@/types/store";
import { requiredRules } from "@/utils/app";
import { InboxOutlined, PaperClipOutlined } from "@ant-design/icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Flex,
  Form,
  Input,
  List,
  message,
  Modal,
  Skeleton,
  Upload,
  UploadFile,
  UploadProps,
} from "antd";
import { addDoc, collection } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { FC, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import "./CreateAlbumModal.scss";

type Props = {
  isOpen: boolean;
  onCancel: () => void;
};

export const CreateAlbumModal: FC<Props> = ({ isOpen, onCancel }) => {
  const [data, setData] = useState<UploadFile[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const refresh = () =>
    queryClient.refetchQueries({ queryKey: [QueryNames.GetAlbums] });

  const getMoreImages = () => setData(fileList.slice(0, data.length + 10));

  const onRemove = (uid: string) => {
    setFileList((state) => state.filter((file) => file.uid !== uid));
    setData((state) => state.filter((file) => file.uid !== uid));
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    setData(newFileList.slice(0, 10));
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setData([]);
    onCancel();
  };

  const onSave = async (values: { name: string }) => {
    setIsLoading(true);
    setFileList((state) =>
      state.map((file) => ({ ...file, status: "uploading", percent: 0 }))
    );

    const images: ImageResult[] = [];
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

          if (idx === fileList.length - 1) {
            const payload: AlbumResult = {
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
      loading={isLoading}
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

          {!!data.length && (
            <div id="scrollableDiv">
              <InfiniteScroll
                dataLength={data.length}
                next={getMoreImages}
                hasMore={data.length < fileList.length && !isLoading}
                loader={<Skeleton.Input active block />}
                scrollableTarget="scrollableDiv"
              >
                <List
                  dataSource={data}
                  size="small"
                  renderItem={(item) => (
                    <List.Item key={item.uid}>
                      <Flex justify="space-between" flex={1}>
                        <Flex gap={8} align="center">
                          <PaperClipOutlined />
                          {item.name}
                        </Flex>

                        <Button
                          type="text"
                          icon={<FontAwesomeIcon icon={faTrash} />}
                          onClick={() => onRemove(item.uid)}
                        />
                      </Flex>
                    </List.Item>
                  )}
                />
              </InfiniteScroll>
            </div>
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};
