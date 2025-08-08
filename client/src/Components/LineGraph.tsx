import React, { useEffect, useState } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import Switch from '@mui/material/Switch';
import {
  Box,
  FormControlLabel
} from "@mui/material";
import Collapse from '@mui/material/Collapse';

type Message = {
  text: string;
  type: string;
  timestamp: string;
};

type ChartPoint = {
  time: Date;
  bedTemp?: number;
  nozzleTemp?: number;
};

type LineGraphProps = {
  messages: Message[];
};

const parseTimestamp = (ts: string): Date | null => {
  const timeRegex = /^(\d{1,2}):(\d{2}):(\d{2})\s?(AM|PM)$/i;
  const match = ts.match(timeRegex);
  if (!match) return null;

  let [_, hourStr, minStr, secStr, meridian] = match;
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minStr, 10);
  const second = parseInt(secStr, 10);

  if (meridian.toUpperCase() === "PM" && hour < 12) hour += 12;
  if (meridian.toUpperCase() === "AM" && hour === 12) hour = 0;

  return new Date(1970, 0, 1, hour, minute, second);
};

const LineGraph: React.FC<LineGraphProps> = ({ messages }) => {
const [chartData, setChartData] = useState<ChartPoint[]>([]);

const [checked, setChecked] = React.useState(false);

const handleChange = () => {
  setChecked((prev) => !prev);
};

useEffect(() => {
  setChartData((prevChartData) => {
    const dataMap = new Map<string, ChartPoint>();

    // Add previous points to map for easy merging
    prevChartData.forEach(point => {
      dataMap.set(point.time.toISOString(), point);
    });

    // Process new messages and update map
    messages.forEach((msg) => {
      if (msg.type === "received" && msg.text.includes(":")) {
        const [key, valStr] = msg.text.split(":");
        const value = parseFloat(valStr);

        if (!isNaN(value) && (key === "bedTemp" || key === "nozzleTemp")) {
          const timestampKey = msg.timestamp;
          const parsedTime = parseTimestamp(timestampKey);
          if (!parsedTime) return;

          const timeKeyISO = parsedTime.toISOString();
          const existing = dataMap.get(timeKeyISO) || { time: parsedTime };

          if (key === "bedTemp") existing.bedTemp = value;
          if (key === "nozzleTemp") existing.nozzleTemp = value;

          dataMap.set(timeKeyISO, existing);
        }
      }
    });

    // Convert map values to sorted array and keep last 50 points
    const updatedData = Array.from(dataMap.values()).sort(
      (a, b) => a.time.getTime() - b.time.getTime()
    );

    return updatedData.slice(-50);
  });
}, [messages]);


  // Filter out invalid points to avoid NaN errors
  const filteredChartData = chartData.filter(
    (d) =>
      d.time instanceof Date &&
      !isNaN(d.time.getTime()) &&
      (typeof d.bedTemp === "number" || typeof d.nozzleTemp === "number")
  );

  const lineGraph = (
    <div style={{ marginTop: "2rem" }}>
        <LineChart
          height={300}
          dataset={filteredChartData}
          xAxis={[
            {
              dataKey: "time",
              scaleType: "time",
              label: "Time",
              valueFormatter: (date: Date) =>
                date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }),
            },
          ]}
          yAxis={[
            {
              label: "Temperature (°C)",
              min: 0,
              max: 300,
            },
          ]}
          series={[
            {
              dataKey: "bedTemp",
              label: "Bed Temp (°C)",
              color: "#ff6384",
            },
            {
              dataKey: "nozzleTemp",
              label: "Nozzle Temp (°C)",
              color: "#36a2eb",
            },
          ]}
        />
    </div>
  )

  return (
    <Box sx={{ bgcolor: 'primary', overflow: 'hidden', padding: 1}}>
      <FormControlLabel
        control={<Switch checked={checked} onChange={handleChange} />}
        label="Graph Values"
      />
      <Collapse in={checked}>
        <Box sx={{ mt: 1 }}>{lineGraph}</Box>
      </Collapse>
    </Box>
    );
};

export default LineGraph;
