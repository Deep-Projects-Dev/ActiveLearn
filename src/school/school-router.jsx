import { BrowserRouter, Routes, Route } from "react-router";
import School from "./school-home.jsx";
import WaveOptics from "./pages/WaveOptics.jsx";
import VectorAlgebra from "./pages/VectorAlgebra.jsx";

export default function SchoolRouter() {
  return (
    <Routes>
      <Route index element={<School />} />
      <Route path="wave-optics" element={<WaveOptics />} />
      <Route path="vector-algebra" element={<VectorAlgebra />} />
    </Routes>
  )
}
