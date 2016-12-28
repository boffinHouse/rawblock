/**
 *
 const Book = new rb.Model({id: 1}, {name: 'book'});
 const User = new rb.Model({id: 1}, {name: 'user', isItem: false});

 console.log(Book);
 console.log(User);

 Book.publish('change', {foo: 1, bar: Book.options.name});
 Book.publish('foo', {foo: 2, bar: Book.options.name});

 Book.subscribe('change', rb.log);
 Book.subscribe('foo', rb.log);
 Book.subscribe('', rb.log);


 Book.publish('change', {foo: 1, bar: Book.options.name});
 Book.publish('foo', {foo: 2, bar: Book.options.name});

 // rb.events.add(window, 'books', rb.logError, {topic: 1});
 //
 // User.subscribe('change', rb.log);
 //
 // rb.events.add(window, 'user', rb.logError, {topic: ''});
 */

import './rb_pubsub';

const rb = window.rb;
const pubSubs = {};

class Model {
    constructor(data, options){

        this._data = data;

        options = Object.assign({name: rb.getID(), topicSeparator: ':/', isItem: true}, options);

        this.options = options;

        this.generateId();

        this.createPubSub();
    }

    createPubSub(){
        const {name, eventName, topicSeparator, isItem} = this.options;

        this.eventName = eventName || name + (isItem ? 's' : '');

        const pubSubOptions = {eventName: this.eventName, topicSeparator: topicSeparator, throttle: true};

        this.pubSubName = pubSubOptions.eventName + topicSeparator;

        this.topicPrefx = (isItem) ? this.id : '';

        if(!pubSubs[this.pubSubName]){
            pubSubs[this.pubSubName] = rb.createPubSub(this, pubSubOptions);
        }
    }

    _extendTopic(topic){
        let extendedTopic = this.topicPrefx;

        if(topic){
            extendedTopic += this.options.topicSeparator + topic;
        }

        return extendedTopic;
    }

    subscribe(topic, fn, getStored){
        pubSubs[this.pubSubName].subscribe(this._extendTopic(topic), fn, getStored);
    }

    unsubscribe(topic, fn){
        pubSubs[this.pubSubName].unsubscribe(this._extendTopic(topic), fn);
    }

    publish(topic, data, memoize){
        pubSubs[this.pubSubName].publish(this._extendTopic(topic), data, memoize);
    }

    generateId(){
        this.id = this._data && this._data.id || rb.getID();
    }

    set(name, _value){
        if(arguments.length == 2){
            //todo
        } else {
            this._data = name;
        }
    }

    remove(_name){
        //todo
    }
}

rb.Model = Model;

export default Model;
