import React from "react";
import "./DataDisplay.css";

interface PrinterStatus {
  nozzleTemp: number;
  bedTemp: number;
  printSpeed: number;
  lineWidth: number; // mm
}

const DataDisplay: React.FC = () => {
  // Later: fetch this data from WebSocket
  const printerData: PrinterStatus = {
    nozzleTemp: 215,
    bedTemp: 60,
    printSpeed: 50, // mm/s
    lineWidth: 0.36, // mm
  };

  const getTempColor = (temp: number, type: "nozzle" | "bed") => {
    if (type === "nozzle") return temp > 240 ? "card red" : "card green";
    if (type === "bed") return temp > 80 ? "card red" : "card green";
    return "card";
  };

  const getSpeedColor = (speed: number) => {
    if (speed > 100) return "card red";
    return "card green";
  };

  const getLineWidthColor = (width: number) => {
    if (width < 0.35) return "card orange";
    if (width > 0.45) return "card red";
    return "card green";
  };

  return (
    <div className="dashboard">
      <div className="main">
        <div className="dashboard-content">
          <div className="card-grid">
            <div className={getTempColor(printerData.nozzleTemp, "nozzle")}>
              <h3>Nozzle Temp</h3>
              <p>{printerData.nozzleTemp} °C</p>
            </div>

            <div className={getTempColor(printerData.bedTemp, "bed")}>
              <h3>Bed Temp</h3>
              <p>{printerData.bedTemp} °C</p>
            </div>

            <div className={getSpeedColor(printerData.printSpeed)}>
              <h3>Print Speed</h3>
              <p>{printerData.printSpeed} mm/s</p>
            </div>

            <div className={getLineWidthColor(printerData.lineWidth)}>
              <h3>Line Width</h3>
              <p>{printerData.lineWidth.toFixed(2)} mm</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataDisplay;