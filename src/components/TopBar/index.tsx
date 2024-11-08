import firebaseDB, { firebaseStorage } from "@/firebase";
import { AddImagesModal } from "@/pages/Gallery/AddImagesModal";
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
import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useState } from "react";

export const TopBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const showModal = () => setIsOpen(true);
  const hideModal = () => setIsOpen(false);

  const refresh = () => queryClient.refetchQueries();

  const onDelete = async () => {
    setIsLoading(true);

    await Promise.all(
      selectedImages.map(async ({ id, url }) => {
        try {
          // 1. Apagar a imagem do Firebase Storage
          const storageRef = ref(firebaseStorage, url);
          await deleteObject(storageRef);

          // 2. Apagar a URL correspondente do Firestore
          await deleteDoc(doc(firebaseDB, "images", id!));

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
        <Col flex={"auto"}>
          <Flex gap={8}>
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

            {!!selectedImages.length && (
              <Button
                type="primary"
                icon={<FontAwesomeIcon icon={faImages} />}
                onClick={() => toogleAlbumModal(true)}
              >
                Criar álbum
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

            {user && mode === "default" && (
              <Button
                icon={<FontAwesomeIcon icon={faObjectGroup} />}
                onClick={() => updateMode("select")}
              >
                Selecionar
              </Button>
            )}

            {user && (
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
    </>
  );
};
