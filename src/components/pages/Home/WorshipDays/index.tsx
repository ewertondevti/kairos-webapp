import { WorshipContent } from "@/components/WorshipContent";
import { Card, Col, Flex, Row, Typography } from "antd";
import styles from "./WorshipDays.module.scss";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const { Title } = Typography;

export const WorshipDays = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={`${styles.section} scroll-reveal ${
        isVisible ? "scroll-reveal--visible" : ""
      }`}
    >
      <div className={styles.radialTop} />
      <div className={styles.radialBottom} />
      <div className={styles.diagonalOverlay} />
      <div className={`${styles.lightSweep} kairos-light-sweep`} />
      <div className={styles.container}>
        <Flex vertical align="center" className={styles.heading}>
          <Title level={2} className={styles.title}>
            Dias de Culto
          </Title>
          <Typography.Text className={styles.subtitle}>
            Venha adorar conosco nestes dias especiais
          </Typography.Text>
        </Flex>

        <Row gutter={[32, 32]} justify="center">
          <Col xs={24} sm={12} md={10}>
            <Card
              hoverable
              className={styles.card}
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
              className={styles.card}
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
              className={styles.card}
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
