import { useAppState } from "@/store";
import { ImageResult } from "@/types/store";
import {
  faImages,
  faLock,
  faPen,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  Col,
  Flex,
  FloatButton,
  Image,
  Popconfirm,
  Popover,
  PopoverProps,
  Row,
  Skeleton,
} from "antd";
import { FC, useState } from "react";

type Props = ImageResult & {
  isLoading: boolean;
};

export const CustomImage: FC<Props> = ({ name, url, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);

  const { toogleAlbumModal, updateImageUrl } = useAppState();

  const onOpenChange: PopoverProps["onOpenChange"] = (open) => setIsOpen(open);
  const hide = () => setIsOpen(false);

  const onOpenAlbum = () => {
    updateImageUrl(url);
    toogleAlbumModal(true);
    hide();
  };

  const menuItems = (
    <Row gutter={[8, 8]}>
      <Col span={24}>
        <Button
          type="text"
          icon={<FontAwesomeIcon icon={faLock} />}
          className="align-left"
          onClick={onOpenAlbum}
          block
        >
          Adicionar a um álbum
        </Button>
      </Col>

      <Col span={24}>
        <Button
          type="text"
          icon={<FontAwesomeIcon icon={faImages} />}
          className="align-left"
          block
        >
          Adicionar a apresentação
        </Button>
      </Col>

      <Col span={24}>
        <Popconfirm
          title="Apagar"
          description="Tens a certeza que queres apagar esta imagem?"
          okText="Sim"
          cancelText="Não"
        >
          <Button
            type="text"
            danger
            icon={<FontAwesomeIcon icon={faTrash} />}
            className="align-left"
            block
          >
            Apagar
          </Button>
        </Popconfirm>
      </Col>
    </Row>
  );

  const renderImage = () => {
    if (isLoading) return <Skeleton.Image active />;

    return (
      <>
        <Image src={url} className="gallery__image" alt={name} loading="lazy" />

        <Popover
          trigger="click"
          placement="bottom"
          open={isOpen}
          onOpenChange={onOpenChange}
          content={menuItems}
          overlayStyle={{ maxWidth: 300 }}
        >
          <FloatButton
            icon={<FontAwesomeIcon icon={faPen} />}
            className="gallery__image-options"
            style={{ zIndex: 800 }}
          />
        </Popover>
      </>
    );
  };

  return <Flex className="gallery__image-content">{renderImage()}</Flex>;
};
