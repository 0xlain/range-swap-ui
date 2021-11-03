import { useReducer, useMemo, createContext } from "react";
import Snackbar from "@mui/material/Snackbar";
import { ALERT_TYPES } from "../utils/constants";
import MuiAlert from "@mui/material/Alert";

const initialState = { open: false, message: "", messageType: "" };
export const AlertContext = createContext({});

const ACTIONS = {
  SHOW: "show",
  HIDE: "hide",
};

const reducer = (_, action) => {
  switch (action.type) {
    case ACTIONS.SHOW:
      return {
        open: true,
        message: action.message,
        messageType: action.messageType,
      };
    case ACTIONS.HIDE:
      return { open: false, message: "", messageType: "" };
    default:
      throw new Error();
  }
};

const Alert = ({ open, handleClose, message, messageType }) => (
  <Snackbar
    autoHideDuration={3000}
    anchorOrigin={{ vertical: "top", horizontal: "left" }}
    open={open}
    onClose={handleClose}
  >
    <MuiAlert onClose={handleClose} severity={messageType}>
      {message}
    </MuiAlert>
  </Snackbar>
);

export const AlertContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const handleClose = (_, reason) => {
    if (reason === "clickaway") {
      return;
    }

    dispatch({ type: ACTIONS.HIDE });
  };

  const showAlert = ({ message, type }) => {
    if (type === ALERT_TYPES.ERROR || type === ALERT_TYPES.INFO) {
      dispatch({ type: ACTIONS.SHOW, message, messageType: type });
    }
  };

  const value = useMemo(
    () => ({
      showAlert,
    }),
    []
  );

  return (
    <AlertContext.Provider value={value}>
      <Alert
        open={state.open}
        handleClose={handleClose}
        message={state.message}
        messageType={state.messageType}
      />
      {children}
    </AlertContext.Provider>
  );
};
