const WebSockets = require("ws"),
Blockchain = require("./blockchain");


const { getNewestBlock, isBlockStructureValid, replaceChain } = Blockchain;

const sockets = [];

// Message Types
const GET_LATEST = "GET_LATEST";
const GET_ALL = "GET_ALL";
const BLOCKCHAIN_RESPONSE = "BLOCKCHAIN_RESPONSE";

// Message Creators
const getLatest = () => {
    return {
        type: GET_LATEST,
        data: null
    };
};

const getAll = () => {
    return {
        type: GET_ALL,
        data: null
    };
};

const blockchainResponse = (data) => {
    return {
        type: BLOCKCHAIN_RESPONSE,
        data
    };
};

const getSockets = () => sockets

const startP2PServer = server => {
    const wsServer = new WebSockets.Server({ server });
    wsServer.on("connection", ws => {
        initSocketConnection(ws);
    });
    console.log("Lunarcoin P2P Server is runnning");
}; 

const initSocketConnection = ws => {
    sockets.push(ws);
    handleSocketMessages(ws);
    handleSocketError(ws);
    sendMessaage(ws, getLatest());
};

const parseData = data => {
    try {
      return JSON.parse(data)
    } catch(e) {
        console.log(e)
        return null;
    }
}

const handleSocketMessages = ws => {
    ws.on("message", data => {
        const message = parseData(data);
        if(message === null){
            return;
        }
        console.log(message);
        switch(message.type){
            case GET_LATEST:
                sendMessaage(ws, responseLatest());
                break;
            case BLOCKCHAIN_RESPONSE:
                const receivedBlocks = message.data
                if(receivedBlocks === null){
                    break;
                }
                handleBlockchainResponse(receivedBlocks);
                break;
        }
    });
};

const handleBlockchainResponse = receivedBlocks => {
    if(receivedBlocks.length === 0){
        console.log("Received blocks have a length 0");
        return;
    }
    const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    if(!isBlockStructureValid(latestBlockReceived)){
        console.log("The block structure of the block received is not valid")
        return;
    }
    const newestBlock = getNewestBlock();
    if(latestBlockReceived.index > newestBlock.index){
        if(newestBlock.hash === latestBlockReceived.previousHash){
            addBlockToChain(latestBlockReceived);
        } else if(receivedBlocks.length === 1){
            // Get all blocks
        } else {
            replaceChain(receivedBlocks);
        }
    }
};

const sendMessaage = (ws, message) => ws.send(JSON.stringify(message));

const responseLatest = () => blockchainResponse([getNewestBlock()])

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