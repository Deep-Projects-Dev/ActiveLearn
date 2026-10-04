import { BrowserRouter, Routes, Route } from "react-router";
import Learn from "./learn-home.jsx";

export default function LearnRouter() {
  return (
    <Routes>
      <Route index element={<Learn />} />
    </Routes>
  )
}
