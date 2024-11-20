import { CustomFooter } from "@/components/CustomFooter";
import { Donation } from "@/components/Donation";
import { Row } from "antd";
import { Events } from "./Events";
import "./Home.scss";
import { Verse } from "./Verse";
import { WorshipDays } from "./WorshipDays";

export const Home = () => {
  return (
    <Row className="home__content">
      <Events />

      <Verse />

      <WorshipDays />

      <Donation />

      <CustomFooter />
    </Row>
  );
};
