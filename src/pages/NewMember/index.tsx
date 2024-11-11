import { Flex, Form, Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";

export const NewMember = () => {
  const [form] = Form.useForm();

  return (
    <Layout>
      <Content style={{ padding: 20 }}>
        <Title>Novo membro</Title>

        <Flex justify="center">
          <Form form={form} layout="vertical">
            <Form.Item></Form.Item>
          </Form>
        </Flex>
      </Content>
    </Layout>
  );
};
