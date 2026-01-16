"use client";

import { DatabaseTableKeys } from "@/enums/app";
import { useGetListItemSize } from "@/hooks/app";
import { useUploadQueue } from "@/hooks/useUploadQueue";
import { UploadQueueItem } from "@/hooks/useUploadQueue.types";
import { useGetAlbumById } from "@/react-query";
import { QueryNames } from "@/react-query/queryNames";
import { updateAlbum } from "@/services/albumServices";
import { deleteUploadedImage } from "@/services/commonServices";
import { useAppState } from "@/store";
import { AlbumValuesType } from "@/types/album";
import { IAlbumUpdatePayload } from "@/types/store";
import { requiredRules } from "@/utils/app";
import { formatBytes, getUploadFileName, getUploadUrl } from "@/utils/upload";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  InboxOutlined,
  LoadingOutlined,
  PaperClipOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Flex,
  Form,
  Grid,
  Input,
  message,
  Modal,
  Progress,
  Typography,
  Upload,
  UploadProps,
} from "antd";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { List, type RowComponentProps } from "react-window";

const { Text } = Typography;

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILES = 500;
const MAX_CONCURRENCY = 4;

type UploadRowProps = {
  items: UploadQueueItem[];
  onRemove: (itemId: string) => void;
  onRetry: (itemId: string) => void;
};

const UploadRow = ({
  index,
  style,
  items,
  onRemove,
  onRetry,
}: RowComponentProps<UploadRowProps>) => {
  const item = items[index];
  const isUploading = item.status === "uploading";
  const isSuccess = item.status === "success";
  const isError = item.status === "error";

  return (
    <Flex
      justify="space-between"
      align="center"
      flex={1}
      style={style}
      className="ant-upload-list-item-container"
    >
      <Flex className="ant-upload-list-item w-full" align="center" gap={8}>
        <Flex className="ant-upload-icon">
          {isUploading && <LoadingOutlined />}
          {isSuccess && <CheckCircleOutlined className="text-green-500" />}
          {isError && <ExclamationCircleOutlined className="text-red-500" />}
          {!isUploading && !isSuccess && !isError && <PaperClipOutlined />}
        </Flex>

        <Flex vertical className="min-w-0 flex-1">
          <Text className="ant-upload-list-item-name truncate" title={item.name}>
            {item.name}
          </Text>
          <Text className="text-xs text-gray-500">{formatBytes(item.size)}</Text>
        </Flex>

        <Flex align="center" gap={4}>
          {isError && (
            <Button
              type="text"
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => onRetry(item.id)}
              className="ant-upload-list-item-action"
              aria-label="Reenviar"
            />
          )}
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => onRemove(item.id)}
            className="ant-upload-list-item-action"
            disabled={isUploading}
            aria-label="Remover"
          />
        </Flex>
      </Flex>

      {item.progress > 0 && item.progress < 100 && (
        <Flex className="ant-upload-list-item-progress">
          <Progress percent={item.progress} showInfo={false} size={{ height: 2 }} />
        </Flex>
      )}
    </Flex>
  );
};

