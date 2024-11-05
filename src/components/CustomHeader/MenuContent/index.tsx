import { firebaseAuth } from "@/firebase";
import { useAuth } from "@/store";
import {
  faGears,
  faImages,
  faPowerOff,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Col, Divider, Row } from "antd";
import { signOut } from "firebase/auth";
import { useMemo } from "react";

export const MenuContent = () => {
  const { user } = useAuth();
  const isAuthenticated = useMemo(() => !!user, [user]);

  const onLogout = async () => await signOut(firebaseAuth);

  return (
    <Row gutter={[8, 16]}>
      <Col span={24}>
        <Divider style={{ width: "auto", margin: 0 }} />
      </Col>

      {isAuthenticated && (
        <Col span={24}>
          <Button type="text" icon={<FontAwesomeIcon icon={faGears} />} block>
            Admin
          </Button>
        </Col>
      )}

      <Col span={24}>
        <Button type="text" icon={<FontAwesomeIcon icon={faImages} />} block>
          Galeria de fotos
        </Button>
      </Col>

      <Col span={24}>
        <Divider style={{ width: "auto", margin: 0 }} />
      </Col>

      <Col span={24}>
        <Button
          type="text"
          danger
          icon={<FontAwesomeIcon icon={faPowerOff} />}
          block
          onClick={onLogout}
        >
          Log out
        </Button>
      </Col>
    </Row>
  );
};
