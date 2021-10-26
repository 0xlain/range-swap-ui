import React from "react";
import ReactDOM from "react-dom";
import { Web3ReactProvider } from "@web3-react/core";

import { CssBaseline, createTheme, ThemeProvider } from "@mui/material";
import { blue, pink } from "@mui/material/colors";

import "./index.css";
import App from "./App";

const Web3 = require("web3");

function getLibrary(provider, connector) {
  return new Web3(provider);
}

window.ethereum.enable();

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: blue[500],
    },
    secondary: {
      main: pink[300],
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
