import { CustomImage } from "@/components/CustomImage";
import { useGetAlbums } from "@/react-query";
import { Col, Flex, Row } from "antd";
import { useMemo } from "react";
import { useParams } from "react-router-dom";

export const AlbumDetails = () => {
  const { id } = useParams();

  const { data: albums, isLoading } = useGetAlbums();

  const album = useMemo(() => albums?.find((a) => a.id === id), [albums]);

  return (
    <Flex gap={8} justify="center" className="management__image-container">
      <Row className="management__image-container--photos">
        {album?.images?.map((image) => (
          <Col key={image.id}>
            <CustomImage {...image} key={image.id} isLoading={isLoading} />
          </Col>
        ))}
      </Row>
    </Flex>
  );
};
