import { IAlbumDTO } from "@/types/store";
import { Flex, Image, Typography } from "antd";
import { FC } from "react";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

type Props = IAlbumDTO;

export const AlbumContent: FC<Props> = ({ id, name, images }) => {
  const navigate = useNavigate();

  const coverImages = images?.filter((_, idx) => idx < 3) ?? [];

  const onRedirect = () => navigate(id!);

  return (
    <Flex className="management__album-content" key={id} onClick={onRedirect}>
      {coverImages.map(({ id, url }, idx) => (
        <Image
          src={url}
          key={id}
          className={`management__album-content--cover${idx + 1}`}
          preview={false}
        />
      ))}

      <Text style={{ textAlign: "center" }}>{name}</Text>
    </Flex>
  );
};
