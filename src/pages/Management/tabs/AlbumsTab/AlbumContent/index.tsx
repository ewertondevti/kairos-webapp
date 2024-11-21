import { IAlbumDTO } from "@/types/store";
import { Flex, Typography } from "antd";
import { FC } from "react";
import { useNavigate } from "react-router-dom";

const { Paragraph } = Typography;

type Props = IAlbumDTO;

export const AlbumContent: FC<Props> = ({ id, name, images }) => {
  const navigate = useNavigate();

  const coverImages = images?.filter((_, idx) => idx < 3) ?? [];

  const onRedirect = () => navigate(id!);

  return (
    <Flex className="management__album-content" key={id} onClick={onRedirect}>
      {coverImages.map(({ url }, idx) => (
        <img
          src={url}
          key={url}
          className={`management__album-content--cover${idx + 1}`}
        />
      ))}

      <Paragraph
        style={{ textAlign: "center" }}
        ellipsis={{ suffix: "...", rows: 2 }}
        className="management__album-content-title"
      >
        {name}
      </Paragraph>
    </Flex>
  );
};
