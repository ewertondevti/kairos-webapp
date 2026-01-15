"use client";

import { useEffect, useRef, useState } from "react";
import { Skeleton } from "antd";
import styles from "./OptimizedImage.module.scss";

type OptimizedImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  onClick?: () => void;
};

export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  onClick,
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const image = imgRef.current;
    if (!image) return;

    if (image.complete && image.naturalWidth > 0) {
      setIsLoading(false);
    }
  }, [src]);

  if (hasError) {
    return (
      <div
        className={`${styles.error} ${className}`}
        style={{ width: width || "100%", height: height || "auto" }}
      >
        <span>Erro ao carregar imagem</span>
      </div>
    );
  }

  return (
    <div
      className={`${styles.container} ${className}`}
      style={{ width: width || "100%", height: height || "auto" }}
    >
      {isLoading && (
        <Skeleton.Image
          active
          className={styles.skeleton}
          style={{ width: "100%", height: height || "100%" }}
        />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${styles.image} ${
          isLoading ? styles.imageHidden : styles.imageVisible
        }`}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        onClick={onClick}
        style={{
          width: width || "100%",
          height: height || "auto",
          cursor: onClick ? "pointer" : "default",
        }}
      />
    </div>
  );
};
