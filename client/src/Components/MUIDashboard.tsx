import React, { useState, useEffect, useRef } from "react";
import Dashboard from "./DataDisplay";

import {
  Box,
  Button,
  TextField,
  Typography,
  CssBaseline,
  Paper,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

function MUIDashboard() {
  const wsToken = process.env.REACT_APP_TOKEN;
  const wsProtocol = process.env.REACT_APP_PROTOCOL;
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ text: string; type: string; timestamp: string }[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(true);

  // Establish WebSocket connection on load
  
  useEffect(() => {
    connect();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  // Send a message
  const sendMessage = () => {
    if (socket && message.trim() && socket.readyState === WebSocket.OPEN) {
      const sentMsg = {
        text: message,
        type: "sent",
        timestamp: new Date().toLocaleTimeString(),
      };
      socket.send(message);
      setMessages((prev) => [...prev, sentMsg]);
      setMessage("");
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const connect = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }

    const ws = new WebSocket(
      `ws://localhost:3000?token=${wsToken}`,
      ['testing']
    );

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      setIsConnected(true);
      setIsDisconnected(false);
    };

    ws.onmessage = (event) => {
      const receivedMsg = {
        text: event.data,
        type: "received",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, receivedMsg]);
    };
    
    ws.onclose = () => {
      console.log("Disconnected from WebSocket server");
      setIsConnected(false);
      setIsDisconnected(true);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setSocket(ws);
    socketRef.current = ws;
  };

  const disconnect = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
      setSocket(null);
    }
  };

  const handleReconnect = () => {
      connect();
  };

  const handleDisconnect = () => {
      disconnect();
  }

  return (
    <div>
      <Box sx={{ padding: 2, maxWidth: 6000, margin: "0 auto" }}>
        <h2 className="topbar-title">Printer Status Overview</h2>
        <CssBaseline /> {/* Ensures consistent baseline styling */}
        <Typography variant="h4" gutterBottom align="center"/>
        {/*  */}
        {messages.length > 0 && <Dashboard data={messages[messages.length - 1]} />}
        {/*  */}
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter a command..."
            disabled={!isConnected}
          />
          <Button
            variant="contained"
            color="primary"
            endIcon={<SendIcon />}
            onClick={sendMessage}
            disabled={!isConnected}
          >
            Send
          </Button>
          
        </Box>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-start", alignItems: "center", padding: 1 }}>
          <Typography
          variant="body2"
          color={isConnected ? "success.main" : "error.main"}
          align="left"
          gutterBottom
        >
          Status: {isConnected ? "Connected" : "Disconnected"}
        </Typography>
        <div>
            {isConnected ? (
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={
                  handleDisconnect
                }
              >
                Disconnect from WebSocket
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={
                  handleReconnect
                }
              >
                Connect to WebSocket
              </Button>
            )}
          </div>
        </Box>
      </Box>
    </div>
  );
}

export default MUIDashboard
