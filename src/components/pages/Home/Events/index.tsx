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

const { Title } = Typography;

export const Events = () => {
  const { data: events } = useGetEvents();

  if (!events?.length) return null;

  return (
    <section className="py-24 bg-linear-to-br from-[#f1f7f2] via-[#eef5ef] to-[#e4f0e6] relative overflow-hidden">
      {/* Vibrant decorative background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[700px] w-[700px] rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/6 blur-3xl" />
      </div>
      {/* Dynamic pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #1a5d2e 1.5px, transparent 0)`,
          backgroundSize: "50px 50px",
        }}
      />
      {/* Accent lines */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-primary to-transparent opacity-60" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-primary to-transparent opacity-60" />

      <div className="container mx-auto px-4 relative z-10">
        <Flex vertical align="center" className="mb-16">
          {/* Decorative badge */}
          <div className="mb-6 px-6 py-2 bg-primary/10 rounded-full border border-primary/30">
            <Typography.Text
              className="text-primary font-semibold text-sm uppercase tracking-wider"
              style={{ fontFamily: "var(--font-poppins), sans-serif" }}
            >
              ✨ Eventos Especiais
            </Typography.Text>
          </div>

          <Title
            level={2}
            className="mb-5 relative"
            style={{
              letterSpacing: "-0.02em",
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontWeight: 700,
              fontSize: 48,
              background: "linear-gradient(135deg, #0a0a0a 0%, #1a5d2e 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Próximos Eventos
            {/* Decorative underline */}
            <span
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-linear-to-r from-transparent via-primary to-transparent"
              style={{ transform: "translate(-50%, 8px)" }}
            />
          </Title>
          <Typography.Text
            style={{
              fontSize: 18,
              color: "#4a5568",
              fontWeight: 500,
              maxWidth: "600px",
              textAlign: "center",
            }}
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
                  <Space size={12} className="toolbar-wrapper">
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
                <div className="group relative rounded-3xl border border-primary/15 bg-white/75 p-3 shadow-[0_12px_32px_rgba(15,58,28,0.14)] backdrop-blur transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_48px_rgba(26,93,46,0.28)]">
                  {/* Shine effect on hover */}
                  <div className="pointer-events-none absolute inset-0 z-30 rounded-3xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/0 transition-all duration-500 group-hover:from-primary/10 group-hover:via-primary/5 group-hover:to-transparent" />

                  {/* Top badge */}
                  <div className="absolute right-6 top-6 z-30 translate-y-2 rounded-full bg-primary px-3 py-1 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <Typography.Text className="text-white text-xs font-bold uppercase tracking-wide">
                      Novo
                    </Typography.Text>
                  </div>

                  {/* Image container with overlay */}
                  <div className="relative overflow-hidden rounded-2xl ring-1 ring-primary/10">
                    <div className="absolute inset-0 z-10 bg-linear-to-t from-black/40 via-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <Image
                      src={url}
                      alt={`Evento ${idx + 1}`}
                      className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      preview
                    />

                    {/* Bottom info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-4 bg-linear-to-t from-black/75 via-black/40 to-transparent p-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      <Flex vertical gap={4}>
                        <Typography.Text className="text-white text-base font-bold">
                          Ver Detalhes
                        </Typography.Text>
                        <div className="w-12 h-0.5 bg-primary rounded-full" />
                      </Flex>
                    </div>
                  </div>

                  {/* Decorative corner accent */}
                  <div className="absolute left-0 top-0 h-16 w-16 rounded-br-3xl bg-linear-to-br from-primary/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              </Col>
            ))}
          </Image.PreviewGroup>
        </Row>
      </div>
    </section>
  );
};
