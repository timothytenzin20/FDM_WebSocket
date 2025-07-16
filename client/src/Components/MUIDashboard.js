import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  CssBaseline,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

function MUIDashboard() {
  const wsToken = process.env.REACT_APP_TOKEN;
  const wsProtocol = process.env.REACT_APP_PROTOCOL;
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Establish WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(
      `ws://localhost:3000?token=${wsToken}`,
      ['testing']
    );

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      setIsConnected(true);
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
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setSocket(ws);

    return () => ws.close();
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
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <Box sx={{ padding: 3, maxWidth: 6000, margin: "0 auto" }}>
      <CssBaseline /> {/* Ensures consistent baseline styling */}
      <Typography variant="h4" gutterBottom align="center">
        WebSocket Chat
      </Typography>
      <Typography
        variant="body2"
        color={isConnected ? "success.main" : "error.main"}
        align="center"
        gutterBottom
      >
        Status: {isConnected ? "Connected" : "Disconnected"}
      </Typography>
      <Paper
          sx={{
          padding: 2,
          height: 400,
          overflowY: "auto",
          backgroundColor: "#f5f5f5",
        }}
      >
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              justifyContent: msg.type === "sent" ? "flex-end" : "flex-start",
              mb: 1,
            }}
          >
            <Paper
              sx={{
                padding: 1,
                backgroundColor:
                  msg.type === "sent" ? "#d1e7dd" : "#f8d7da",
                maxWidth: "70%",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {msg.timestamp}
              </Typography>
              <Typography variant="body1">{msg.text}</Typography>
            </Paper>
          </Box>
        ))}
      </Paper>
      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
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
    </Box>
  );
}

export default MUIDashboard
