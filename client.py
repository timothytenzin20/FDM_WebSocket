import websocket
ws = websocket.WebSocket()
ws.connect("ws://localhost:3000?token=1239165", subprotocols=["secure-guelph-user"])
ws.send("Hello, Server")
print(ws.recv())
ws.close()
