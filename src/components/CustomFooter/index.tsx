"use client";

import { FacebookFilled, InstagramFilled } from "@ant-design/icons";
import { Button, Divider, Flex, Typography } from "antd";
import Image from "next/image";
import styles from "./CustomFooter.module.scss";

const { Text } = Typography;

export const CustomFooter = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.overlay} />
      <div className={styles.accentBar} />
      <div className={styles.container}>
        <Flex vertical align="center" gap={20}>
          <Flex
            justify="center"
            align="center"
            vertical
            gap={12}
            className={styles.brandStack}
          >
            <div className={styles.logoWrap}>
              <div className={styles.logoOuterRing} />
              <div className={styles.logoGreenRing} />
              <div className={styles.logoInnerRing}>
                <Image
                  src="/kairos-logo.png"
                  width={28}
                  height={28}
                  alt="Kairós Logo"
                  className={styles.logoImage}
                />
              </div>
            </div>
            <Text className={styles.title} strong>
              Kairós Portugal
            </Text>
            <Text className={styles.address}>
              Rua da Papoila 14, 2135-085 Samora Correia
            </Text>
          </Flex>

          <Flex
            gap={12}
            justify="center"
            wrap="wrap"
            className={styles.socials}
          >
            {process.env.NEXT_PUBLIC_FACEBOOK_URL && (
              <Button
                shape="circle"
                size="small"
                icon={<FacebookFilled />}
                href={process.env.NEXT_PUBLIC_FACEBOOK_URL}
                target="_blank"
                className={`bg-primary border-primary text-white hover:bg-primary-light hover:border-primary-light ${styles.socialButton}`}
              />
            )}
            {process.env.NEXT_PUBLIC_INSTAGRAM_URL && (
              <Button
                shape="circle"
                size="small"
                icon={<InstagramFilled />}
                href={process.env.NEXT_PUBLIC_INSTAGRAM_URL}
                target="_blank"
                className={`bg-primary border-primary text-white hover:bg-primary-light hover:border-primary-light ${styles.socialButton}`}
              />
            )}
          </Flex>

          <Divider className={styles.divider} />

          <Text className={styles.copyright}>
            © {new Date().getFullYear()} Igreja Kairós Portugal. Todos os
            direitos reservados.
          </Text>
        </Flex>
      </div>
    </footer>
  );
};
