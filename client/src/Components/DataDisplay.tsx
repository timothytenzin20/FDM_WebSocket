// TBD: max 300 deg and 150 mm/s (spedometer style display)

import React, { useState, useEffect } from "react";
import "./DataDisplay.css";
import { Box, Typography } from "@mui/material";
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import theme from "./Theme";

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
  const [nozzleDiameter, setNozzleDiameter] = useState<number | null>(null);

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
    } else if (category === "nozzleDiameter") {
      setNozzleDiameter(value);
    }
  };

  const getTempColor = (temp: number, type: "nozzle" | "bed") => {
    if (type === "nozzle") return temp > 265 ? "card red" : "card green";
    if (type === "bed") return temp > 75 ? "card red" : "card green";
    return "card";
  };

  const getSpeedColor = (speed: number) => {
    if (speed > 100) return "card red";
    return "card green";
  };

  const getLineWidthColor = (width: number) => {
    if (width < 0.35) return "#f97316";
    if (width > 0.45) return "#ef4444	";
    return "#10b981";
  };

  const getNozzleDiameterColor = (diameter: number) => {
    if (diameter < 0.5) return "#f97316";
    if (diameter > 0.5) return "#ef4444	";
    return "#10b981";
  };

    const lineScale = 10; // px per mm for line width
  const nozzleScale = 20; // px per mm for nozzle diameter

  const lineWidthPx = Math.max(
  (lineWidth != null ? lineWidth * lineScale : 10) // if lineWidth exists, scale it, else 0 (SET TO 10 FOR NOW)
);
const nozzleDiameterPx = Math.max(
  (nozzleDiameter != null ? nozzleDiameter * nozzleScale : 10) // if lineWidth exists, scale it, else 0 (SET TO 10 FOR NOW)
);

  return (
    <div className="dashboard">
      <div className="main">
        <div className="dashboard-content">
          <div className="card-grid">
            {(bedTemp !== null || nozzleTemp !== null || printSpeed !== null || lineWidth !== null || nozzleDiameter !== null) ? (
              <div>
                <h2 className="topbar-title">Printer Status Overview</h2>
                <div className="flex">
                  <div className={`flex-container ${bedTemp !== null ? getTempColor(bedTemp, "bed") : "card"}`}>
                    <p>Bed Temperature:</p>
                    <Gauge 
                      height={150} 
                      value={bedTemp ?? 0} 
                      valueMin={0} 
                      valueMax={300} 
                      startAngle={-110} 
                      endAngle={110}  
                      text={`${bedTemp?.toFixed(2) ?? "--"}°C`}/>                
                    <Typography variant="caption" color="text.secondary">
                    {data.timestamp}
                    </Typography>
                  </div>
                  <div className={`flex-container ${nozzleTemp !== null ? getTempColor(nozzleTemp, "nozzle") : "card"}`}>
                    <p>Nozzle Temperature:</p>
                    <Gauge 
                      height={150} 
                      value={nozzleTemp ?? 0} 
                      valueMin={0} 
                      valueMax={300} 
                      startAngle={-110} 
                      endAngle={110}  
                      text={`${nozzleTemp?.toFixed(2) ?? "--"}°C`}/>                
                    <Typography variant="caption" color="text.secondary">
                    {data.timestamp}
                    </Typography>
                  </div>
                  <div className={`flex-container ${printSpeed !== null ? getSpeedColor(printSpeed) : "card"}`}>
                    <p>Print Speed:</p>
                    <Gauge 
                      height={150} 
                      value={nozzleTemp ?? 0} 
                      valueMin={0} 
                      valueMax={150} 
                      startAngle={-110} 
                      endAngle={110}  
                      text={`${nozzleTemp?.toFixed(2) ?? "--"}mm/s`}/>                
                    <Typography variant="caption" color="text.secondary">
                    {data.timestamp}
                    </Typography>
                  </div>
                </div>
                <h2 className="topbar-title">Image Processing Results</h2>
                <div className="flex flex-container">
                      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <div>
                          <p>Line Width: {lineWidth} mm</p>
                          <div
                            style={{
                              width: '100px',
                              height: `${lineWidthPx}px`,
                              backgroundColor: `${getLineWidthColor(lineWidth != null ? lineWidth : 0)}`,
                              borderRadius: '4px',
                            }}
                          />
                        </div>
                        <div>
                          <p>Nozzle Diameter: {nozzleDiameter} mm</p>
                          <div
                            style={{
                              width: `${nozzleDiameterPx}px`,
                              height: `${nozzleDiameterPx}px`,
                              backgroundColor: `${getNozzleDiameterColor(lineWidth != null ? lineWidth : 0)}`,
                              borderRadius: '50%',
                              border: '1px solid',
                            }}
                          />
                        </div>
                      </div>
                  {/* <div className={`flex-container ${lineWidth !== null ? getLineWidthColor(lineWidth) : "card"}`}>
                    <p>Line Width:</p>
                    <Gauge 
                      height={150} 
                      value={lineWidth ?? 0} 
                      valueMin={0} 
                      // valueMax={300} 
                      startAngle={-110} 
                      endAngle={110}  
                      text={`${lineWidth?.toFixed(2) ?? "--"}mm`}/>                
                    <Typography variant="caption" color="text.secondary">
                    {data.timestamp}
                    </Typography>
                  </div>
                  <div className={`flex-container ${nozzleDiameter !== null ? getNozzleDiameterColor(nozzleDiameter) : "card"}`}>
                    <p>Nozzle Diameter:</p>
                    <Gauge 
                      height={150} 
                      value={nozzleDiameter ?? 0} 
                      valueMin={0} 
                      valueMax={300} 
                      startAngle={-110} 
                      endAngle={110}  
                      text={`${nozzleDiameter?.toFixed(2) ?? "--"}mm`}/>                
                    <Typography variant="caption" color="text.secondary">
                    {data.timestamp}
                    </Typography>
                  </div> */}
                </div>
            </div>
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