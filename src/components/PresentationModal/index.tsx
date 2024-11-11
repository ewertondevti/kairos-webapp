import { DatabaseTableKeys } from "@/enums/app";
import firebaseDB from "@/firebase";
import { useGetImages, useGetPresentations } from "@/react-query";
import { useAppState } from "@/store";
import { ImageResult } from "@/types/store";
import { useQueryClient } from "@tanstack/react-query";
import {
  Checkbox,
  Col,
  Flex,
  Image,
  message,
  Modal,
  Row,
  Skeleton,
  Typography,
} from "antd";
import { addDoc, collection, deleteDoc, doc } from "firebase/firestore";
import { FC, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import "./PresentationModal.scss";

const { Text } = Typography;

type Props = {
  isOpen: boolean;
  onCancel: () => void;
};

export const PresentationModal: FC<Props> = ({ isOpen, onCancel }) => {
  const [images, setImages] = useState<ImageResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();

  const { data } = useGetImages();
  const { data: presentations } = useGetPresentations();
  const { selectedImages, updateSelectedImages } = useAppState();

  useEffect(() => {
    if (data) {
      setImages(data.slice(0, images.length + 20));
    }

    return () => {
      setImages([]);
    };
  }, [data]);

  useEffect(() => {
    if (presentations && isOpen) {
      updateSelectedImages(presentations);
    }
  }, [presentations, isOpen]);

  const cleanSelection = () => {
    onCancel();
    updateSelectedImages([]);
  };

  const getMoreImages = () =>
    data && setImages(data.slice(0, images.length + 20));

  const onSave = async () => {
    setIsLoading(true);

    const images2delete =
      presentations?.filter((img) =>
        selectedImages.every((i) => i.id !== img.id)
      ) ?? [];

    const newImages = selectedImages.filter((img) =>
      presentations?.every((i) => i.id !== img.id)
    );

    await Promise.all([
      ...newImages.map(async ({ name, url }) => {
        const payload: ImageResult = { name, url };
        return await addDoc(
          collection(firebaseDB, DatabaseTableKeys.Presentations),
          payload
        );
      }),
      ...images2delete.map(
        async ({ id }) =>
          await deleteDoc(doc(firebaseDB, DatabaseTableKeys.Presentations, id!))
      ),
    ])
      .then(() => {
        message.success("Foto(s) adicionada(s) a apresentação!");
        queryClient.refetchQueries();
        cleanSelection();
      })
      .catch((error) => {
        console.error(error);
        message.error(
          "Houve um erro ao tentar adicionar fotos a apresentação."
        );
      })
      .finally(() => setIsLoading(false));
  };

  const onSelect = (url: string) => () => {
    const { id, name } = data?.find((img) => img.url === url)!;

    if (selectedImages.some((img) => img.url === url)) {
      updateSelectedImages(selectedImages.filter((img) => img.url !== url));
    } else if (selectedImages.length < 10) {
      updateSelectedImages([...selectedImages, { url, id, name }]);
    }
  };

  return (
    <Modal
      title="Apresentação"
      open={isOpen}
      onCancel={cleanSelection}
      onOk={onSave}
      destroyOnClose
      okText="Gravar"
      okButtonProps={{ loading: isLoading }}
      style={{ minWidth: "60dvw" }}
      className="presentation__modal"
    >
      <Text>Selecione fotos para adicionar a apresentação: (Máx. 10)</Text>

      <div
        id="scrollableDiv"
        className="events__container"
        style={{
          height: "100%",
          overflow: "auto",
          marginTop: 10,
        }}
      >
        <InfiniteScroll
          dataLength={images.length}
          next={getMoreImages}
          hasMore={images.length < (data?.length ?? 0) && !isLoading}
          loader={
            <Flex
              gap={8}
              justify="center"
              align="center"
              style={{ padding: 10 }}
            >
              <Skeleton.Image active />
              <Skeleton.Image active />
              <Skeleton.Image active />
              <Skeleton.Image active />
            </Flex>
          }
          className="presentation__modal-content"
          scrollableTarget="scrollableDiv"
          style={{ overflowX: "hidden" }}
        >
          <Row gutter={[8, 8]}>
            {data?.map(({ id, url, name }) => (
              <Col key={id} xs={6} md={4} onClick={onSelect(url)}>
                <Image
                  src={url}
                  alt={name}
                  loading="lazy"
                  preview={false}
                  style={{
                    objectFit: "cover",
                    borderRadius: 5,
                    cursor: "pointer",
                  }}
                  height="100%"
                />

                <div className="management__image-select presentation">
                  <Checkbox
                    onClick={onSelect(url)}
                    checked={selectedImages.some((img) => img.url === url)}
                  />
                </div>
              </Col>
            ))}
          </Row>
        </InfiniteScroll>
      </div>
    </Modal>
  );
};
