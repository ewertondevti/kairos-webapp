import { AlbumResult } from "@/types/store";
import { Flex, Image, Typography } from "antd";
import { FC } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";

const { Text } = Typography;

type Props = AlbumResult;

export const AlbumContent: FC<Props> = ({ id, name, coverImages }) => {
  const navigate = useNavigate();
  const { id: albumId } = useParams();

  if (albumId) {
    return <Outlet />;
  }

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

      <Text>{name}</Text>
    </Flex>
  );
};
