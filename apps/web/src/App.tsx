import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { SenaCrmApp } from "./components/senaCrm/SenaCrmApp";
import { DEFAULT_PATH } from "./routes/senaRoutes";

export function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Routes>
        <Route path="/" element={<Navigate to={DEFAULT_PATH} replace />} />
        {/* Rota única: o shell permanece montado e a tab ativa vem da URL. */}
        <Route path="/*" element={<SenaCrmApp />} />
      </Routes>
    </div>
  );
}

export default App;
