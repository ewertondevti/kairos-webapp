"use client";

import { CreateAlbumModal } from "@/pages/Management/CreateAlbumModal";
import { DatabaseTableKeys } from "@/enums/app";
import { ManagementRoutesEnums, RoutesEnums } from "@/enums/routesEnums";
import { useGetAlbumById, useGetEvents } from "@/react-query";
import { deleteAlbum, deleteImageFromAlbum } from "@/services/albumServices";
import { deleteEvents } from "@/services/eventServices";
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

import { useParams, usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { EventModal } from "../EventModal";

export const TopBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEventOpen, setIsEventOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const pathname = usePathname() ?? "";
  const params = useParams();
  const albumId = params?.id as string | undefined;
  const queryClient = useQueryClient();
  const router = useRouter();

  const { user, role, active } = useAuth();
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
  const isEvents = pathname.includes(ManagementRoutesEnums.Events);

  const canManageMedia =
    !!user && !!active && (role === "admin" || role === "midia");
  const showSelectBtn = canManageMedia && mode === "default";

  const showModal = () => setIsOpen(true);
  const hideModal = () => setIsOpen(false);

  const showEventModal = () => setIsEventOpen(true);
  const hideEventModal = () => setIsEventOpen(false);

  const refresh = () => queryClient.refetchQueries();

  const onDeleteAlbum = () => {
    setIsLoading(true);

    if (albumId) {
      deleteAlbum(albumId)
        .then(() => {
          message.success("Álbum apagado com sucesso!");
          router.push(
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
    else if (isEvents) onDeleteFrom(DatabaseTableKeys.Events);
  };

  const onCancelSelection = () => {
    onUnselectAll();
    updateMode("default");
  };

  const getSelectLabel = () => {
    if (
      selectedImages.length &&
      [events?.length, album?.images.length].includes(selectedImages.length)
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
    } else if (isEvents) {
      if (selectedImages.length === events?.length) onUnselectAll();
      else updateSelectedImages(events ?? []);
    }
  };

  const getConfirmMessage = () => {
    let message = "Tens a certeza que deseja apagar ";

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
            {!!albumId && canManageMedia && (
              <Button
                type="primary"
                icon={<FontAwesomeIcon icon={faImages} />}
                onClick={() => toogleEditAlbumModal(true)}
              >
                Editar álbum
              </Button>
            )}

            {isEvents && canManageMedia && (
              <Button
                type="primary"
                icon={<FontAwesomeIcon icon={faImages} />}
                onClick={showEventModal}
              >
                Adicionar eventos
              </Button>
            )}

            {isAlbums && !albumId && canManageMedia && (
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

        <Col>
          <Flex gap={8}>
            {!!selectedImages.length && canManageMedia && (
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
          </Flex>
        </Col>
      </Row>

      <CreateAlbumModal isOpen={isOpen} onCancel={hideModal} />
      <EventModal isOpen={isEventOpen} onCancel={hideEventModal} />
    </>
  );
};