export const EditAlbumModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const limitWarningShownRef = useRef(false);
  const typeWarningShownRef = useRef(false);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const [form] = Form.useForm();
  const params = useParams();
  const albumId = params?.id as string | undefined;
  const queryClient = useQueryClient();
  const { height, width } = useGetListItemSize();
  const {
    items,
    addFiles,
    removeItem,
    retryItem,
    clearAll,
    stats,
    totalProgress,
    hasActiveUploads,
    hasErrors,
  } = useUploadQueue({
    concurrency: MAX_CONCURRENCY,
    maxFiles: MAX_FILES,
    acceptedTypes: ACCEPTED_TYPES,
  });

  const { data: album } = useGetAlbumById(albumId, {
    enabled: !!albumId,
    limit: 1,
  });

  const {
    editAlbumOpen,
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


  const handleRemoveItem = async (itemId: string) => {
    const target = items.find((item) => item.id === itemId);
    if (target?.status === "success") {
      try {
        const responseName = getUploadFileName(target.response);
        const fileName = responseName || target.name;
        await deleteUploadedImage(`${DatabaseTableKeys.Images}/${fileName}`);
      } catch (error) {
        console.error(error);
      }
    }
    removeItem(itemId);
  };

  const onUpdate = async (values: AlbumValuesType) => {
    if (hasActiveUploads) {
      message.warning("Aguarde o término dos uploads antes de gravar.");
      return;
    }

    if (hasErrors) {
      message.error("Existem uploads com erro. Remova ou tente novamente.");
      return;
    }

    setIsLoading(true);

    const uploadedImages = items
      .filter((item) => item.status === "success")
      .map((item) => {
        const responseName = getUploadFileName(item.response);
        const fileName = responseName || item.name;
        return {
          name: fileName,
          storagePath: `${DatabaseTableKeys.Images}/${fileName}`,
          url: getUploadUrl(item.response),
        };
      })
      .filter((item) => item.url);

    const payload: IAlbumUpdatePayload = {
      id: albumId,
      name: values.name,
      images: uploadedImages.map((image) => ({
        name: image.name,
        storagePath: image.storagePath,
      })),
    };

    updateAlbum(payload)
      .then(() => {
        onCancel();
        queryClient.refetchQueries({ queryKey: [QueryNames.GetAlbumById] });
        message.success("Álbum atualizado com sucesso!");
      })
      .catch((error) => {
        console.error(error);
        message.error("Erro ao tentar atualizar álbum!");
      });
  };

  const handleBeforeUpload: UploadProps["beforeUpload"] = (file) => {
    const result = addFiles([file]);

    if (result.rejectedByType && !typeWarningShownRef.current) {
      typeWarningShownRef.current = true;
      message.warning("Alguns arquivos foram ignorados por tipo inválido.");
    }

    if (result.rejectedByLimit && !limitWarningShownRef.current) {
      limitWarningShownRef.current = true;
      message.warning("Limite de 500 imagens atingido.");
    }

    return false;
  };

  const onCancel = () => {
    form.resetFields();
    toogleEditAlbumModal(false);
    updateSelectedImages([]);
    updateMode("default");
    clearAll();
    limitWarningShownRef.current = false;
    typeWarningShownRef.current = false;
  };

  return (
    <Modal
      open={editAlbumOpen}
      onOk={() => form.submit()}
      onCancel={onCancel}
      title="Editar álbum"
      okText="Gravar"
      className=""
      zIndex={1300}
      okButtonProps={{ loading: isLoading }}
      width={isMobile ? "100%" : 720}
      style={isMobile ? { top: 12 } : undefined}
      styles={{
        body: isMobile
          ? { maxHeight: "calc(100vh - 160px)", overflowY: "auto" }
          : undefined,
      }}
    >
      <Form form={form} layout="vertical" onFinish={onUpdate}>
        <Form.Item name="name" label="Nome do álbum" rules={requiredRules}>
          <Input placeholder="Digite o nome do álbum..." />
        </Form.Item>

        <Form.Item>
          <Upload
            type="drag"
            showUploadList={false}
            beforeUpload={handleBeforeUpload}
            multiple
            className="upload-images"
            accept={ACCEPTED_TYPES.join(",")}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Clique ou arraste a(s) imagen(s) para esta área
            </p>
            <p className="ant-upload-hint">
              Suporta até 500 imagens por álbum, com uploads paralelos otimizados.
            </p>
            <p className="ant-upload-hint">
              (Suporta PNG, JPG, JPEG e WEBP)
            </p>
          </Upload>

          <Form.Item className="mb-0">
            <Flex justify="space-between" align="center" className="mt-2">
              <Text>
                Imagens selecionadas:&nbsp;
                <i>
                  <b>{stats.total}</b>
                </i>
              </Text>
              <Text className="text-xs text-gray-500">
                {stats.success} concluídas · {stats.uploading} em envio · {stats.error} erro(s)
              </Text>
            </Flex>
            {!!stats.total && (
              <Progress
                percent={totalProgress}
                size={{ height: 4 }}
                showInfo={false}
                className="mt-2"
              />
            )}
          </Form.Item>

          {!!items.length && (
            <Text className="ant-upload-wrapper upload-images">
              <List
                rowComponent={UploadRow}
                rowCount={items.length}
                rowHeight={44}
                rowProps={{
                  items,
                  onRemove: handleRemoveItem,
                  onRetry: retryItem,
                }}
                className="ant-upload-list ant-upload-list-text"
                style={{ height, width, marginTop: 10 }}
              />
            </Text>
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};
