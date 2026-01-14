"use client";

import { IAlbumDTO } from "@/types/store";
import { Flex, Typography } from "antd";
import { useRouter } from "next/navigation";
import { FC } from "react";

const { Paragraph } = Typography;

type Props = IAlbumDTO & {
  basePath?: string;
};

export const AlbumContent: FC<Props> = ({
  id,
  name,
  images,
  basePath = "",
}) => {
  const router = useRouter();

  const coverImages = images?.filter((_, idx) => idx < 3) ?? [];

  const onRedirect = () => router.push(`${basePath}/${id}`);

  return (
    <Flex 
      className="relative transition-transform duration-1000 ease-in-out w-[200px] h-[220px] mt-[50px] sm:w-[150px] sm:h-[180px] md:w-[166px] md:h-[190px] cursor-pointer hover:scale-110 hover:z-20 group" 
      key={id} 
      onClick={onRedirect}
    >
      {coverImages.map(({ url }, idx) => {
        const baseClasses = "object-cover rounded-lg border border-white transition-transform duration-1000 ease-in-out";
        const coverClasses = [
          `${baseClasses} w-[100px] h-[132px] sm:w-[75px] sm:h-[100px] md:w-[90px] md:h-[110px] absolute top-[10px] left-[48px] sm:left-[27px] md:left-[30px] z-3`,
          `${baseClasses} w-[100px] h-[132px] sm:w-[75px] sm:h-[100px] md:w-[90px] md:h-[110px] absolute top-[5px] left-[48px] sm:left-[27px] md:left-[30px] z-2 translate-x-[10px]`,
          `${baseClasses} w-[100px] h-[132px] sm:w-[75px] sm:h-[100px] md:w-[90px] md:h-[110px] absolute top-0 left-[48px] sm:left-[27px] md:left-[30px] z-1 translate-x-5`,
        ];
        
        return (
          <img
            src={url}
            key={url}
            className={`${coverClasses[idx]} group-hover:scale-125 ${
              idx === 0 ? 'group-hover:-rotate-[15deg] group-hover:translate-x-[-60px] group-hover:translate-y-[-5px]' :
              idx === 1 ? '' :
              'group-hover:rotate-[15deg] group-hover:translate-x-[60px] group-hover:translate-y-[5px]'
            }`}
          />
        );
      })}

      <Paragraph
        style={{ textAlign: "center" }}
        ellipsis={{ suffix: "...", rows: 2 }}
        className="w-full flex justify-center items-end transition-transform duration-1000 ease-in-out group-hover:translate-y-[25px] group-hover:scale-110"
      >
        {name}
      </Paragraph>
    </Flex>
  );
};
