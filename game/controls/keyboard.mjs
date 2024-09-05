export default class Keyboard {
    static keyCodeOf = {
        Escape: 0x0001,
        Digit1: 0x0002,
        Digit2: 0x0003,
        Digit3: 0x0004,
        Digit4: 0x0005,
        Digit5: 0x0006,
        Digit6: 0x0007,
        Digit7: 0x0008,
        Digit8: 0x0009,
        Digit9: 0x000A,
        Digit0: 0x000B,
        Minus: 0x000C,
        Equal: 0x000D,
        Backspace: 0x000E,
        Tab: 0x000F,
        KeyQ: 0x0010,
        KeyW: 0x0011,
        KeyE: 0x0012,
        KeyR: 0x0013,
        KeyT: 0x0014,
        KeyY: 0x0015,
        KeyU: 0x0016,
        KeyI: 0x0017,
        KeyO: 0x0018,
        KeyP: 0x0019,
        BracketLeft: 0x001A,
        BracketRight: 0x001B,
        Enter: 0x001C,
        ControlLeft: 0x001D,
        KeyA: 0x001E,
        KeyS: 0x001F,
        KeyD: 0x0020,
        KeyF: 0x0021,
        KeyG: 0x0022,
        KeyH: 0x0023,
        KeyJ: 0x0024,
        KeyK: 0x0025,
        KeyL: 0x0026,
        Semicolon: 0x0027,
        Quote: 0x0028,
        Backquote: 0x0029,
        ShiftLeft: 0x002A,
        Backslash: 0x002B,
        KeyZ: 0x002C,
        KeyX: 0x002D,
        KeyC: 0x002E,
        KeyV: 0x002F,
        KeyB: 0x0030,
        KeyN: 0x0031,
        KeyM: 0x0032,
        Comma: 0x0033,
        Period: 0x0034,
        Slash: 0x0035,
        ShiftRight: 0x0036,
        NumpadMultiply: 0x0037,
        AltLeft: 0x0038,
        Space: 0x0039,
        CapsLock: 0x003A,
        F1: 0x003B,
        F2: 0x003C,
        F3: 0x003D,
        F4: 0x003E,
        F5: 0x003F,
        F6: 0x0040,
        F7: 0x0041,
        F8: 0x0042,
        F9: 0x0043,
        F10: 0x0044,
        Pause: 0x0045,
        ScrollLock: 0x0046,
        Numpad7: 0x0047,
        Numpad8: 0x0048,
        Numpad9: 0x0049,
        NumpadSubtract: 0x004A,
        Numpad4: 0x004B,
        Numpad5: 0x004C,
        Numpad6: 0x004D,
        NumpadAdd: 0x004E,
        Numpad1: 0x004F,
        Numpad2: 0x0050,
        Numpad3: 0x0051,
        Numpad0: 0x0052,
        NumpadDecimal: 0x0053
    };

    static keyValueOf = {
        0x0001: "Escape",
        0x0002: "Digit1",
        0x0003: "Digit2",
        0x0004: "Digit3",
        0x0005: "Digit4",
        0x0006: "Digit5",
        0x0007: "Digit6",
        0x0008: "Digit7",
        0x0009: "Digit8",
        0x000A: "Digit9",
        0x000B: "Digit0",
        0x000C: "Minus",
        0x000D: "Equal",
        0x000E: "Backspace",
        0x000F: "Tab",
        0x0010: "KeyQ",
        0x0011: "KeyW",
        0x0012: "KeyE",
        0x0013: "KeyR",
        0x0014: "KeyT",
        0x0015: "KeyY",
        0x0016: "KeyU",
        0x0017: "KeyI",
        0x0018: "KeyO",
        0x0019: "KeyP",
        0x001A: "BracketLeft",
        0x001B: "BracketRight",
        0x001C: "Enter",
        0x001D: "ControlLeft",
        0x001E: "KeyA",
        0x001F: "KeyS",
        0x0020: "KeyD",
        0x0021: "KeyF",
        0x0022: "KeyG",
        0x0023: "KeyH",
        0x0024: "KeyJ",
        0x0025: "KeyK",
        0x0026: "KeyL",
        0x0027: "Semicolon",
        0x0028: "Quote",
        0x0029: "Backquote",
        0x002A: "ShiftLeft",
        0x002B: "Backslash",
        0x002C: "KeyZ",
        0x002D: "KeyX",
        0x002E: "KeyC",
        0x002F: "KeyV",
        0x0030: "KeyB",
        0x0031: "KeyN",
        0x0032: "KeyM",
        0x0033: "Comma",
        0x0034: "Period",
        0x0035: "Slash",
        0x0036: "ShiftRight",
        0x0037: "NumpadMultiply",
        0x0038: "AltLeft",
        0x0039: "Space",
        0x003A: "CapsLock",
        0x003B: "F1",
        0x003C: "F2",
        0x003D: "F3",
        0x003E: "F4",
        0x003F: "F5",
        0x0040: "F6",
        0x0041: "F7",
        0x0042: "F8",
        0x0043: "F9",
        0x0044: "F10",
        0x0045: "Pause",
        0x0046: "ScrollLock",
        0x0047: "Numpad7",
        0x0048: "Numpad8",
        0x0049: "Numpad9",
        0x004A: "NumpadSubtract",
        0x004B: "Numpad4",
        0x004C: "Numpad5",
        0x004D: "Numpad6",
        0x004E: "NumpadAdd",
        0x004F: "Numpad1",
        0x0050: "Numpad2",
        0x0051: "Numpad3",
        0x0052: "Numpad0",
        0x0053: "NumpadDecimal"
    };

    /**
     * @param {Game} game 
     */
    constructor(game) {
        this.held = new Set();
        this.tapped = new Set();

        this.game = game;
        this.game.on('postupdate', () => this.tapped.clear());
    }

    /**
     * @param {string} code
     */
    keydown(code) {
        this.held.add(code);
        this.tapped.add(code);
    }

    /**
     * @param {string} code
     */
    keyup(code) {
        this.held.delete(code);
    }

    /**
     * @returns {Uint8Array}
     */
    serialize() {
        const pressedSerialize = Array.from(this.held, code => Keyboard.keyCodeOf[code]);
        const tappedSerialize = Array.from(this.tapped, code => Keyboard.keyCodeOf[code]);

        return new Uint8Array([pressedSerialize.length, ...pressedSerialize, tappedSerialize.length, ...tappedSerialize]);
    }

    /**
     * @param {Uint8Array} serialized
     */
    deserialize(serialized) {
        const pressedLength = serialized[0];
        const pressedArray = serialized.slice(1, 1 + pressedLength);

        const tappedLength = serialized[1 + pressedLength];
        const tappedArray = serialized.slice(2 + pressedLength, 2 + pressedLength + tappedLength);

        this.held.clear();
        for (let i = 0; i < pressedLength; i++) this.held.add(Keyboard.keyValueOf[pressedArray[i]]);

        this.tapped.clear();
        for (let i = 0; i < tappedLength; i++) this.tapped.add(Keyboard.keyValueOf[tappedArray[i]]);
    }
}