const worker = new Worker('timerworker.mjs');

let currentID = 0;
const callbacks = {};
const idPool = [];

export function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

export function sleepWorker(time) {
    return new Promise(resolve => setTimeoutWorker(resolve, time));
}

export function setTimeoutWorker(callback, time) {
    let id;
    if (idPool.length == 0) id = currentID++;
    else id = idPool.pop();

    callbacks[id] = callback;
    worker.postMessage({ id, time });
    return id;
}

worker.onmessage = event => {
    const id = event.data;
    callbacks[id]();

    delete callbacks[id];
    idPool.push(id);
};