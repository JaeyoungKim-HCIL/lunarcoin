const CryptoJS = require("crypto.js");

class Block {
    constructor(index, hash, previousHash, timestamp, data){
        this.index = index;
        this.hash = hash;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
    }
}

const genesisBlock = new Block(
    0,
    "A1616A2B1D423AF71885230588C0F5F608CE203720EDBFCEE1E28982E34DE238",
    null,
    1531743454790,
    "The genesis block of lunarcoin"
);

let blockchain = [genesisBlock];

const getPreviousBlock = () => blockchain[blockchain.length - 1];

const getTimestamp = () => new Date().getTime() / 1000;

const getBlockchain = () => blockchain;

const createHash = (index, previousHash, timestamp, data) => 
    CryptoJS.sha256(index + previousHash + timestamp + JSON.stringify(data)).toString();

const createNewBlock = data => {
    const previousBlock = getPreviousBlock();
    const newBlockIndex = previousBlock.index + 1;
    const newTimestamp = getTimestamp();
    const newHash = createHash(
        newBlockIndex, 
        previousBlock.hash, 
        newTimestamp,
        data
    );
    const newBlock = new Block(
        newBlockIndex,
        newHash,
        previousBlock.hash,
        newTimestamp,
        data
    );
    addNewBlock(newBlock);
    return newBlock;
};

const getBlockHash = block => createHash(block.index, block.previousHash, block.timestamp, block.data);

const isNewBlockValid = (candidateBlock, latestBlock) => {
    if(!isNewBlockStructureValid(candidateBlock)){
        console.log("The candidate block structure is not valid");
        return false;
    }
    else if(latestBlock.index + 1 !== candidateBlock.index){
        console.log("The candidate block index is not valid");
        return false;
    } else if(latestBlock.hash !== candidateBlock.previousHash){
        console.log("The previousHash of the candidate block is not vaild");
        return false;
    } else if(getBlockHash(candidateBlock) !== candidateBlock.hash) {
        console.log("The hash of candidate block is not valid");
        return false;
    }
    return true;
};

const isNewBlockStructureValid = block => {
    return (
        typeof block.index === "number" && 
        typeof block.hash == "string" && 
        typeof block.previousHash === "string" &&
        typeof block.timestamp === "number" &&
        typeof block.data == "string"
    );
};

const isBlockchainValid = candidateChain => {
    const isGenesisValid = block => {
        return JSON.stringify(block) === JSON.stringify(genesisBlock);
    };
    if(!isGenesisValid(candidateChain[0])) {
        console.log("The candidate blockchain's gensisBlock is not valid");
        return false;
    }
    for(let i = 1; i < candidateChain.length; i++){
        if(!isNewBlockValid(candidateChain[i], candidateChain[i - 1])){
            return false;
        }
    }
    return true;
};

const replaceChain = candidateChain => {
    if(isBlockchainValid(candidateChain) && candidateChain.length > getBlockchain().length) {
        blockchain = candidateChain;    
        return true;
    } else {
        return false;
    }
};

const addNewBlock = candidateBlock => {
    if(isNewBlockValid(candidateBlock, getPreviousBlock())) {
        getBlockchain().push(candidateBlock);
        return true;
    } else {
        return false;
    }
};

module.exports = {
    getBlockchain,
    createNewBlock
};