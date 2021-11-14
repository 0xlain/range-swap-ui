import React, { useState } from "react";
import styled from "@emotion/styled";
import { IconButton } from "@mui/material";

import { ReactComponent as WarningIcon } from "../assets/WarningIcon.svg";
import { ReactComponent as CloseIcon } from "../assets/CloseIcon.svg";

const SHOW_WARNING_KEY = "show-warning";

const WarningWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 11px;
  margin: 0 auto;
  width: 433px;
  height: 40px;

  background: linear-gradient(92.31deg, #fed56b 30.86%, #ff6d41 64.04%);
  border-radius: 8px;

  @media (max-width: 768px) {
    width: unset;
    max-width: 85%;
    margin-bottom: 25px;
  }
`;

const WarningText = styled.p`
  font-family: DM Mono;
  font-style: normal;
  font-weight: normal;
  font-size: 13px;
  line-height: 100%;

  letter-spacing: -0.02em;
  margin-left: 0 8px;
  color: #191332;
  
  @media (max-width: 768px) {
    margin-left: 10px;
  }
`;

const StyledIconButton = styled(IconButton)`
  padding: 4px;
`;

export const Warning = () => {
  const [showWarning, setShowWarning] = useState(
    localStorage.getItem(SHOW_WARNING_KEY) === null
  );

  if (!showWarning) {
    return null;
  }

  const handleDismiss = () => {
    setShowWarning(false);
    localStorage.setItem(SHOW_WARNING_KEY, true);
  };

  return showWarning ? (
    <WarningWrapper>
      <WarningIcon />
      <WarningText>
        Rangeswap is <b>not audited</b>. Use at your own risk.
      </WarningText>
      <StyledIconButton onClick={handleDismiss}>
        <CloseIcon />
      </StyledIconButton>
    </WarningWrapper>
  ) : null;
};
