"use client";

import { RoutesEnums } from "@/enums/routesEnums";
import { firebaseAuth } from "@/firebase";
import { useAuth } from "@/store";
import {
  faGears,
  faImages,
  faPowerOff,
  faRightToBracket,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Col, Divider, Row } from "antd";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { FC, useMemo } from "react";

type Props = {
  onClose: () => void;
};

export const MenuContent: FC<Props> = ({ onClose }) => {
  const router = useRouter();

  const { user } = useAuth();
  const isAuthenticated = useMemo(() => !!user, [user]);

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
        <Divider style={{ width: "auto", margin: 0 }} />
      </Col>

      <Col span={24}>
        <Button
          type="text"
          icon={<FontAwesomeIcon icon={faImages} />}
          className="justify-start text-left"
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
            className="justify-start text-left text-primary-600"
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
          className="justify-start text-left"
          onClick={() => onRedirect(`/${RoutesEnums.MembershipForm}`)}
          block
        >
          Ficha de membro
        </Button>
      </Col>

      {isAuthenticated && (
        <Col span={24}>
          <Button
            type="text"
            icon={<FontAwesomeIcon icon={faGears} />}
            className="justify-start text-left"
            onClick={() => onRedirect(`/${RoutesEnums.Management}`)}
            block
          >
            Gerenciamento
          </Button>
        </Col>
      )}

      {isAuthenticated && (
        <>
          <Col span={24}>
            <Divider style={{ width: "auto", margin: 0 }} />
          </Col>

          <Col span={24}>
            <Button
              type="text"
              danger
              icon={<FontAwesomeIcon icon={faPowerOff} />}
              className="justify-start text-left"
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
