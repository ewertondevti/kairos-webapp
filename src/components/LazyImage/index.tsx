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
          className="object-cover rounded-md w-[231px] h-[309px] sm:w-[172px] sm:h-[231px] md:w-[180px] md:h-[243px] lg:w-[214px] lg:h-[288px]"
          alt={name}
          preview={mode === "default"}
        />
      </>
    );
  };

  return (
    <Flex onClick={onSelect} className="w-full">
      {renderImage()}

      {mode === "select" && (
        <div className="absolute top-[10px] right-[15px] sm:top-[5px] sm:right-[7px] md:top-[10px] md:right-[10px]">
          <Checkbox
            onClick={onSelect}
            checked={selectedImages.some((img) => img.url === url)}
          />
        </div>
      )}
    </Flex>
  );
};
