import { renderToString } from "react-dom/server";
import App from "./App.jsx";

// Runs only at build time, so content remains available without JavaScript.
export function render() {
  return renderToString(<App />);
}
