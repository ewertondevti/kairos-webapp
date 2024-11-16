import { DatabaseTableKeys } from "@/enums/app";
import { ManagementRoutesEnums, RoutesEnums } from "@/enums/routesEnums";
import { CreateAlbumModal } from "@/pages/Management/CreateAlbumModal";
import {
  useGetAlbumById,
  useGetEvents,
  useGetPresentations,
} from "@/react-query";
import {
  deleteEvents,
} from "@/services/eventServices";
import { deletePresentations } from "@/services/presentationServices";
import { useAppState, useAuth } from "@/store";
import {
  faImages,
  faObjectGroup,
  faTrash,
  faUpload,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Col, Flex, message, Popconfirm, Row, Tooltip } from "antd";
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { EventModal } from "../EventModal";
import { PresentationModal } from "../PresentationModal";
import { deleteAlbum, deleteImageFromAlbum } from "@/services/albumServices";

export const TopBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEventOpen, setIsEventOpen] = useState(false);
  const [isPresOpen, setIsPresOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { pathname } = useLocation();
  const { id: albumId } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  const showPresModal = () => setIsPresOpen(true);
  const hidePresModal = () => setIsPresOpen(false);

  const refresh = () => queryClient.refetchQueries();

  const onDeleteAlbum = () => {
    setIsLoading(true);

    if (albumId) {
      deleteAlbum(albumId)
        .then(() => {
          message.success("Álbum apagado com sucesso!");
          navigate(
            `/${RoutesEnums.Management}/${ManagementRoutesEnums.Albums}`
          );
          refresh();
          onCancelSelection();
        })
        .catch((error) => {
          console.error(error);
          message.error("Não foi possível apagar o álbum!");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const onDeleteFromAlbum = async () => {
    if (!albumId) return;

    setIsLoading(true);

    deleteImageFromAlbum({ albumId, images: selectedImages })
      .then(() => {
        message.success("Fotos removidas do álbum com sucesso!");
        refresh();
        onCancelSelection();
      })
      .catch(() =>
        message.error("Houve um erro ao tentar remover fotos deste álbum!")
      )
      .finally(() => setIsLoading(false));
  };

  const onDeleteFrom = async (tableKey: DatabaseTableKeys) => {
    setIsLoading(true);

    try {
      switch (tableKey) {
        case DatabaseTableKeys.Presentations:
          await deletePresentations({ images: selectedImages });
          break;

        case DatabaseTableKeys.Events:
          await deleteEvents({ images: selectedImages });
          break;

        default:
          break;
      }

      refresh();
      onCancelSelection();

      message.success("Fotos apagadas com sucesso!");
    } catch (error) {
      console.error(error);
      message.error("Houve um erro ao tentar apagar foto(s)!");
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = () => {
    if (albumId && selectedImages.length === album?.images?.length) {
      onDeleteAlbum();
    } else if (isAlbums) onDeleteFromAlbum();
    else if (isPresentations) onDeleteFrom(DatabaseTableKeys.Presentations);
    else if (isEvents) onDeleteFrom(DatabaseTableKeys.Events);
  };

  const onCancelSelection = () => {
    onUnselectAll();
    updateMode("default");
  };

  const getSelectLabel = () => {
    if (
      selectedImages.length &&
      [presentations?.length, events?.length, album?.images.length].includes(
        selectedImages.length
      )
    ) {
      return "Desselecionar todas";
    }

    return "Selecionar todas";
  };

  const onUnselectAll = () => updateSelectedImages([]);

  const onSelectAll = () => {
    if (albumId && album) {
      if (selectedImages.length === album.images.length) {
        onUnselectAll();
      } else updateSelectedImages(album.images ?? []);
    } else if (isPresentations) {
      if (selectedImages.length === presentations?.length) {
        onUnselectAll();
      } else updateSelectedImages(presentations ?? []);
    } else if (isEvents) {
      if (selectedImages.length === events?.length) onUnselectAll();
      else updateSelectedImages(events ?? []);
    }
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

            {isPresentations && (
              <Button
                type="primary"
                icon={<FontAwesomeIcon icon={faImages} />}
                onClick={showPresModal}
                loading={isLoading}
              >
                Adicionar apresentação
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
                {getSelectLabel()}
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
      <PresentationModal isOpen={isPresOpen} onCancel={hidePresModal} />
    </>
  );
};
