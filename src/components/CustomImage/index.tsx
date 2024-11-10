import { useAppState } from "@/store";
import { ImageResult } from "@/types/store";
import { Checkbox, Flex, Image, Skeleton } from "antd";
import { FC } from "react";

type Props = ImageResult & {
  isLoading: boolean;
};

export const CustomImage: FC<Props> = ({ id, name, url, isLoading }) => {
  const { view, mode, selectedImages, updateSelectedImages } = useAppState();

  const onSelect = () => {
    if (selectedImages.some((img) => img.url === url)) {
      updateSelectedImages(selectedImages.filter((img) => img.url !== url));
    } else updateSelectedImages([...selectedImages, { url, id, name }]);
  };

  const renderImage = () => {
    if (isLoading) return <Skeleton.Image active />;

    return (
      <>
        <Image
          src={url}
          className={`management__image image__size-${view}`}
          alt={name}
          loading="lazy"
          preview={mode === "default"}
        />

        {mode === "select" && (
          <div className="management__image-select">
            <Checkbox
              onClick={onSelect}
              checked={selectedImages.some((img) => img.url === url)}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <Flex className="management__image-content" key={id} onClick={onSelect}>
      {renderImage()}
    </Flex>
  );
};
