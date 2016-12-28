import mobx from 'mobx';

const data = mobx.observable({foo: 'initial'});

setTimeout(()=>{
    data.foo = 'changed';
}, 100);

setTimeout(()=>{
    data.foo1 = 'secondChanged';
}, 300);


// // this will print Matt NN 10 times
// _.times(10, function () {
//     person.age = _.random(40);
// });
//
// // this will print nothing
// _.times(10, function () {
//     person.lastName = _.random(40);
// });

export default data;
