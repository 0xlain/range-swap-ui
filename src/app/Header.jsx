import React from "react";
import styled from "@emotion/styled";
import { ReactComponent as RangeSwapSvg } from "../assets/RangeSwap.svg";
import ConnectWalletButton from "./components/ConnectWalletButton";

const HeaderContainer = styled.div``;

const HeaderLine = styled.div`
  height: 2px;
  top: 38px;
  left: 46.5%;
  right: 44.8%;
  position: absolute;
  background-image: linear-gradient(90deg, #785fda 0%, #ff6d41 100%);

  @media (max-width: 768px) {
    width: unset;
    left: 43%;
    right: 40%;
  }
`;

const RangeSwapText = styled(RangeSwapSvg)`
  margin: 30px auto;
  display: block;
  
  @media (max-width: 768px) {
    max-width: 85%;
  }
`;

export const Header = () => (
  <HeaderContainer>
    <RangeSwapText />
    <HeaderLine />
    <div style={{ position: "absolute", top: "0", right: "0", margin: "30px" }}>
      <ConnectWalletButton />
    </div>
  </HeaderContainer>
);
