import { WorshipContent } from "@/components/WorshipContent";
import { Card, Col, Flex, Row, Typography } from "antd";

const { Title } = Typography;

export const WorshipDays = () => {
  return (
    <section className="relative overflow-hidden py-24 bg-[#111b14]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(110,217,140,0.35)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(26,93,46,0.3)_0%,transparent_65%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(9,14,11,0.35)_0%,transparent_40%,rgba(9,14,11,0.35)_100%)]" />
      <div className="absolute -inset-y-16 -left-1/3 w-[140%] rotate-[-18deg] bg-[linear-gradient(90deg,transparent_0%,rgba(110,217,140,0.28)_45%,rgba(110,217,140,0.55)_50%,rgba(110,217,140,0.28)_55%,transparent_100%)] blur-2xl opacity-80 kairos-light-sweep" />
      <div className="container mx-auto px-4 relative z-10">
        <Flex vertical align="center" className="mb-14">
          <Title
            level={2}
            className="mb-3 uppercase tracking-[0.25em] text-center bg-linear-to-r from-emerald-100 via-emerald-200 to-emerald-100 text-transparent bg-clip-text drop-shadow-[0_8px_24px_rgba(16,185,129,0.35)]"
            style={{
              fontFamily: "var(--font-poppins), sans-serif",
              fontWeight: 600,
              color: "transparent",
              WebkitTextFillColor: "transparent",
            }}
          >
            Dias de Culto
          </Title>
          <Typography.Text
            className="text-center max-w-xl"
            style={{ fontSize: 16, color: "#e6fff1" }}
          >
            Venha adorar conosco nestes dias especiais
          </Typography.Text>
        </Flex>

        <Row gutter={[32, 32]} justify="center">
          <Col xs={24} sm={12} md={10}>
            <Card
              hoverable
              className="relative overflow-hidden rounded-2xl text-center bg-linear-to-br! from-[#bfe9d3]! via-[#a8ddc2]! to-[#95d3b5]! border border-emerald-400/40! ring-1 ring-emerald-300/50 shadow-[0_12px_36px_rgba(4,12,7,0.25),0_0_0_1px_rgba(110,217,140,0.25)] backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-emerald-400/80 hover:ring-emerald-300/80 hover:shadow-[0_24px_60px_rgba(16,185,129,0.28)] before:absolute before:inset-0 before:rounded-2xl before:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35)_0%,transparent_60%)] before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100"
              styles={{ body: { padding: 32 } }}
            >
              <WorshipContent
                title="Domingo"
                label1="Todos os domingos"
                label2="À partir das 18 horas."
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={10}>
            <Card
              hoverable
              className="relative overflow-hidden rounded-2xl text-center bg-linear-to-br! from-[#bfe9d3]! via-[#a8ddc2]! to-[#95d3b5]! border border-emerald-400/40 ring-1 ring-emerald-300/50 shadow-[0_12px_36px_rgba(4,12,7,0.25),0_0_0_1px_rgba(110,217,140,0.25)] backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-emerald-400/80 hover:ring-emerald-300/80 hover:shadow-[0_24px_60px_rgba(16,185,129,0.28)] before:absolute before:inset-0 before:rounded-2xl before:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35)_0%,transparent_60%)] before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100"
              styles={{ body: { padding: 32 } }}
            >
              <WorshipContent
                title="Quarta-feira"
                label1="Todas as quartas-feiras"
                label2="À partir das 20 horas."
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={10}>
            <Card
              hoverable
              className="relative overflow-hidden rounded-2xl text-center bg-linear-to-br from-[#bfe9d3] via-[#a8ddc2] to-[#95d3b5] border border-emerald-400/40 ring-1 ring-emerald-300/50 shadow-[0_12px_36px_rgba(4,12,7,0.25),0_0_0_1px_rgba(110,217,140,0.25)] backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-emerald-400/80 hover:ring-emerald-300/80 hover:shadow-[0_24px_60px_rgba(16,185,129,0.28)] before:absolute before:inset-0 before:rounded-2xl before:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35)_0%,transparent_60%)] before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100"
              styles={{ body: { padding: 32 } }}
            >
              <WorshipContent
                title="Sexta-feira"
                label1="Culto de ensino"
                label2="À partir das 20 horas."
              />
            </Card>
          </Col>
        </Row>
      </div>
    </section>
  );
};
