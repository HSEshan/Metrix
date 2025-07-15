import React from "react";
import SystemMetricsDashboard from "./SystemMetricsDashboard";

function App() {
  return <SystemMetricsDashboard apiUrl="http://localhost:8000/metrics" />;
}

export default App;
