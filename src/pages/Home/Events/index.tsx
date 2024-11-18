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
    <Col span={24}>
      <Divider>
        <Title level={3} style={{ margin: 0, textTransform: "uppercase" }}>
          Próximos Eventos
        </Title>
      </Divider>

      <Flex align="center" justify="center" className="home__content-container">
        <Row gutter={[8, 8]} justify="center" className="width-100perc">
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
                  <Flex justify="center" className="height-100perc">
                    {idx !== 0 && (
                      <Divider type="vertical" className="height-100perc" />
                    )}
                  </Flex>
                </Col>

                <Col>
                  <Flex className="home__content--event-default-size">
                    <Image src={url} />
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
