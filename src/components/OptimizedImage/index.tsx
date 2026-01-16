"use client";
/* eslint-disable @next/next/no-img-element */

import { Skeleton } from "antd";
import { useState } from "react";
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

const OptimizedImageContent = ({
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
          cursor: "pointer",
        }}
      />
    </div>
  );
};

export const OptimizedImage = (props: OptimizedImageProps) => {
  return <OptimizedImageContent key={props.src} {...props} />;
};
