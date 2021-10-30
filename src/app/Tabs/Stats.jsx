import React from "react";
import styled from "@emotion/styled";

import { useTokens } from "../hooks/useTokens";

const TableHeader = styled.td`
  font-family: DM Mono;
  font-style: normal;
  font-weight: 500;
  font-size: 13px;
  line-height: 150%;
  text-transform: uppercase;

  color: #785fda;
`;

const TokenName = styled.p`
  font-family: DM Mono;
  margin: 0;
  font-style: normal;
  font-weight: 500;
  font-size: 13px;
  line-height: 150%;
  text-align: left;
  color: #ffffff;
`;

const TokenLiquidity = styled.p`
  font-family: DM Mono;
  margin: 0;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 150%;
  text-align: right;
  color: #896bfe;
`;

const TableWrapper = styled.div`
  width: 100%;
`;

const RowWrapper = styled.div`
  padding: 10px 16px;
  border-radius: 8px;
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: space-between;
  background: ${({ withBackground }) =>
    withBackground ? "rgba(255, 255, 255, 0.05)" : "inherit"};
`;

export const Stats = () => {
  const tokens = useTokens();

  return (
    <TableWrapper>
      <RowWrapper>
        <TableHeader>Token</TableHeader>
        <TableHeader>Liquidity</TableHeader>
      </RowWrapper>
      {tokens.map((token, i) => (
        <RowWrapper withBackground={i % 2}>
          <TokenName>{token.symbol}</TokenName>
          <TokenLiquidity>{token.liquidity}</TokenLiquidity>
        </RowWrapper>
      ))}
    </TableWrapper>
  );
};
