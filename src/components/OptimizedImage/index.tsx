"use client";

import { useState, useEffect, useRef } from "react";
import { Skeleton } from "antd";

type OptimizedImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  onClick?: () => void;
  quality?: number;
};

export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  onClick,
  quality = 75,
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "50px", // Start loading 50px before image enters viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority, isInView]);

  if (hasError) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-sm">Erro ao carregar imagem</span>
      </div>
    );
  }

  return (
    <div
      ref={imgRef}
      className={`relative ${className}`}
      style={{ width, height }}
    >
      {isLoading && (
        <Skeleton.Image
          active
          className="absolute inset-0 w-full h-full z-10"
          style={{ width: "100%", height: "100%" }}
        />
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`object-cover transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          } ${onClick ? "cursor-pointer hover:opacity-90" : ""} ${
            width && height ? "" : "w-full h-full"
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
          }}
        />
      )}
    </div>
  );
};
