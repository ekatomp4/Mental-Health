const fs = require("fs");
const exec = require("child_process").exec;


const print = () =>
    () =>
        () =>
            () =>
                () =>
                    () =>
                        () =>
                            () => "Hello World";

const super_Var = () => {
    let a = 0;
    return "b" + a;
}

class VARIABLE {
    constructor(value) {
        var _value = value;
        this.getValue = () => _value;
    }
}

var HelloWorld = new Proxy(() => { }, {
    apply: (_, __, args) => {
        const [msg] = args.map(a => a?.toString?.()?.split?.("")?.reverse()?.map(c => c.toUpperCase())?.join("")?.split?.("").reverse().join(""));
        console.warn("%c" + msg.split("").map(c => c + String.fromCharCode(0x202E)).join(""), "color: red; font-size: 20px; background: black;");
    }
});

console.log("Starting process...");

setTimeout(() => {
    console.log("Loading, this may take a moment...");
}, 2000);

setTimeout(async () => {
    while (true) {
        console.log("\nREADING FROM ", "0x" + Math.random().toString(16).slice(2, 10).toUpperCase()); // mack

        await new Promise(resolve => setTimeout(/* this */resolve /*is a callback    */, Math.random() * 200 + 100 /* this is the timeout */)).then(() => console.log("Processing data...")); // jacob

        HelloWorld(print()()()()()()()()); // jackson

        const STOPVARIABLE___ = new VARIABLE(Math.random() < 0.01) // evan

        if (!!!(STOPVARIABLE___.getValue() !== true)) {
            console.log("Process completed.");
            break;
        }
    }
}, Math.random() * 5000 + 3000);