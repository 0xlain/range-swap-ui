import React from "react";
import { Container } from "@mui/material";
import styled from "@emotion/styled";
import { Header } from "./Header";
import { Tabs } from "./Tabs/index";
import { Warning } from "./Warning";

const AppContainer = styled(Container)`
  background: radial-gradient(
      54.67% 86.76% at 83.89% 1.44%,
      rgba(120, 95, 218, 0.17) 0%,
      rgba(120, 95, 218, 0) 100%
    ),
    radial-gradient(
      46.66% 51.8% at 22.26% 87.23%,
      rgba(255, 65, 133, 0.077) 0%,
      rgba(255, 65, 236, 0) 100%
    ),
    linear-gradient(
      138.99deg,
      rgba(122, 97, 223, 0.012) -1.3%,
      rgba(5, 13, 20, 0.15) 90.81%
    ),
    #080514;

  position: fixed;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  z-index: 10;
`;

export const App = () => {
  return (
    <AppContainer disableGutters maxWidth={false}>
      <Header />
      <Warning />
      <Tabs />
    </AppContainer>
  );
};
