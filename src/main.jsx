import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";
import "./theme.css";

const container = document.getElementById("root");
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);
// Production HTML already contains the page; development renders it directly.
if (container.children.length > 0) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
