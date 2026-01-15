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
import { Col, Divider, Flex, Image, Row, Space } from "antd";
import Title from "antd/es/typography/Title";
import { Fragment } from "react/jsx-runtime";

export const Events = () => {
  const { data: events } = useGetEvents();

  if (!events?.length) return null;

  return (
    <Col span={24} className="rounded-3xl bg-linear-to-br from-[#f1f7f2] via-[#eef5ef] to-[#e4f0e6]">
      <Divider>
        <Title level={3} style={{ margin: 0, textTransform: "uppercase" }}>
          Próximos Eventos
        </Title>
      </Divider>

      <Flex
        align="center"
        justify="center"
        className="my-[100px] md:my-[75px] sm:my-[50px]"
      >
        <Row gutter={[16, 16]} justify="center" className="w-full">
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
              <Fragment key={id}>
                <Col xs={0} lg={1}>
                  <Flex justify="center" className="h-full">
                    {idx !== 0 && (
                      <Divider type="vertical" className="h-full" />
                    )}
                  </Flex>
                </Col>

                <Col>
                  <Flex className="rounded-2xl border border-primary/15 bg-white/70 p-3 shadow-[0_12px_32px_rgba(15,58,28,0.12)] backdrop-blur">
                    <Image
                      src={url}
                      className="h-[200px]! w-[320px]! rounded-xl object-cover"
                    />
                  </Flex>
                </Col>
              </Fragment>
            ))}
          </Image.PreviewGroup>
        </Row>
      </Flex>
    </Col>
  );
};
