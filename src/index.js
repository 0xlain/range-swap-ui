import React from "react";
import ReactDOM from "react-dom";
import { Web3ReactProvider } from "@web3-react/core";

import { CssBaseline, createTheme, ThemeProvider } from "@mui/material";

import "./index.css";
import { App } from "./App_v2/App";

const Web3 = require("web3");

function getLibrary(provider, connector) {
  return new Web3(provider);
}

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#8d7dc7",
    },
    secondary: {
      main: "#59318C59",
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Web3ReactProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
