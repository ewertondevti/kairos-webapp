"use client";

import { CreateAlbumModal } from "@/components/pages/Management/CreateAlbumModal";
import { DatabaseTableKeys } from "@/enums/app";
import { ManagementRoutesEnums, RoutesEnums } from "@/enums/routesEnums";
import { useGetAlbumById, useGetEvents } from "@/react-query";
import { deleteAlbum, deleteImageFromAlbum } from "@/services/albumServices";
import { deleteEvents } from "@/services/eventServices";
import { useAppState, useAuth } from "@/store";
import { UserRole } from "@/types/user";
import {
  faImages,
  faObjectGroup,
  faTrash,
  faUpload,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQueryClient } from "@tanstack/react-query";
import { App, Button, Col, Flex, List, message, Row, Tooltip, Typography } from "antd";

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
  const { modal } = App.useApp();
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
    !!user && !!active && (role === UserRole.Admin || role === UserRole.Midia);
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

  const getSelectedImageNames = () =>
    selectedImages.map((image, index) => image.name || `Imagem ${index + 1}`);

  const openDeleteAlbumConfirm = () => {
    const albumName = album?.name?.trim() || "Sem nome";
    modal.confirm({
      title: "Apagar álbum",
      content: (
        <Flex vertical gap={12}>
          <Typography.Text>
            Tem certeza que deseja apagar este álbum? Todas as imagens serão
            removidas.
          </Typography.Text>
          <Flex vertical gap={4}>
            <Typography.Text type="secondary">Álbum</Typography.Text>
            <Typography.Text strong>{albumName}</Typography.Text>
          </Flex>
        </Flex>
      ),
      okText: "Apagar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: onDeleteAlbum,
    });
  };

  const openDeleteImagesConfirm = () => {
    const names = getSelectedImageNames();
    modal.confirm({
      title: "Apagar imagens",
      content: (
        <Flex vertical gap={12}>
          <Typography.Text>
            Tem certeza que deseja apagar as imagens selecionadas?
          </Typography.Text>
          <List
            size="small"
            bordered
            dataSource={names}
            style={{ maxHeight: 220, overflowY: "auto" }}
            renderItem={(name) => (
              <List.Item>
                <Typography.Text>{name}</Typography.Text>
              </List.Item>
            )}
          />
        </Flex>
      ),
      okText: "Apagar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: () => {
        if (isAlbums) return onDeleteFromAlbum();
        if (isEvents) return onDeleteFrom(DatabaseTableKeys.Events);
      },
    });
  };

  const onDelete = () => {
    if (!selectedImages.length) return;
    openDeleteImagesConfirm();
  };

  const onCancelSelection = () => {
    onUnselectAll();
    updateMode("default");
  };

  const getSelectLabel = () => {
    if (
      selectedImages.length &&
      [events?.length, album?.images?.length].includes(selectedImages.length)
    ) {
      return "Desselecionar todas";
    }

    return "Selecionar todas";
  };

  const onUnselectAll = () => updateSelectedImages([]);

  const onSelectAll = () => {
    if (albumId && album) {
      if (selectedImages.length === (album.images?.length ?? 0)) {
        onUnselectAll();
      } else updateSelectedImages(album.images ?? []);
    } else if (isEvents) {
      if (selectedImages.length === events?.length) onUnselectAll();
      else updateSelectedImages(events ?? []);
    }
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
            {!!albumId && canManageMedia && (
              <Button
                danger
                icon={<FontAwesomeIcon icon={faTrash} />}
                onClick={openDeleteAlbumConfirm}
                loading={isLoading}
              >
                Apagar álbum
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
              <Tooltip title="Apagar">
                <Button
                  danger
                  icon={<FontAwesomeIcon icon={faTrash} />}
                  loading={isLoading}
                  onClick={onDelete}
                />
              </Tooltip>
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
