import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

// Context Providers
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { MovieProvider } from "./contexts/MovieContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MovieProvider>
          <App />
        </MovieProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
