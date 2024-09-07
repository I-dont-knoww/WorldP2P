onmessage = event => {
    const { id, time } = event.data;

    setTimeout(() => postMessage(id), time);
};