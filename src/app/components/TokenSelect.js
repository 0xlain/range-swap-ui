import React from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Box } from "@mui/system";

export default function TokenSelect(props) {
  const { label = "Token", tokens, onChange, value } = props;

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="token-select">{label}</InputLabel>
        <Select
          labelId="token-select"
          value={value}
          label={label}
          onChange={handleChange}
        >
          {tokens?.map((token, i) => {
            const symbol = String(token.symbol);
            return (
              <MenuItem key={i} value={symbol}>
                {symbol}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </Box>
  );
}
