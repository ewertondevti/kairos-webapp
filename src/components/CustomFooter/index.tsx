"use client";

import { FacebookFilled, InstagramFilled } from "@ant-design/icons";
import { Button, Divider, Flex, Typography } from "antd";
import Image from "next/image";

const { Title, Text } = Typography;

export const CustomFooter = () => {
  return (
    <footer className="bg-primary text-white py-[60px] pb-10">
      <div className="container mx-auto px-4">
        <Flex vertical align="center" gap={32}>
          <Flex justify="center" align="center" vertical gap={20}>
            <div className="w-15 h-15 rounded-full bg-black flex items-center justify-center border-2 border-black">
              <Image
                src="/kairos-logo.png"
                width={50}
                height={50}
                alt="Kairós Logo"
                className="brightness-0 invert"
              />
            </div>
            <Title
              level={4}
              className="text-white m-0 text-[22px] font-semibold tracking-[-0.01em]"
            >
              Igreja Kairós Portugal
            </Title>
            <Text className="text-white/80 text-center text-base">
              Rua da Papoila 14, 2135-085 Samora Correia
            </Text>
          </Flex>

          <Flex gap={16} justify="center" wrap="wrap">
            {process.env.NEXT_PUBLIC_FACEBOOK_URL && (
              <Button
                shape="circle"
                size="large"
                icon={<FacebookFilled />}
                href={process.env.NEXT_PUBLIC_FACEBOOK_URL}
                target="_blank"
                className="bg-primary border-primary text-white hover:bg-primary-light hover:border-primary-light"
              />
            )}
            {process.env.NEXT_PUBLIC_INSTAGRAM_URL && (
              <Button
                shape="circle"
                size="large"
                icon={<InstagramFilled />}
                href={process.env.NEXT_PUBLIC_INSTAGRAM_URL}
                target="_blank"
                className="bg-primary border-primary text-white hover:bg-primary-light hover:border-primary-light"
              />
            )}
          </Flex>

          <Divider className="border-black/20 my-8 mt-0" />

          <Text className="text-white/60 text-center text-sm">
            © {new Date().getFullYear()} Igreja Kairós Portugal. Todos os
            direitos reservados.
          </Text>
        </Flex>
      </div>
    </footer>
  );
};
