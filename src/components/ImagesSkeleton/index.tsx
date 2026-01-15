import { Flex, Skeleton } from "antd";

export const ImagesSkeleton = () => {
  return (
    <div className="w-full">
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="break-inside-avoid mb-4">
            <Skeleton.Image
              active
              className="w-full"
              style={{
                width: "100%",
                height: Math.floor(Math.random() * 200) + 200,
                borderRadius: "8px",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
