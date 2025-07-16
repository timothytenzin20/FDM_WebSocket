import React from "react";
import "./DataDisplay.css";
import { Box, Typography } from "@mui/material";

// interface PrinterStatus {
//   // nozzleTemp: number;
//   bedTemp: number;
//   // printSpeed: number;
//   // lineWidth: number; // mm
// }

type DataDisplayProps = {
  bedTemp: {
    text: string;
    type: string;
    timestamp: string;
  };
};

const DataDisplay: React.FC<DataDisplayProps> = ({ bedTemp }) => {
  // const printerData: PrinterStatus = {
  //   // nozzleTemp: 215,
  //   bedTemp: 60,
  //   // printSpeed: 50, // mm/s
  //   // lineWidth: 0.36, // mm
  // };

  const getTempColor = (temp: number, type: "nozzle" | "bed") => {
    if (type === "nozzle") return temp > 265 ? "card red" : "card green";
    if (type === "bed") return temp > 75 ? "card red" : "card green";
    return "card";
  };

  // const getSpeedColor = (speed: number) => {
  //   if (speed > 100) return "card red";
  //   return "card green";
  // };

  // const getLineWidthColor = (width: number) => {
  //   if (width < 0.35) return "card orange";
  //   if (width > 0.45) return "card red";
  //   return "card green";
  // };

  return (
    <div className="dashboard">
      <div className="main">
        <div className="dashboard-content">
          <div className="card-grid">
          <Box>
             <div className={getTempColor(parseFloat(bedTemp.text.slice(11, -1)), "bed")}>
                {bedTemp.type === "received" && bedTemp.text.slice(2, 9) == "bedTemp" && (
                  <div>
                    <p>Bed Temp: {parseFloat(bedTemp.text.slice(11, -1))} °C</p>
                    <Typography variant="caption" color="text.secondary">
                      {bedTemp.timestamp}
                    </Typography>
                  </div>
                )}
             </div>
          </Box>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataDisplay;