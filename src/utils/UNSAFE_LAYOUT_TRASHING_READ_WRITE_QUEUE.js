const resolvedPromise = Promise.resolve();

let readRunning = false;
let writeRunning = false;
const readQueue = [];
let writeQueue = [];

const resolveRead = () => {

    while (readQueue.length) {
        readQueue.shift()();
    }

    readRunning = false;
};

const resolveWrite = () => {
    resolvedPromise.then(() => {
        const proccessWrites = writeQueue;

        writeQueue = [];
        writeRunning = false;

        while (proccessWrites.length) {
            proccessWrites.shift()();
        }
    });
};

export function thrashingRead(fn){

    readQueue.push(fn);

    if(!readRunning){
        readRunning = true;
        resolvedPromise.then(resolveRead);
    }
}

export function improperWrite(fn) {

    writeQueue.push(fn);

    if(!writeRunning){
        writeRunning = true;
        thrashingRead(resolveWrite);
    }
}


/*
import {Component} from '../core';
import {thrashingRead, improperWrite} from '../utils/UNSAFE_LAYOUT_TRASHING_READ_WRITE_QUEUE';

// const $ = Component.$;


<div
    class="js-rb-live"
    data-module="rafbox"
    style="width: 500px; height: 400px; background-color: #000;"
    >

</div>

class RafBox extends Component {

    static get defaults() {
        return {};
    }

    constructor(element, initialDefaults) {
        super(element, initialDefaults);

        this.test();

    }

    test(){
        thrashingRead(() => {
            console.log('read 1');
        });


        improperWrite(() => {
            console.log('write 1');


            improperWrite(() => {
                console.log('write 2');
            });
            thrashingRead(() => {
                console.log('read 2');
            });


            thrashingRead(() => {
                console.log('read 2');
            });

            improperWrite(() => {
                console.log('write 2');
            });

            thrashingRead(() => {
                console.log('read 2');
            });
        });


        thrashingRead(() => {
            console.log('read 1');
        });

        improperWrite(() => {
            console.log('write 1');
        });

        thrashingRead(() => {
            console.log('read 1');
        });

    }
}

Component.register('rafbox', RafBox);

export default RafBox;

 */
