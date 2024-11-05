import { firebaseAuth } from "@/firebase";
import { LoginFormType } from "@/types/auth";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Col, Flex, Form, Input, message, Row } from "antd";
import { signInWithEmailAndPassword } from "firebase/auth";

export const LoginContent = () => {
  const [form] = Form.useForm();

  const onLogin = async ({ email, password }: LoginFormType) => {
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      message.success("Login feito com sucesso!");
    } catch (error) {
      message.error("Email ou senha não correspondem!", 5);
    }
  };

  return (
    <Form form={form} onFinish={onLogin}>
      <Row gutter={10}>
        <Col span={12}>
          <Form.Item name="email" className="no-margin">
            <Input placeholder="Email" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="password" className="no-margin">
            <Input.Password placeholder="Senha" />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Flex justify="flex-end">
            <Button
              type="primary"
              htmlType="submit"
              size="small"
              className="button__small"
              icon={<FontAwesomeIcon icon={faPaperPlane} />}
              style={{ marginTop: 10 }}
            >
              Logar
            </Button>
          </Flex>
        </Col>
      </Row>
    </Form>
  );
};
