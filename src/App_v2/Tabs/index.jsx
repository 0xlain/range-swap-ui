import { useState } from "react";
import { Tab as TabLabel, Tabs as MuiTabs } from "@mui/material";
import styled from "@emotion/styled";

import { Trade } from "./Trade";
import { LP } from "./LP";
import { Stats } from "./Stats";

const TABS = {
  TRADE: "Trade",
  LP: "LP",
  STATS: "Stats",
};

const StyledTabs = styled(MuiTabs)`
  color: white;
`;

const TabsWrapper = styled.div`
  margin: 50px 0;
  display: flex;
  justify-content: center;
`;

const FlexContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const TabPanel = ({ children, currentTab, value }) => {
  const isTabSelected = currentTab === value;

  return (
    <FlexContainer role="tabpanel" hidden={!isTabSelected}>
      {isTabSelected && <>{children}</>}
    </FlexContainer>
  );
};

const TabContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;

  min-width: 300px;
  min-height: 300px;

  background: linear-gradient(
    180deg,
    rgba(120, 95, 218, 0.04) 0%,
    rgba(120, 95, 218, 0.15) 97.4%
  );
  backdrop-filter: blur(20px);
  border: 1px solid;

  border-image-source: linear-gradient(180deg, #785fda 0%, #ff6d41 100%);
  border-image-slice: 1;
  border-radius: 8px;
`;

export const Tabs = () => {
  const [currentTab, setCurrentTab] = useState(TABS.TRADE);

  const onChange = (_, value) => {
    setCurrentTab(value);
  };

  return (
    <>
      <TabsWrapper>
        <StyledTabs value={currentTab} onChange={onChange} textColor="inherit">
          <TabLabel value={TABS.TRADE} label={TABS.TRADE} />
          <TabLabel value={TABS.LP} label={TABS.LP} />
          <TabLabel value={TABS.STATS} label={TABS.STATS} />
        </StyledTabs>
      </TabsWrapper>
      <TabPanel currentTab={currentTab} value={TABS.TRADE}>
        <TabContainer>
          <Trade />
        </TabContainer>
      </TabPanel>
      <TabPanel currentTab={currentTab} value={TABS.LP}>
        <TabContainer>
          <LP />
        </TabContainer>
      </TabPanel>
      <TabPanel currentTab={currentTab} value={TABS.STATS}>
        <TabContainer>
          <Stats />
        </TabContainer>
      </TabPanel>
    </>
  );
};
