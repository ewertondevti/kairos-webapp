import { useAppState } from "@/store";
import { ICommonDTO } from "@/types/store";
import { Checkbox, Flex, Image, Skeleton } from "antd";
import { FC } from "react";

type Props = ICommonDTO & {
  isLoading: boolean;
};

export const LazyImage: FC<Props> = ({ id, name, url, isLoading }) => {
  const { mode, selectedImages, updateSelectedImages } = useAppState();

  const onSelect = () => {
    if (selectedImages.some((img) => img.url === url)) {
      updateSelectedImages(selectedImages.filter((img) => img.url !== url));
    } else updateSelectedImages([...selectedImages, { url, name, id }]);
  };

  const renderImage = () => {
    if (isLoading) {
      return <Skeleton.Image active className="image-skeleton" />;
    }

    return (
      <>
        <Image
          src={url}
          className="management__image image__size-default"
          alt={name}
          preview={mode === "default"}
        />
      </>
    );
  };

  return (
    <Flex onClick={onSelect} className="width-100perc">
      {renderImage()}

      {mode === "select" && (
        <div className="management__image-select">
          <Checkbox
            onClick={onSelect}
            checked={selectedImages.some((img) => img.url === url)}
          />
        </div>
      )}
    </Flex>
  );
};
