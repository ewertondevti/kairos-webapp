import { DatabaseTableKeys } from "@/enums/app";
import { ManagementRoutesEnums } from "@/enums/routesEnums";
import firebaseDB, { firebaseStorage } from "@/firebase";
import { AddImagesModal } from "@/pages/Management/AddImagesModal";
import { useAppState, useAuth } from "@/store";
import { AppstoreOutlined, BarsOutlined } from "@ant-design/icons";
import {
  faGrip,
  faImages,
  faObjectGroup,
  faTrash,
  faUpload,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Col,
  Flex,
  message,
  Popconfirm,
  Row,
  Segmented,
  Tooltip,
} from "antd";
import { arrayRemove, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { EventModal } from "../EventModal";
import { PresentationModal } from "../PresentationModal";

export const TopBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPresentOpen, setIsPresentOpen] = useState(false);
  const [isEventOpen, setIsEventOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { pathname } = useLocation();
  const { id: albumId } = useParams();
  const queryClient = useQueryClient();

  const { user } = useAuth();

  const {
    view,
    mode,
    selectedImages,
    updateView,
    updateMode,
    updateSelectedImages,
    toogleAlbumModal,
  } = useAppState();

  const isAllPhotos = pathname.includes(ManagementRoutesEnums.AllPhotos);
  const isAlbums = pathname.includes(ManagementRoutesEnums.Albums);
  const isPresentations = pathname.includes(ManagementRoutesEnums.Presentation);
  const isEvents = pathname.includes(ManagementRoutesEnums.Events);

  const showSelectBtn = !!user && mode === "default";

  const showModal = () => setIsOpen(true);
  const hideModal = () => setIsOpen(false);

  const showPresentModal = () => setIsPresentOpen(true);
  const hidePresentModal = () => setIsPresentOpen(false);

  const showEventModal = () => setIsEventOpen(true);
  const hideEventModal = () => setIsEventOpen(false);

  const refresh = () => queryClient.refetchQueries();

  const onDeleteFromAlbum = async () => {
    setIsLoading(true);
    const albumRef = doc(firebaseDB, DatabaseTableKeys.Albums, albumId!);

    // Atualize o campo "images" usando arrayRemove para remover a imagem específica
    await Promise.all(
      selectedImages.map(
        async (image) =>
          await updateDoc(albumRef, { images: arrayRemove(image) })
      )
    )
      .then(() => {
        message.success("Fotos removidas do álbum com sucesso!");
        refresh();
      })
      .catch(() =>
        message.error("Houve um erro ao tentar remover fotos deste álbum!")
      )
      .finally(() => setIsLoading(false));
  };

  const onDeleteFromPresentations = async () => {
    setIsLoading(true);

    await Promise.all(
      selectedImages.map(async ({ id }) => {
        try {
          // 2. Apagar a URL correspondente do Firestore
          await deleteDoc(
            doc(firebaseDB, DatabaseTableKeys.Presentations, id!)
          );

          return true;
        } catch (error: any) {
          message.error("Erro ao deletar a imagem: " + error.message);
          return false;
        }
      })
    )
      .then((res) => {
        refresh();
        if (res.every((bool) => bool))
          message.success("Foto(s) apagada(s) com sucesso!");
      })
      .finally(() => setIsLoading(false));
  };

  const onDeleteFrom = async (tableKey: DatabaseTableKeys) => {
    setIsLoading(true);

    await Promise.all(
      selectedImages.map(async ({ id, url }) => {
        try {
          // 1. Apagar a imagem do Firebase Storage
          const storageRef = ref(firebaseStorage, url);
          await deleteObject(storageRef);

          // 2. Apagar a URL correspondente do Firestore
          await deleteDoc(doc(firebaseDB, tableKey, id!));

          return true;
        } catch (error: any) {
          message.error("Erro ao deletar a imagem: " + error.message);
          return false;
        }
      })
    )
      .then((res) => {
        refresh();
        if (res.every((bool) => bool))
          message.success("Fotos apagadas com sucesso!");
        else message.error("Houve um erro ao tentar apagar foto(s)!");
      })
      .finally(() => setIsLoading(false));
  };

  const onDelete = () => {
    if (isAllPhotos) onDeleteFrom(DatabaseTableKeys.AllPhotos);
    else if (isAlbums) onDeleteFromAlbum();
    else if (isPresentations) onDeleteFromPresentations();
    else if (isEvents) onDeleteFrom(DatabaseTableKeys.Events);
  };

  const onCancelSelection = () => {
    updateSelectedImages([]);
    updateMode("default");
  };

  const getConfirmMessage = () => {
    let message = "Tens certeza que deseja apagar ";

    if (selectedImages.length) {
      if (selectedImages.length > 1) message += "as imagens";
      else message += "as imagens";
    }

    message += " selecionadas?";

    return message;
  };

  return (
    <>
      <Row gutter={[0, 16]}>
        <Col flex="auto">
          <Flex gap={8}>
            {(!isAlbums || !!albumId) && (
              <Segmented
                value={view}
                onChange={updateView}
                options={[
                  {
                    value: "small",
                    icon: <BarsOutlined />,
                    title: "Imagens pequenas",
                  },
                  {
                    value: "default",
                    icon: <FontAwesomeIcon icon={faGrip} />,
                    title: "Imagens médias",
                  },
                  {
                    value: "large",
                    icon: <AppstoreOutlined />,
                    title: "Imagens grandes",
                  },
                ]}
              />
            )}

            {!!selectedImages.length && isAllPhotos && (
              <Button
                type="primary"
                icon={<FontAwesomeIcon icon={faImages} />}
                onClick={() => toogleAlbumModal(true)}
              >
                Adicionar a álbum
              </Button>
            )}

            {!!albumId && (
              <Button
                type="primary"
                icon={<FontAwesomeIcon icon={faImages} />}
                onClick={() => toogleAlbumModal(true)}
              >
                Editar álbum
              </Button>
            )}

            {isPresentations && (
              <Button
                type="primary"
                icon={<FontAwesomeIcon icon={faImages} />}
                onClick={showPresentModal}
              >
                Adicionar imagens
              </Button>
            )}

            {isEvents && (
              <Button
                type="primary"
                icon={<FontAwesomeIcon icon={faImages} />}
                onClick={showEventModal}
              >
                Adicionar eventos
              </Button>
            )}
          </Flex>
        </Col>

        <Col>
          <Flex gap={8}>
            {!!selectedImages.length && (
              <Popconfirm
                title={getConfirmMessage()}
                onConfirm={onDelete}
                okText="Apagar"
                okButtonProps={{ danger: true }}
              >
                <Tooltip title="Apagar">
                  <Button
                    danger
                    icon={<FontAwesomeIcon icon={faTrash} />}
                    loading={isLoading}
                  />
                </Tooltip>
              </Popconfirm>
            )}

            {mode === "select" && (
              <Button
                icon={<FontAwesomeIcon icon={faXmark} />}
                onClick={onCancelSelection}
              >
                Cancelar
              </Button>
            )}

            {((showSelectBtn && !isAlbums) || (showSelectBtn && !!albumId)) && (
              <Button
                icon={<FontAwesomeIcon icon={faObjectGroup} />}
                onClick={() => updateMode("select")}
              >
                Selecionar
              </Button>
            )}

            {!!user && isAllPhotos && (
              <Button
                type="primary"
                icon={<FontAwesomeIcon icon={faUpload} />}
                onClick={showModal}
              >
                Upload
              </Button>
            )}
          </Flex>
        </Col>
      </Row>

      <AddImagesModal isOpen={isOpen} onCancel={hideModal} />
      <PresentationModal isOpen={isPresentOpen} onCancel={hidePresentModal} />
      <EventModal isOpen={isEventOpen} onCancel={hideEventModal} />
    </>
  );
};
