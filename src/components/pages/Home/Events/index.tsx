"use client";

import { onDownload } from "@/helpers/app";
import { useGetEvents } from "@/react-query";
import {
  DownloadOutlined,
  LeftOutlined,
  RightOutlined,
  UndoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import { Col, Flex, Image, Row, Space, Typography } from "antd";
import styles from "./Events.module.scss";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const { Title } = Typography;

export const Events = () => {
  const { data: events } = useGetEvents();
  const { ref, isVisible } = useScrollReveal();

  if (!events?.length) return null;

  return (
    <section
      ref={ref}
      className={`${styles.section} scroll-reveal ${
        isVisible ? "scroll-reveal--visible" : ""
      }`}
    >
      {/* Vibrant decorative background elements */}
      <div className={styles.decorations}>
        <div className={styles.bubbleTop} />
        <div className={styles.bubbleBottom} />
        <div className={styles.bubbleCenter} />
      </div>
      {/* Dynamic pattern overlay */}
      <div className={styles.pattern} />
      {/* Accent lines */}
      <div className={`${styles.accentLine} ${styles.accentLineTop}`} />
      <div className={`${styles.accentLine} ${styles.accentLineBottom}`} />

      <div className={styles.container}>
        <Flex vertical align="center" className={styles.heading}>
          {/* Decorative badge */}
          <div className={styles.badge}>
            <Typography.Text
              className={styles.badgeText}
              style={{ fontFamily: "var(--font-poppins), sans-serif" }}
            >
              ✨ Eventos Especiais
            </Typography.Text>
          </div>

          <Title
            level={2}
            className={styles.title}
            style={{
              letterSpacing: "-0.02em",
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontWeight: 700,
            }}
          >
            Próximos Eventos
            {/* Decorative underline */}
            <span className={styles.titleUnderline} />
          </Title>
          <Typography.Text
            className={styles.subtitle}
          >
            Junte-se à nossa comunidade e participe dos nossos eventos
          </Typography.Text>
        </Flex>

        <Row gutter={[24, 24]} justify="center">
          <Image.PreviewGroup
            preview={{
              toolbarRender: (
                _,
                {
                  image,
                  transform: { scale },
                  actions: { onActive, onZoomOut, onZoomIn, onReset },
                }
              ) => {
                return (
                  <Space size={12} className={styles.toolbar}>
                    <LeftOutlined
                      onClick={() => onActive?.(-1)}
                      title="Voltar"
                    />
                    <RightOutlined
                      onClick={() => onActive?.(1)}
                      title="Próxima"
                    />
                    <DownloadOutlined
                      onClick={onDownload(image.url)}
                      title="Fazer download da imagem"
                    />
                    <ZoomOutOutlined
                      disabled={scale === 1}
                      onClick={onZoomOut}
                      title="Diminuir zoom"
                    />
                    <ZoomInOutlined
                      disabled={scale === 50}
                      onClick={onZoomIn}
                      title="Aumentar zoom"
                    />
                    <UndoOutlined onClick={onReset} title="Resetar tudo" />
                  </Space>
                );
              },
            }}
          >
            {events?.map(({ id, url }, idx) => (
              <Col key={id} xs={24} sm={12} md={8} lg={6}>
                <div className={styles.eventCard}>
                  {/* Shine effect on hover */}
                  <div className={styles.eventShine} />

                  {/* Top badge */}
                  <div className={styles.eventBadge}>
                    <Typography.Text className={styles.eventBadgeText}>
                      Novo
                    </Typography.Text>
                  </div>

                  {/* Image container with overlay */}
                  <div className={styles.imageWrap}>
                    <div className={styles.imageOverlay} />
                    <Image
                      src={url}
                      alt={`Evento ${idx + 1}`}
                      className={styles.eventImage}
                      preview
                    />

                    {/* Bottom info overlay */}
                    <div className={styles.infoOverlay}>
                      <Flex vertical gap={4}>
                        <Typography.Text className={styles.infoText}>
                          Ver Detalhes
                        </Typography.Text>
                        <div className={styles.infoLine} />
                      </Flex>
                    </div>
                  </div>

                  {/* Decorative corner accent */}
                  <div className={styles.cornerAccent} />
                </div>
              </Col>
            ))}
          </Image.PreviewGroup>
        </Row>
      </div>
    </section>
  );
};
