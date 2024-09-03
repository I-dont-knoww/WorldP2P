export function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

export function resolveTo(promise, value) {
    return new Promise(resolve => promise.then(() => resolve(value)));
}

export function awaitEvent(eventName, output=undefined) {
    return new Promise(resolve => {
        const eventHandler = event => {
            target.off(eventName, eventHandler);
            resolve(output ?? event);
        }

        target.on(eventName, eventHandler);
    })
}

export function awaitDOMEvent(eventName, target=window, output=undefined) {
    return new Promise(resolve => {
        const eventHandler = event => {
            target.removeEventListener(eventName, eventHandler);
            resolve(output ?? event);
        }
    
        target.addEventListener(eventName, eventHandler);
    });
}