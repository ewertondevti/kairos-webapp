import { DatabaseTableKeys } from "@/enums/app";
import { ManagementRoutesEnums, RoutesEnums } from "@/enums/routesEnums";
import firebaseDB, { firebaseStorage } from "@/firebase";
import { CreateAlbumModal } from "@/pages/Management/CreateAlbumModal";
import {
  useGetAlbumById,
  useGetEvents,
  useGetPresentations,
} from "@/react-query";
import { useAppState, useAuth } from "@/store";
import { IImageDTO } from "@/types/store";
import {
  faImages,
  faObjectGroup,
  faPlus,
  faTrash,
  faUpload,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Col, Flex, message, Popconfirm, Row, Tooltip } from "antd";
import {
  addDoc,
  arrayRemove,
  collection,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useState } from "react";
import { redirect, useLocation, useParams } from "react-router-dom";
import { EventModal } from "../EventModal";

export const TopBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEventOpen, setIsEventOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { pathname } = useLocation();
  const { id: albumId } = useParams();
  const queryClient = useQueryClient();

  const { user } = useAuth();
  const { data: presentations } = useGetPresentations();
  const { data: events } = useGetEvents();
  const { data: album } = useGetAlbumById(albumId);

  const {
    mode,
    selectedImages,
    updateMode,
    updateSelectedImages,
    toogleEditAlbumModal,
  } = useAppState();

  const isAlbums = pathname.includes(ManagementRoutesEnums.Albums);
  const isPresentations = pathname.includes(ManagementRoutesEnums.Presentation);
  const isEvents = pathname.includes(ManagementRoutesEnums.Events);

  const showSelectBtn = !!user && mode === "default";

  const showModal = () => setIsOpen(true);
  const hideModal = () => setIsOpen(false);

  const showEventModal = () => setIsEventOpen(true);
  const hideEventModal = () => setIsEventOpen(false);

  const refresh = () => queryClient.refetchQueries();

  const onDeleteAlbum = async () => {
    if (albumId) {
      try {
        const albumRef = doc(firebaseDB, DatabaseTableKeys.Albums, albumId);
        await deleteDoc(albumRef);

        message.success("Álbum apagado com sucesso!");
        redirect(`/${RoutesEnums.Management}/${ManagementRoutesEnums.Albums}`);
        refresh();
      } catch (error) {
        console.error(error);
        message.error("Não foi possível apagar o álbum!");
      }
    }
  };

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
    if (albumId && selectedImages.length === album?.images?.length) {
      onDeleteAlbum();
    } else if (isAlbums) onDeleteFromAlbum();
    else if (isEvents) onDeleteFrom(DatabaseTableKeys.Events);
  };

  const onCancelSelection = () => {
    updateSelectedImages([]);
    updateMode("default");
  };

  const onAddPresentation = async () => {
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
        const payload: IImageDTO = { name, url };
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
        onCancelSelection();
      })
      .catch((error) => {
        console.error(error);
        message.error(
          "Houve um erro ao tentar adicionar fotos a apresentação."
        );
      })
      .finally(() => setIsLoading(false));
  };

  const onSelectAll = () => {
    if (albumId && album) updateSelectedImages(album.images ?? []);
    else if (isPresentations) updateSelectedImages(presentations ?? []);
    else if (isEvents) updateSelectedImages(events ?? []);
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
            {!!albumId && (
              <Button
                type="primary"
                icon={<FontAwesomeIcon icon={faImages} />}
                onClick={() => toogleEditAlbumModal(true)}
              >
                Editar álbum
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

            {mode === "select" && (
              <Button
                icon={<FontAwesomeIcon icon={faObjectGroup} />}
                onClick={onSelectAll}
              >
                Selecionar todos
              </Button>
            )}

            {mode === "select" && !!selectedImages.length && (
              <Button
                type="primary"
                icon={<FontAwesomeIcon icon={faPlus} />}
                onClick={onAddPresentation}
                loading={isLoading}
              >
                Apresentação
              </Button>
            )}

            {!!user && !albumId && (
              <Button
                type="primary"
                icon={<FontAwesomeIcon icon={faUpload} />}
                onClick={showModal}
              >
                Criar álbum
              </Button>
            )}
          </Flex>
        </Col>
      </Row>

      <CreateAlbumModal isOpen={isOpen} onCancel={hideModal} />
      <EventModal isOpen={isEventOpen} onCancel={hideEventModal} />
    </>
  );
};
