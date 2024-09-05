export default class EventEmitter {
    #listeners;
    #maxListeners;

    constructor() {
        this.#listeners = [];

        this.#maxListeners = 10;
    }

    /**
     * @param {number} max
     */
    setMaxListeners(max) {
        this.#maxListeners = max;
    }

    /**
     * @param {string} event
     * @param  {...any} [args]
     */
    emit(event, ...args) {
        for (let i = 0; i < this.#listeners.length; i++) if (this.#listeners[i].event == event) {
            this.#listeners[i].callback(...args);
        }
    }

    /**
     * @param {string} event
     * @param {Function} callback
     */
    on(event, callback) {
        this.#listeners.push(new Listener(event, callback));

        if (this.#listeners.length > this.#maxListeners) {
            console.warn(`max listeners exceeded: listener count: ${this.#listeners.length}, max listeners: ${this.#maxListeners}`);
            console.trace('max listeners exceeded');
        }
    }

    /**
     * @param {string} event
     * @param {Function} callback
     */
    once(event, callback) {
        this.#listeners.push(new Listener(event, (...args) => {
            callback(...args);
            this.off(event, callback);
        }));
    }

    /**
     * @param {string} event
     * @param {Function} callback
     */
    off(event, callback) {
        for (let i = 0; i < this.#listeners.length; i++) if (this.#listeners[i].event == event && this.#listeners[i].callback == callback) {
            const temp = this.#listeners[i];
            this.#listeners[i] = this.#listeners.at(-1);
            this.#listeners[this.#listeners.length - 1] = temp;
            this.#listeners.pop();
            return;
        }
    }
}

class Listener {
    /**
     * @param {string} event
     * @param {Function} callback
     */
    constructor(event, callback) {
        this.event = event;
        this.callback = callback;
    }
}