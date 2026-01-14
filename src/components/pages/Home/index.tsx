import { CustomFooter } from "@/components/CustomFooter";
import { Donation } from "@/components/Donation";
import { Row } from "antd";
import { Events } from "./Events";
import { Verse } from "./Verse";
import { WorshipDays } from "./WorshipDays";

export const Home = () => {
  return (
    <Row className="overflow-y-auto">
      <Events />

      <Verse />

      <WorshipDays />

      <Donation />

      <CustomFooter />
    </Row>
  );
};
