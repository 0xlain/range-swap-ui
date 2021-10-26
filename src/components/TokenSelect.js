import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";

export default function TokenSelect(props) {
  const { label = "Token", tokens, onChange } = props;

  const [token, setToken] = useState("");

  const handleChange = (e) => {
    setToken(e.target.value);
    onChange(e.target.value);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="token-select">{label}</InputLabel>
        <Select
          labelId="token-select"
          value={token}
          label={label}
          onChange={handleChange}
        >
          {tokens.map((token, i) => {
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
