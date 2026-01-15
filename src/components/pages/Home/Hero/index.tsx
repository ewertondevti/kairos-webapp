"use client";

import { RoutesEnums } from "@/enums/routesEnums";
import { Button, Col, Flex, Row, Typography } from "antd";
import { useRouter } from "next/navigation";

const { Title, Paragraph } = Typography;

export const Hero = () => {
  const router = useRouter();

  return (
    <section className="bg-primary py-24 min-h-[600px] flex items-center">
      <div className="container mx-auto px-4">
        <Row justify="center">
          <Col xs={24} sm={22} md={20} lg={18} xl={16}>
            <Flex vertical align="center" className="text-center">
              <Title
                level={1}
                className="text-white mb-7"
                style={{
                  fontSize: "clamp(40px, 6vw, 64px)",
                  letterSpacing: "0.02em",
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  fontWeight: 700,
                }}
              >
                Bem-vindo à Igreja Kairós
              </Title>
              <Paragraph
                className="text-white/90 mb-12 max-w-[800px]"
                style={{
                  fontSize: "clamp(17px, 2.2vw, 21px)",
                  fontFamily: "var(--font-poppins), sans-serif",
                  lineHeight: 1.8,
                }}
              >
                Uma comunidade comprometida com o Evangelho de Jesus Cristo.
                Junte-se a nós e descubra o poder transformador da Palavra de
                Deus.
              </Paragraph>
              <Flex gap={20} wrap="wrap" justify="center">
                <Button
                  type="primary"
                  size="large"
                  onClick={() => router.push(`/${RoutesEnums.Gallery}`)}
                  style={{
                    boxShadow: "0 4px 12px rgba(26, 93, 46, 0.3)",
                  }}
                >
                  Ver Galeria
                </Button>
                <Button
                  size="large"
                  onClick={() => router.push(`/${RoutesEnums.MembershipForm}`)}
                >
                  Ficha de Membro
                </Button>
              </Flex>
            </Flex>
          </Col>
        </Row>
      </div>
    </section>
  );
};
