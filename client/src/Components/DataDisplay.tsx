import React, { useState, useEffect } from "react";
import "./DataDisplay.css";
import { Box, Typography } from "@mui/material";

// interface PrinterStatus {
//   // nozzleTemp: number;
//   bedTemp: number;
//   // printSpeed: number;
//   // lineWidth: number; // mm
// }

type DataDisplayProps = {
  data: {
    text: string;
    type: string;
    timestamp: string;
  };
};

const DataDisplay: React.FC<DataDisplayProps> = ({ data }) => {
  const [bedTemp, setBedTemp] = useState<number | null>(null);
  const [nozzleTemp, setNozzleTemp] = useState<number | null>(null);
  const [printSpeed, setPrintSpeed] = useState<number | null>(null);
  const [lineWidth, setLineWidth] = useState<number | null>(null);

  useEffect(() => {
    const category = data.text.slice(data.text.indexOf("\"") + 1, data.text.indexOf("\"", 2));
    if (data.type === "received") {
      parseData(data, category)
    }
  }, [data]);

  const parseData = (
    data: { text: string; type: string; timestamp: string },
    category: string
  ) => {
    const value = parseFloat(data.text.slice(data.text.indexOf(":") + 1, -1));
    if (category === "bedTemp") {
      setBedTemp(value);
    } else if (category === "nozzleTemp") {
      setNozzleTemp(value);
    } else if (category === "printSpeed") {
      setPrintSpeed(value);
    } else if (category === "lineWidth") {
      setLineWidth(value);
    }
  };

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
            {(bedTemp !== null || nozzleTemp !== null || printSpeed !== null || lineWidth !== null) ? (
              <>
              <div className={bedTemp !== null ? getTempColor(bedTemp, "bed") : "card"}>
                <p>Bed Temp: {bedTemp ?? "--"} °C</p>
                <Typography variant="caption" color="text.secondary">
                {data.timestamp}
                </Typography>
              </div>
              <div className={nozzleTemp !== null ? getTempColor(nozzleTemp, "nozzle") : "card"}>
                <p>Nozzle Temp: {nozzleTemp ?? "--"} °C</p>
                <Typography variant="caption" color="text.secondary">
                {data.timestamp}
                </Typography>
              </div>
              <div className="card">
                <p>Print Speed: {printSpeed ?? "--"} mm/s</p>
                <Typography variant="caption" color="text.secondary">
                {data.timestamp}
                </Typography>
              </div>
              <div className="card">
                <p>Line Width: {lineWidth ?? "--"} mm</p>
                <Typography variant="caption" color="text.secondary">
                {data.timestamp}
                </Typography>
              </div>
              </>
            ) : (
              <p>No Data Received</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataDisplay;