import { CustomFooter } from "@/components/CustomFooter";
import { Row } from "antd";
import { Events } from "./Events";
import "./Home.scss";
import { Presentation } from "./Presentation";
import { Verse } from "./Verse";

export const Home = () => {
  return (
    <Row className="home__content">
      <Presentation />

      <Events />

      <Verse />

      <CustomFooter />
    </Row>
  );
};
