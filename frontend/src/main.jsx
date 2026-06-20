import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";

import "./index.css";

import "./styles/base.css";
import "./styles/buttons.css";

import "./styles/header.css";
import "./styles/home.css";
import "./styles/templates.css";
import "./styles/auth.css";
import "./styles/wallet.css";
import "./styles/footer.css";
import "./styles/responsive.css";
import "./styles/rewards.css";

import "./styles/plans.css";
import "./styles/payment.css";
import "./styles/panel.css";
import "./styles/subscribe.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
