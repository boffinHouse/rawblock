import deferred from './deferred';


class ReadWriteQueue {

    /* eslint-disable no-undef */
    static defaultPhase = 'read';
    static phase = 'read';

    constructor(type){
        this.runs = 0;
        this.myType = type;
        this.oppositeType = type == 'read' ? 'write' : 'read';

        this.getPhase = this.getPhase.bind(this);
    }

    addOppositeQueue(oppositeQueue){
        this.oppositeQueue = oppositeQueue;
    }

    getPhase(){
        if(!this.queuePromise){
            this.queuePromise = deferred();

            if(ReadWriteQueue.phase == this.myType){
                this.queuePromise.resolve();
            } else {
                this.oppositeQueue.getEndPhase().then(() => {
                    ReadWriteQueue.phase = this.myType;
                    this.queuePromise.resolve();
                });
            }

            this.queuePromise.then(() => {
                this.queuePromise = null;
                ReadWriteQueue.phase = this.oppositeType;
            });

            if(this.myType == 'write'){
                this.getEndPhase();
            }
        }

        this.runs++;

        this.queuePromise.then(() => {
            this.runs--;

            if (this.runs === 0) {
                if (this._endQueuePromise) {
                    ReadWriteQueue.phase = this.oppositeType;
                    this._endQueuePromise.resolve();
                }
            }

            // console.log(label, this.runs, ReadWriteQueue.phase, this);
        });

        return this.queuePromise;
    }

    getEndPhase(){
        if(!this._endQueuePromise){
            this._endQueuePromise = deferred();
        }

        return this._endQueuePromise;
    }
}

const readQueue = new ReadWriteQueue('read');
const writeQueue = new ReadWriteQueue('write');

readQueue.addOppositeQueue(writeQueue);
writeQueue.addOppositeQueue(readQueue);

export const thrashingMeasurePhase = readQueue.getPhase;
export const improperMutationPhase = writeQueue.getPhase;


/*
import {Component} from '../core';
import {thrashingMeasurePhase, improperMutationPhase} from '../utils/UNSAFE_LAYOUT_TRASHING_READ_WRITE_QUEUE';

// const $ = Component.$;

class RafBox extends Component {

    static get defaults() {
        return {};
    }

    constructor(element, initialDefaults) {
        super(element, initialDefaults);

        this.test();

    }

    test(){
        thrashingMeasurePhase().then(() => {
            console.log('read 1');
        });

        improperMutationPhase().then(() => {
            console.log('write 1');


            improperMutationPhase('firstWrite').then(() => {
                console.log('write 2');
            });

            thrashingMeasurePhase('firstRead').then(() => {
                console.log('read 2');
            });

            thrashingMeasurePhase().then(() => {
                console.log('read 2');
            });

            improperMutationPhase().then(() => {
                console.log('write 2');

                thrashingMeasurePhase().then(() => {
                    console.log('read 3');
                });

                improperMutationPhase('firstWrite').then(() => {
                    console.log('write 3');
                });

                thrashingMeasurePhase().then(() => {
                    console.log('read 3');
                });
            });

            thrashingMeasurePhase().then(() => {
                console.log('read 2');
            });

            thrashingMeasurePhase().then(() => {
                console.log('read 2');
            });
        });


        thrashingMeasurePhase().then(() => {
            console.log('read 1');
        });

        improperMutationPhase().then(() => {
            console.log('write 1');
        });

        thrashingMeasurePhase().then(() => {
            console.log('read 1');
        });

    }
}

Component.register('rafbox', RafBox);

export default RafBox;

 */
