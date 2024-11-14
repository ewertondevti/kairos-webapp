import { CustomFooter } from "@/components/CustomFooter";
import { Row } from "antd";
import { Events } from "./Events";
import "./Home.scss";
import { PresentationSlider } from "./PresentationSlider";
import { Verse } from "./Verse";
import { WorshipDays } from "./WorshipDays";

export const Home = () => {
  return (
    <Row className="home__content">
      <PresentationSlider />

      <Events />

      <Verse />

      <WorshipDays />

      <CustomFooter />
    </Row>
  );
};
