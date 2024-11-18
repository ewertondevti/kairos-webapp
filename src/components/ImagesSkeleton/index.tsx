import { Col, Flex, Row, Skeleton } from "antd";

export const ImagesSkeleton = () => {
  return (
    <Flex justify="center">
      <Row gutter={[8, 8]} justify="center" className="skeleton-images">
        <Col xs={12} sm={8} md={6} xl={4}>
          <Skeleton.Image active className="image-skeleton" />
        </Col>

        <Col xs={12} sm={8} md={6} xl={4}>
          <Skeleton.Image active className="image-skeleton" />
        </Col>

        <Col xs={12} sm={8} md={6} xl={4}>
          <Skeleton.Image active className="image-skeleton" />
        </Col>

        <Col xs={12} sm={8} md={6} xl={4}>
          <Skeleton.Image active className="image-skeleton" />
        </Col>

        <Col xs={12} sm={8} md={6} xl={4}>
          <Skeleton.Image active className="image-skeleton" />
        </Col>

        <Col xs={12} sm={8} md={6} xl={4}>
          <Skeleton.Image active className="image-skeleton" />
        </Col>

        <Col xs={0} sm={0} md={6} xl={4}>
          <Skeleton.Image active className="image-skeleton" />
        </Col>

        <Col xs={0} sm={0} md={6} xl={4}>
          <Skeleton.Image active className="image-skeleton" />
        </Col>
      </Row>
    </Flex>
  );
};
