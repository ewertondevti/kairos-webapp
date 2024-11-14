import { useAppState } from "@/store";
import { IImageDTO } from "@/types/store";
import { Checkbox, Flex, Image, Skeleton } from "antd";
import { FC } from "react";

type Props = IImageDTO & {
  isLoading: boolean;
};

export const LazyImage: FC<Props> = ({ name, url, isLoading }) => {
  // const { ref, inView } = useInView({ threshold: 0, triggerOnce: false });

  const { mode, selectedImages, updateSelectedImages } = useAppState();

  const onSelect = () => {
    if (selectedImages.some((img) => img.url === url)) {
      updateSelectedImages(selectedImages.filter((img) => img.url !== url));
    } else updateSelectedImages([...selectedImages, { url, name }]);
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
