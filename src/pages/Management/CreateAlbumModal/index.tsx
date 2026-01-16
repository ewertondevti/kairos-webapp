import { DatabaseTableKeys } from "@/enums/app";
import { useGetListItemSize } from "@/hooks/app";
import { useUploadQueue, type UploadQueueItem } from "@/hooks/useUploadQueue";
import { QueryNames } from "@/react-query/queryNames";
import { createAlbum } from "@/services/albumServices";
import { deleteUploadedImage } from "@/services/commonServices";
import { IAlbumPayload } from "@/types/store";
import { requiredRules } from "@/utils/app";
import { formatBytes, getUploadUrl } from "@/utils/upload";
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
  DatePicker,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Progress,
  Typography,
  Upload,
  UploadProps,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/pt-br";
import { FC, useMemo, useRef, useState } from "react";
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

dayjs.locale("pt-br");

type Props = {
  isOpen: boolean;
  onCancel: () => void;
};

export const CreateAlbumModal: FC<Props> = ({ isOpen, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastAutoTitle, setLastAutoTitle] = useState<string | null>(null);
  const [isTitleTouched, setIsTitleTouched] = useState(false);
  const limitWarningShownRef = useRef(false);
  const typeWarningShownRef = useRef(false);

  const [form] = Form.useForm();
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

  const refresh = () =>
    queryClient.refetchQueries({ queryKey: [QueryNames.GetAlbums] });

  const formatEventTitle = (date: Dayjs) => {
    const formatted = new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date.toDate());

    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
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

  const uploadedImages = useMemo(
    () =>
      items
        .filter((item) => item.status === "success")
        .map((item) => ({
          name: item.name,
          url: getUploadUrl(item.response),
        }))
        .filter((item) => item.url),
    [items]
  );

  const handleRemoveItem = async (itemId: string) => {
    const target = items.find((item) => item.id === itemId);
    if (target?.status === "success") {
      try {
        await deleteUploadedImage(`${DatabaseTableKeys.Images}/${target.name}`);
      } catch (error) {
        console.error(error);
      }
    }
    removeItem(itemId);
  };

  const handleCancel = () => {
    form.resetFields();
    clearAll();
    limitWarningShownRef.current = false;
    typeWarningShownRef.current = false;
    setIsTitleTouched(false);
    setLastAutoTitle(null);
    onCancel();
  };

  const onSave = async (values: { name: string; eventDate?: Dayjs }) => {
    if (hasActiveUploads) {
      message.warning("Aguarde o término dos uploads antes de gravar.");
      return;
    }

    if (hasErrors) {
      message.error("Existem uploads com erro. Remova ou tente novamente.");
      return;
    }

    setIsLoading(true);

    const payload: IAlbumPayload = {
      name: values.name,
      eventDate: values.eventDate?.toISOString(),
      images: uploadedImages.map((image) => ({ name: image.name })),
    };

    await createAlbum(payload)
      .then(() => {
        message.success("Álbum criado com sucesso!", 3);
        refresh();
        handleCancel();
      })
      .catch((error) => {
        console.error(error);
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
      confirmLoading={isLoading}
      cancelButtonProps={{ disabled: isLoading }}
      className=""
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSave}
        className="flex flex-col gap-4"
      >
        <Form.Item
          name="eventDate"
          label="Data do evento"
          rules={requiredRules}
        >
          <DatePicker
            className="w-full"
            placeholder="Selecione a data do evento"
            format="DD/MM/YYYY"
            onChange={(date) => {
              if (!date) return;
              const title = formatEventTitle(date);
              const previousAutoTitle = lastAutoTitle;
              setLastAutoTitle(title);

              if (!isTitleTouched || form.getFieldValue("name") === previousAutoTitle) {
                form.setFieldValue("name", title);
                setIsTitleTouched(false);
              }
            }}
          />
        </Form.Item>

        <Form.Item name="name" label="Título do álbum" rules={requiredRules}>
          <Input
            placeholder="Digite o título do álbum..."
            onChange={(event) => {
              const value = event.target.value;
              if (value !== lastAutoTitle) {
                setIsTitleTouched(true);
              }
            }}
          />
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

export default CreateAlbumModal;
