const resolvedPromise = Promise.resolve();

let readRunning = false;
let writeRunning = false;
const readQueue = [];
const writeQueue = [];

const resolveRead = () => {
    while (readQueue.length) {
        readQueue.shift()();
    }

    readRunning = false;
};

const resolveWrite = () => {
    resolvedPromise.then(() => {
        while (writeQueue.length) {
            writeQueue.shift()();
        }

        writeRunning = false;
    });
};

export function read(fn){
    readQueue.push(fn);

    if(!readRunning){
        readRunning = true;
        resolvedPromise.then(resolveRead);
    }
}

export function write(fn) {
    writeQueue.push(fn);

    if(!writeRunning){
        writeRunning = true;
        read(resolveWrite);
    }
}


