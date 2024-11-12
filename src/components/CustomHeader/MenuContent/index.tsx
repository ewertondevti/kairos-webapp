import { RoutesEnums } from "@/enums/routesEnums";
import { firebaseAuth } from "@/firebase";
import { useAuth } from "@/store";
import {
  faGears,
  faImages,
  faPowerOff,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Col, Divider, Row } from "antd";
import { signOut } from "firebase/auth";
import { FC, useMemo } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  onClose: () => void;
};

export const MenuContent: FC<Props> = ({ onClose }) => {
  const navigate = useNavigate();

  const { user } = useAuth();
  const isAuthenticated = useMemo(() => !!user, [user]);

  const onLogout = async () => {
    await signOut(firebaseAuth);
    onClose();
  };

  const onRedirect = () => {
    navigate(RoutesEnums.Management);
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
          className="align-left"
          onClick={() => navigate(`/${RoutesEnums.Gallery}`)}
          block
        >
          Galeria de fotos
        </Button>
      </Col>

      <Col span={24}>
        <Button
          type="text"
          icon={<FontAwesomeIcon icon={faUsers} />}
          className="align-left"
          onClick={() => navigate(`/${RoutesEnums.MembershipForm}`)}
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
            className="align-left"
            onClick={onRedirect}
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
              className="align-left"
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
