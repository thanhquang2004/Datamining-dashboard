import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Skills from "./pages/Skills";
import Crawler from "./pages/Crawler";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="skills" element={<Skills />} />
        <Route path="crawler" element={<Crawler />} />
      </Route>
    </Routes>
  );
}

export default App;
