import { MembershipFields } from "@/features/membership/membership.enums";
import { dateInputFormat, disabledDate } from "@/utils/app";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Row,
  Typography,
} from "antd";
import styles from "./SonFields.module.scss";

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
                  <Text className={styles.childrenLabel}>Filhos</Text>
                </Col>
              )}

              <Col flex={1}>
                <Form.Item
                  name={[field.name, "name"]}
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message:
                        "Adicione o nome completo do filho ou remova este campo.",
                    },
                  ]}
                >
                  <Input placeholder="Nome completo do filho..." />
                </Form.Item>
              </Col>

              <Col flex={1}>
                <Form.Item name={[field.name, "birthDate"]}>
                  <DatePicker
                    format={dateInputFormat}
                    disabledDate={disabledDate}
                    className="w-full"
                    placeholder="Data de nascimento"
                  />
                </Form.Item>
              </Col>

              <Col>
                <Form.Item>
                  <Flex align="center" justify="center" className="h-full">
                    <MinusCircleOutlined
                      className="dynamic-delete-button"
                      onClick={() => remove(field.name)}
                    />
                  </Flex>
                </Form.Item>
              </Col>
            </Row>
          ))}

          <Form.Item>
            <Button
              type="dashed"
              onClick={() => add()}
              icon={<PlusOutlined />}
              block
              className={styles.addChildButton}
            >
              Adicionar filho
            </Button>
          </Form.Item>
        </>
      )}
    </Form.List>
  );
};
