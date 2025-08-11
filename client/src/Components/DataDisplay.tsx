import React, { useState, useEffect } from "react";
import "./DataDisplay.css";
import { Typography } from "@mui/material";
import { Gauge } from '@mui/x-charts/Gauge';
import LineGraph from "./LineGraph"

type DataDisplayProps = {
  data: {
    text: string;
    type: string;
    timestamp: string;
  }[];
};

const DataDisplay: React.FC<DataDisplayProps> = ({ data }) => {
  const [printerData, setprinterData] = useState({
    bedTemp: null as number | null,
    nozzleTemp: null as number | null,
    printSpeed: null as number | null,
    predictedLineWidth: null as number | null,
    lineWidth: null as number | null,
    nozzleDiameter: null as number | null,
  });

  useEffect(() => {
    // Process all received messages to build up data
    const newPrinterData = { ...printerData };
    
    data.forEach(message => {
      if (message.type === "received" && message.text.includes(":")) {
        const [category, valueStr] = message.text.split(":");
        const value = parseFloat(valueStr);
        
        if (!isNaN(value)) {
          switch (category) {
            case "bedTemp":
              newPrinterData.bedTemp = value;
              break;
            case "nozzleTemp":
              newPrinterData.nozzleTemp = value;
              break;
            case "printSpeed":
              newPrinterData.printSpeed = value;
              break;
            case "predictedLineWidth":
              newPrinterData.predictedLineWidth = value;
              break;
            case "lineWidth":
              newPrinterData.lineWidth = value;
              break;
            case "nozzleDiameter":
              newPrinterData.nozzleDiameter = value;
              break;
          }
        }
      }
    });
    
    setprinterData(newPrinterData);
  }, [data]); // Depend on the entire messages array

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
    if (width < (printerData.predictedLineWidth !== null ? printerData.predictedLineWidth : 0.35)) return "#f97316";
    if (width > (printerData.predictedLineWidth !== null ? printerData.predictedLineWidth : 0.45)) return "#ef4444";
    return "#10b981";
  };

  const getNozzleDiameterColor = (diameter: number) => {
    if (diameter < 0.5) return "#f97316";
    if (diameter > 0.5) return "#ef4444";
    return "#10b981";
  };

  const lineScale = 4.1;
  const nozzleScale = 4.1;

  const lineWidthPx = Math.max(
    (printerData.lineWidth != null ? printerData.lineWidth * lineScale : 10)
  );
  const nozzleDiameterPx = Math.max(
    (printerData.nozzleDiameter != null ? printerData.nozzleDiameter * nozzleScale : 10)
  );

  const hasData = Object.values(printerData).some(value => value !== null);
  const latestMessage = data.length > 0 ? data[data.length - 1] : null;

  return (
    <div className="dashboard">
      <div className="main">
        <div className="dashboard-content">
          <div className="card-grid">
            {hasData ? (
              <div>
                <h2 className="topbar-title">Printer Status Overview</h2>
                <div className="flex">
                  {/* ...existing gauge cards... */}
                  <div className={`tooltip flex-container ${printerData.bedTemp !== null ? getTempColor(printerData.bedTemp, "bed") : "card"}`}>
                    <p>Bed Temperature:</p>
                    <span className="tooltiptext"> Red Gauge: Greater than 75°C <br/> Green Gauge: Less than 75°C</span>
                    <Gauge 
                      height={150} 
                      value={printerData.bedTemp ?? 0} 
                      valueMin={0} 
                      valueMax={300} 
                      startAngle={-110} 
                      endAngle={110}  
                      text={`${printerData.bedTemp?.toFixed(2) ?? "--"}°C`}/>                
                    <Typography variant="caption" color="text.secondary">
                      {latestMessage?.timestamp}
                    </Typography>
                  </div>
                  <div className={`tooltip flex-container ${printerData.nozzleTemp !== null ? getTempColor(printerData.nozzleTemp, "nozzle") : "card"}`}>
                    <p>Nozzle Temperature:</p>
                    <span className="tooltiptext"> Red Gauge: Greater than 265°C <br/> Green Gauge: Less than 265°C</span>
                    <Gauge 
                      height={150} 
                      value={printerData.nozzleTemp ?? 0} 
                      valueMin={0} 
                      valueMax={300} 
                      startAngle={-110} 
                      endAngle={110}  
                      text={`${printerData.nozzleTemp?.toFixed(2) ?? "--"}°C`}/>                
                    <Typography variant="caption" color="text.secondary">
                      {latestMessage?.timestamp}
                    </Typography>
                  </div>
                  <div className={`tooltip flex-container ${printerData.printSpeed !== null ? getSpeedColor(printerData.printSpeed) : "card"}`}>
                    <p>Print Speed:</p>
                    <span className="tooltiptext"> Red Gauge: Greater than 100 mm/s <br/> Green Gauge: Less than 100 mm/s</span>
                    <Gauge 
                      height={150} 
                      value={printerData.printSpeed ?? 0} 
                      valueMin={0} 
                      valueMax={150} 
                      startAngle={-110} 
                      endAngle={110}  
                      text={`${printerData.printSpeed?.toFixed(2) ?? "--"}mm/s`}/>                
                    <Typography variant="caption" color="text.secondary">
                      {latestMessage?.timestamp}
                    </Typography>
                  </div>
                </div>
                <LineGraph messages={data}></LineGraph>
                <h2 className="topbar-title flex">Image Processing Results</h2>
                <div className="image-processing-results">
                  <div className="image-bars">
                    <div className="image-bar">
                      <p>Predicted Line Width: {printerData.predictedLineWidth?.toFixed(3) ?? "--"} mm</p>
                      <div
                        className="bar predicted-bar"
                        style={{
                          width: `${printerData.predictedLineWidth !== null ? printerData.predictedLineWidth * lineScale : lineWidthPx}px`,
                        }}
                      />
                    </div>
                    <div className="image-bar">
                      <p>Line Width: {printerData.lineWidth?.toFixed(3) ?? "--"} mm</p>
                      <div
                        className="bar"
                        style={{
                          width: `${lineWidthPx}px`,
                          backgroundColor: `${getLineWidthColor(printerData.lineWidth != null ? printerData.lineWidth : 0)}`,
                        }}
                      />
                    </div>
                    <div className="image-bar">
                      <p>Nozzle Diameter: {printerData.nozzleDiameter?.toFixed(3) ?? "--"} mm</p>
                      <div
                        className="circle"
                        style={{
                          width: `${nozzleDiameterPx}px`,
                          height: `${nozzleDiameterPx}px`,
                          backgroundColor: `${getNozzleDiameterColor(printerData.nozzleDiameter != null ? printerData.nozzleDiameter : 0)}`,
                        }}
                      />
                    </div>
                  </div>
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