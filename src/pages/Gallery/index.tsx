import { useGetImages } from "@/react-query";
import { Button, Flex } from "antd";
import { useState } from "react";
import { AddImagesModal } from "./AddImagesModal";

const Gallery = () => {
  const [isOpen, setIsOpen] = useState(false);

  const showModal = () => setIsOpen(true);
  const hideModal = () => setIsOpen(false);

  const { data } = useGetImages();

  return (
    <Flex>
      <Button type="primary" onClick={showModal}>
        Adicionar imagen(s)
      </Button>

      <AddImagesModal isOpen={isOpen} onCancel={hideModal} />
    </Flex>
  );
};

export default Gallery;
