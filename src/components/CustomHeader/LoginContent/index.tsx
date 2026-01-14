import { firebaseAuth } from "@/firebase";
import { LoginFormType } from "@/types/auth";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Col, Flex, Form, Input, message, Row } from "antd";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FC, useState } from "react";

type Props = {
  onClose: () => void;
};

export const LoginContent: FC<Props> = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  const [form] = Form.useForm();

  const onLogin = async ({ email, password }: LoginFormType) => {
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      message.success("Login feito com sucesso!");
      onClose();
    } catch (error) {
      console.error(error);
      message.error("Email ou senha não correspondem!", 5);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form form={form} onFinish={onLogin}>
      <Row gutter={10}>
        <Col span={12}>
          <Form.Item name="email" className="m-0">
            <Input placeholder="Email" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="password" className="m-0">
            <Input.Password placeholder="Senha" />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Flex justify="flex-end">
            <Button
              type="primary"
              htmlType="submit"
              size="small"
              className="text-xs leading-normal"
              icon={<FontAwesomeIcon icon={faPaperPlane} />}
              style={{ marginTop: 10 }}
              loading={isLoading}
            >
              Logar
            </Button>
          </Flex>
        </Col>
      </Row>
    </Form>
  );
};
