import { CustomFooter } from "@/components/CustomFooter";
import { Row } from "antd";
import { Events } from "./Events";
import "./Home.scss";
import { Slider } from "./Slider";
import { Verse } from "./Verse";

export const Home = () => {
  return (
    <Row className="home__content">
      <Slider />

      <Events />

      <Verse />

      <CustomFooter />
    </Row>
  );
};
