import { MembershipFields } from "@/enums/membership";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Flex, Form, Input, Row, Typography } from "antd";

const { Text } = Typography;

export const SonFields = () => {
  return (
    <Form.List name={MembershipFields.Children}>
      {(fields, { add, remove }) => (
        <>
          {fields.map((field, index) => (
            <Row gutter={[10, 10]} style={{ marginBottom: 10 }} key={field.key}>
              {index === 0 && (
                <Col span={24}>
                  <Text>Filhos</Text>
                </Col>
              )}

              <Col flex="auto">
                <Form.Item
                  {...field}
                  key={field.key}
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message:
                        "Adicione o nome completo do filho ou remova este campo.",
                    },
                  ]}
                  noStyle
                >
                  <Input placeholder="Nome completo do filho..." />
                </Form.Item>
              </Col>

              <Col>
                <Flex
                  align="center"
                  justify="center"
                  className="h-full"
                >
                  <MinusCircleOutlined
                    className="dynamic-delete-button"
                    onClick={() => remove(field.name)}
                  />
                </Flex>
              </Col>
            </Row>
          ))}

          <Form.Item>
            <Button
              type="dashed"
              onClick={() => add()}
              icon={<PlusOutlined />}
              block
            >
              Adicionar filho
            </Button>
          </Form.Item>
        </>
      )}
    </Form.List>
  );
};
