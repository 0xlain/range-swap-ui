import React from "react";
import { Typography } from "@mui/material";
import { useTokens } from "../hooks/useTokens";

export const Stats = () => {
  const tokens = useTokens();

  return (
    <div>
      {tokens.map((token, i) => (
        <Typography key={i}>
          {token.symbol}
          {"  "}
          {token.liquidity}
        </Typography>
      ))}
    </div>
  );
};
