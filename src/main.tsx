import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { TasksApp } from "./TaskApp";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TasksApp />
  </StrictMode>
);
