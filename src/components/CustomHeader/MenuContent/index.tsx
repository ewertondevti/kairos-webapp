"use client";

import { RoutesEnums } from "@/enums/routesEnums";
import { firebaseAuth } from "@/firebase";
import { useAuth } from "@/store";
import { UserRole } from "@/types/user";
import {
  faGears,
  faImages,
  faPhotoFilm,
  faPowerOff,
  faRightToBracket,
  faUser,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Col, Divider, Row } from "antd";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { FC, useMemo } from "react";
import styles from "./MenuContent.module.scss";

type Props = {
  onClose: () => void;
};

export const MenuContent: FC<Props> = ({ onClose }) => {
  const router = useRouter();

  const { user, role } = useAuth();
  const isAuthenticated = useMemo(() => !!user, [user]);
  const canAccessSecretariaPortal =
    role === UserRole.Admin || role === UserRole.Secretaria;
  const canAccessAdminPortal = role === UserRole.Admin;
  const canAccessMediaPortal = role === UserRole.Admin || role === UserRole.Midia;

  const onLogout = async () => {
    await signOut(firebaseAuth);
    onClose();
  };

  const onRedirect = (to: string) => {
    router.push(to);
    onClose();
  };

  return (
    <Row gutter={[8, 16]}>
      <Col span={24}>
        <Divider orientation="vertical" />
      </Col>

      <Col span={24}>
        <Button
          type="text"
          icon={<FontAwesomeIcon icon={faImages} />}
          className={styles.menuButton}
          onClick={() => onRedirect(`/${RoutesEnums.Gallery}`)}
          block
        >
          Galeria de fotos
        </Button>
      </Col>

      {!isAuthenticated && (
        <Col span={24}>
          <Button
            type="text"
            icon={<FontAwesomeIcon icon={faRightToBracket} />}
            className={`${styles.menuButton} ${styles.menuButtonPrimary}`}
            onClick={() => onRedirect("/login")}
            block
          >
            Entrar
          </Button>
        </Col>
      )}

      <Col span={24}>
        <Button
          type="text"
          icon={<FontAwesomeIcon icon={faUsers} />}
          className={styles.menuButton}
          onClick={() => onRedirect(`/${RoutesEnums.MembershipForm}`)}
          block
        >
          Ficha de membro
        </Button>
      </Col>

      {isAuthenticated && canAccessSecretariaPortal && (
        <Col span={24}>
          <Button
            type="text"
            icon={<FontAwesomeIcon icon={faGears} />}
            className={styles.menuButton}
            onClick={() => onRedirect("/secretaria")}
            block
          >
            Secretaria
          </Button>
        </Col>
      )}

      {isAuthenticated && canAccessMediaPortal && (
        <Col span={24}>
          <Button
            type="text"
            icon={<FontAwesomeIcon icon={faPhotoFilm} />}
            className={styles.menuButton}
            onClick={() => onRedirect("/midia")}
            block
          >
            Portal de Mídia
          </Button>
        </Col>
      )}

      {isAuthenticated && canAccessAdminPortal && (
        <Col span={24}>
          <Button
            type="text"
            icon={<FontAwesomeIcon icon={faUsers} />}
            className={styles.menuButton}
            onClick={() => onRedirect("/admin")}
            block
          >
            Portal Admin
          </Button>
        </Col>
      )}

      {isAuthenticated && (
        <Col span={24}>
          <Button
            type="text"
            icon={<FontAwesomeIcon icon={faUser} />}
            className={styles.menuButton}
            onClick={() => onRedirect(`/${RoutesEnums.Profile}`)}
            block
          >
            Meu perfil
          </Button>
        </Col>
      )}

      {isAuthenticated && (
        <>
          <Col span={24}>
            <Divider orientation="vertical" />
          </Col>

          <Col span={24}>
            <Button
              type="text"
              danger
              icon={<FontAwesomeIcon icon={faPowerOff} />}
              className={styles.menuButton}
              block
              onClick={onLogout}
            >
              Log out
            </Button>
          </Col>
        </>
      )}
    </Row>
  );
};
