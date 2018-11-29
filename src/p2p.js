const WebSockets = require("ws");

const sockets = [];

const getSockets = () => sockets

const startP2PServer = server => {
    const wsServer = new WebSockets.Server({ server });
    wsServer.on("connection", ws => {
        initSocketConnection(ws);
    });
    console.log("Lunarcoin P2P Server is runnning");
}; 

const initSocketConnection = socket => {
    sockets.push(socket);
    handleSocketError(socket);
    socket.on("message", (data) => {
        console.log(data);
    })
    setTimeout(() => { 
        socket.send("welcome");
    }, 5000);
};

const handleSocketError = ws => {
    const closeSocketConnection = ws => {
        ws.close()
        sockets.splice(sockets.indexOf(ws), 1);
    };
    ws.on("Close", () => closeSocketConnection(ws));
    ws.on("Error", () => closeSocketConnection(ws));
};

const connectToPeers = newPeer => {
    const ws = new WebSockets(newPeer);
    ws.on("open", () => {
        initSocketConnection(ws);
    });
};

module.exports = {
    startP2PServer,
    connectToPeers
};