import { useAppState } from "@/store";
import { ImageResult } from "@/types/store";
import { Checkbox, Flex, Image, Skeleton } from "antd";
import { FC } from "react";
import { useInView } from "react-intersection-observer";

type Props = ImageResult & {
  isLoading: boolean;
};

export const LazyImage: FC<Props> = ({ id, name, url, isLoading }) => {
  const { ref, inView } = useInView({ threshold: 0, triggerOnce: false });

  const { mode, selectedImages, updateSelectedImages } = useAppState();

  const onSelect = () => {
    if (selectedImages.some((img) => img.url === url)) {
      updateSelectedImages(selectedImages.filter((img) => img.url !== url));
    } else updateSelectedImages([...selectedImages, { url, id, name }]);
  };

  const renderImage = () => {
    if (isLoading || !inView) {
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
    <Flex key={id} onClick={onSelect} ref={ref}>
      {renderImage()}
    </Flex>
  );
};
