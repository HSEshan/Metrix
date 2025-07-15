import React, { useState, useEffect } from "react";
import {
  Activity,
  BarChart2,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Clock,
  Server,
  RefreshCw,
} from "lucide-react";

const SystemMetricsDashboard = ({
  apiUrl = "http://localhost:8000/metrics",
}) => {
  // State for metrics and loading/error handling
  const [metrics, setMetrics] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch metrics function
  const fetchMetrics = async (isInitial = false) => {
    try {
      // Manage different loading states
      if (isInitial) {
        setIsInitialLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch metrics");
      }
      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setMetrics(null);
    } finally {
      // Reset loading states
      if (isInitial) {
        setIsInitialLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  // Fetch metrics on component mount and setup periodic refresh
  useEffect(() => {
    fetchMetrics(true);
    const intervalId = setInterval(() => fetchMetrics(), 1000); // Refresh every 1 second

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [apiUrl]);

  // Helper function to determine color based on usage percentage
  const getUsageColor = (percentage) => {
    if (percentage < 50) return "bg-green-500";
    if (percentage < 75) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Helper function to format percentage
  const formatPercentage = (value) => `${value.toFixed(1)}%`;

  // Render initial loading state
  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="flex items-center space-x-3">
          <RefreshCw className="animate-spin text-blue-600" size={32} />
          <span className="text-xl text-gray-700">Loading metrics...</span>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => fetchMetrics()}
            disabled={isRefreshing}
            className={`flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 
    ${isRefreshing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <RefreshCw
              className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              size={16}
            />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // If no metrics or metrics is not an object
  if (!metrics || typeof metrics !== "object") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-gray-700">No metrics available</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Server className="mr-3 text-blue-600" /> System Performance
            Dashboard
          </h1>
          <button
            onClick={() => fetchMetrics()}
            disabled={isRefreshing}
            className={`flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 
              ${isRefreshing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isRefreshing ? (
              <RefreshCw className="mr-2 animate-spin" size={16} />
            ) : (
              <RefreshCw className="mr-2" size={16} />
            )}
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Metrics cards remain the same as in previous version */}
          {/* CPU Usage */}
          <div className="bg-white shadow-md rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <Cpu className="text-blue-600" />
              <span
                className={`px-3 py-1 rounded ${getUsageColor(
                  metrics.cpu_usage_percent
                )}`}
              >
                {formatPercentage(metrics.cpu_usage_percent)}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-700">CPU Usage</h2>
          </div>

          {/* Memory Usage */}
          <div className="bg-white shadow-md rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <MemoryStick className="text-green-600" />
              <span
                className={`px-3 py-1 rounded ${getUsageColor(
                  metrics.memory_usage_percent
                )}`}
              >
                {formatPercentage(metrics.memory_usage_percent)}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-700">
              Memory Usage
            </h2>
          </div>

          {/* Disk Usage */}
          <div className="bg-white shadow-md rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <HardDrive className="text-purple-600" />
              <span
                className={`px-3 py-1 rounded ${getUsageColor(
                  metrics.disk_usage_percent
                )}`}
              >
                {formatPercentage(metrics.disk_usage_percent)}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-700">Disk Usage</h2>
          </div>

          {/* Network Metrics */}
          <div className="bg-white shadow-md rounded-lg p-5">
            <div className="flex items-center mb-4">
              <Network className="text-indigo-600 mr-3" />
              <h2 className="text-lg font-semibold text-gray-700">Network</h2>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Sent</span>
                <span>{metrics.network_sent_mbytes.toFixed(1)} MB</span>
              </div>
              <div className="flex justify-between">
                <span>Received</span>
                <span>{metrics.network_received_mbytes.toFixed(1)} MB</span>
              </div>
            </div>
          </div>

          {/* System Details */}
          <div className="bg-white shadow-md rounded-lg p-5">
            <div className="flex items-center mb-4">
              <Clock className="text-orange-600 mr-3" />
              <h2 className="text-lg font-semibold text-gray-700">
                System Details
              </h2>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Uptime</span>
                <span>{metrics.system_uptime}</span>
              </div>
              <div className="flex justify-between">
                <span>Running Processes</span>
                <span>{metrics.running_processes}</span>
              </div>
            </div>
          </div>

          {/* Load Average */}
          <div className="bg-white shadow-md rounded-lg p-5">
            <div className="flex items-center mb-4">
              <BarChart2 className="text-teal-600 mr-3" />
              <h2 className="text-lg font-semibold text-gray-700">
                Load Average
              </h2>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>1 min</span>
                <span>{metrics.load_average["1_min"]}</span>
              </div>
              <div className="flex justify-between">
                <span>5 min</span>
                <span>{metrics.load_average["5_min"]}</span>
              </div>
              <div className="flex justify-between">
                <span>15 min</span>
                <span>{metrics.load_average["15_min"]}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMetricsDashboard;
