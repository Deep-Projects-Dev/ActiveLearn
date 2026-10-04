import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./pages/home.jsx";
import LearnRouter from "./learn/learn-router.jsx";
import SchoolRouter from "./school/school-router.jsx";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/learn/*" element={<LearnRouter />} />
        <Route path="/school/*" element={<SchoolRouter />} />
      </Routes>
    </BrowserRouter>
  )
}
