# How to create a rawblock component I

As an example component we will create a "slim header". As soon as the user scrolls down a certain threshold the header gets slim. A full demo can be seen at [codepen (SlimHeader with rawblock)](http://codepen.io/aFarkas/pen/GNNMxR).

## HTML of our slim header component

A component markup always has to have a `data-module` attribute with the name of your component and in general a `js-rb-live` class to indicate, that rawblock should create the UI component immediately.

### Excusrion: Initializing components

In general rawblock components have the class `js-rb-live` to be automatically created, if they are first seen in the document. In case a component only reacts to a `click` event and only needs to be created at this time, the author can add a `js-rb-click` class instead.

There is also the possibility to use the rb_lazymodules module to lazily create modules as soon as they become visible in the viewport using the `js-rb-lazylive` class. 

Or a class can be fully omitted and the component can initialized from JS using the [`rb.getComponent`](rb.html#.getComponent__anchor) or `this.component` method.

The functional childs should have a class prefixed with the component name (htmlName).
 
```html
<div class="js-rb-live" data-module="slimheader"></div>
```

## JS-Boilerplate of a rawblock component

```js
class SlimHeader extends rb.Component {
    
    // The static defaults getter defines the default options of our component.
    static get defaults(){
        return {
            
        };
    }
    
    // The static events getter defines the events rawblock should attach to the DOM. 
    static get events(){
        return {
            
        };
    }
    
    // The constructor is invoked to create the rb component
    constructor(element, initialDefaults){
        super(element, initialDefaults);
        
    }
    
    // attached is invoked either after the constructor or if the DOM element is added to the DOM
    // Normally the attached method should be used as an antagonist to the detached method.
    attached(){
        
    }
    
    //detached is invoked after the element was removed from the document and should be used to clean up (i.e.: clear timeouts, unbind global events etc.)
    detached(){
        
    }
}

//rb.live.register registers the Component class and defines the component name. The class is then added to the `rb.components` namespace (i.e. `rb.components.clearinput`).
rb.live.register('slimheader', SlimHeader);

//call rb.live.init in your main file to start rawblock.
//rb.live.init();
```

## SlimHeader JS Class

### Working with options
First we define the threshold as `topThreshold` in our `defaults` getter.

```js
class SlimHeader extends rb.Component {
    
    static get defaults(){
        return {
            topThreshold: 60
        };
    }
    
    constructor(element, initialDefaults){
        super(element, initialDefaults);
        
        this.log(this.options.topThreshold); //outputs 60
    }
}

rb.live.register('slimheader', SlimHeader);
```

A rawblock component can be configured in multiple ways.

With JS:

```js
//change the default itself (Note: rawblock changes the defaults getter to a defaults object value.)
rb.components.slimheader.defaults.topThreshold = 70;

//create a new component with changed options and use this instead (Note: rawblock will automatically merge/mixin your defaults object)
class SuperSlimHeader extends rb.components.slimheader {
    static get defaults(){
        return {
            topThreshold: 80
        };
    }
}

//change the specific component option
rb.$('.slimheader').rbComponent().setOption('topThreshold', 90);
```

With HTML:

```html
<!-- As one option -->
<div data-module="slimheader" data-slimheader-top-threshold="100"></div> 

<!-- As an option object (with multiple options) -->
<div data-module="slimheader" data-slimheader-options='{"topThreshold": 110}'></div> 
```

With CSS/SCSS

```scss
.slimheader {
    @include rb-js-export((
        topThreshold: 120,
    ));
}
```

Due to the fact that the threshold is heavily style/layout related it might make sense to configure it with SCSS. It can get really helpful if you plan to act on it responsively.


```scss
.slimheader {
    @include rb-js-export((
        topThreshold: 120,
    ));
    
    @media (min-width: 120px) {
        @include rb-js-export((
            topThreshold: 180,
        ));
    }
}
```

By extending/overriding the `setOption` method it is possible to react to option changes:

```js
class SlimHeader extends rb.Component {
    setOption(name, value, isSticky){
        super.setOption(name, value, isSticky);
        
        if(name == 'topThreshold'){
            //do the work
        }
    }
}
```

### Events
 
JS events can be bound normally or by using the events object. In our case we need to bind the `scroll` event to the `window` object.

Due to the fact, that the `window` object remains even if our component is destroyed. It makes sense to use the `attached`/`detached` lifecycle callbacks.


```js
class SuperSlimHeader extends rb.components.slimheader {
    constructor(element, initialDefaults){
        super(element, initialDefaults);
        
        this.handleScroll = this.handleScroll.bind(this);
    }
    
    handleScroll(){
        
    }
    
    attached(){
        window.addEventListener('scroll', this.handleScroll);
    }
    
    detached(){
        window.removeEventListener('scroll', this.handleScroll);
    }
}
```

But you can also use the static `events` object of your component class. Normally rawblock binds all events to the component itself and gives you some options to help with event delegation. 

But due to the fact that the `scroll` event happens outside of the component event delegation does not help here. For this you can use the `@` event option. Every event option is prefixed with a `:`.


```js
class SlimHeader extends rb.Component {
    
    static get events(){
        return {
            'scroll:@(window)': 'handleScroll',
        };
    }
    
    constructor(element, initialDefaults){
        super(element, initialDefaults);
    }
    
    handleScroll(){
        
    }
}
```
#### About event options:

There are 4 different kinds of event options:
* The `@` allows to bind listeners to other elements than the component element. These elements are retrieved by the `this.getElementsByString` method, which not only allows to use predefined values like `"window"` or `"document"`, but also to use jQuery-like traversing methods to select an element (i.e.: `"submit:@(closest(form))"`, `"click:@(next(.item))"` etc.).
* Native event options: `capture`, `once` and `passive`.
* proxy functions: `closest`, `matches`, `keycodes` and some more.
    * `closest` can be used for event delegation. For example `'click:closest(.button)'` means, if a click happens the proxy function will use the `closest` method on the `event.target` and if it finds an element will set the `event.delegatedTarget` property to this element and call the declared event handler.
    * `matches` can also be used for event delegation. For example `'change:matches(.input)'` means, if a change happens the proxy function will use the `matches` method on the `event.target` and if it returns `true` will set the `event.delegatedTarget` property to this element and call the declared event handler.
* Different options for custom events.

### Adding some logic

Now we can fill in some logic to add a class as soon as the header reaches our threshold.

```js
class SlimHeader extends rb.Component {
    
    static get defaults(){
        return {
            topThreshold: 80
        };
    }
    
    static get events(){
        return {
            'scroll:@(window)': 'handleScroll',
        };
    }
    
    constructor(element, initialDefaults){
        super(element, initialDefaults);
        
        //call handleScroll to get the initial state right
        this.handleScroll();
    }
    
    handleScroll(){
        this.element.classList.toggle('is-slim', this.options.topThreshold < document.scrollingElement.scrollTop);
    }
}

rb.live.register('slimheader', SlimHeader);
```

### Improvements to our current component
The code above will give us a full functional rawblock component. But it can be improved in multiple ways.

Performance considerations

1. `classList.toggle` is called with a very high frequency, even if the threshold expression has the same result as before.
2. `classList.toggle` mutates the DOM (= layout write) outside of a `requestAnimationFrame`, which is likely to produce layout thrashing in a complex application.
3. `handleScroll` could also be throttled.


To fix the first point we will add a `isSlim` property and only change the class if it has changed

```js
class SlimHeader extends rb.Component {
    //.....
    
    constructor(element, initialDefaults){
        super(element, initialDefaults);
        
        this.isSlim = false;
        
        this.handleScroll();
    }
    
    handleScroll(){
        const shouldBeSlim = this.options.topThreshold < document.scrollingElement.scrollTop;
        
        if(this.isSlim != shouldBeSlim){
            this.isSlim = shouldBeSlim;
            this.element.classList.toggle('is-slim', this.isSlim);
        }
    }
}
```

To fix the second point rawblock offers a method called `this.rAFs`. This method can take an unlimited number of method names and will make sure that these methods are called inside a `rAF`.

Due to the fact, that getting `document.scrollingElement.scrollTop` is a layout read we need to separate it from our layout write `classList.toggle`.

```js
class SlimHeader extends rb.Component {
    //.....
    
    constructor(element, initialDefaults){
        super(element, initialDefaults);
        
        this.isSlim = false;
        
        this.rAFs('changeState');
        
        this.calculateState();
    }
    
    changeState(){
        this.element.classList.toggle('is-slim', this.isSlim);
    }
    
    calculateState(){
        const shouldBeSlim = this.options.topThreshold < document.scrollingElement.scrollTop;
        
        if(this.isSlim != shouldBeSlim){
            this.isSlim = shouldBeSlim;
            this.changeState();
        }
    }
}
```

For small DOM changes rawblock also supports jQuery-like functions, that are called in a rAF. To these methods the string "Raf" is appended. In our case the method `toggleClassRaf` can be used:

```js
class SlimHeader extends rb.Component {
    //... 
    calculateState(){
            const shouldBeSlim = this.options.topThreshold < document.scrollingElement.scrollTop;
            
            if(this.isSlim != shouldBeSlim){
                this.isSlim = shouldBeSlim;
                this.$element.toggleClassRaf('is-slim', this.isSlim);
            }
        }
    }
}
```

Point 3. could be fixed by using `rb.throttle`. But I assume that in our refactored case the `calculateState` is so light, that throttling won't affect the performance too much.

```js
class SlimHeader extends rb.Component {
    //.....
    
    constructor(element, initialDefaults){
        super(element, initialDefaults);
        
        this.isSlim = false;
        
        this.calculateState = rb.throttle(this.calculateState);
        
        this.calculateState();
    }
}
```

The slimheader component can be further improved under the following more rawblock specific aspects: 

1.  A good component should dispatch an event as soon as it's state changes.

    This can be realized using the `trigger` method. The method accepts an event name as also a detail object for further event specific information. The event name is automatically prefixed by the component name (jsName). If a component only has one state that changes or one state can be seen as the main state the component should dispatch a `changed` state. 
    
    In case no event name is given, `trigger` will automatically generate this `changed` state event prefixed by the component name. (In our case `"slimheaderchanged"`.)
    
    In case you are using a `*Raf` method to alter your DOM, your `trigger` call is not done in a rAF method and you want to dispatch the event after the DOM changes are done you can use the method `this.triggerRaf`.

2.  rawblock allows you to define how state classes are defined (prefixed by `is-`, `modifier__` etc.). 
    To support this feature we need to use `rb.$.fn.rbToggleState` instead of `classList.toggle`.
    
3.  Building responsive JS components often reveals, that you need to disable/switch off a component under certain media conditions and turn others on.
    
    rawblock uses the convention to use the option `switchedOff` for those cases. In case `options.switchedOff` is `true` no event listener bound by the events object is called (Keep in mind, that this won't help, if your bound listeners are called async du to throttling or debouncing.). 
    
    Often the developer still has to do some work to react to those option changes (cleanup changed markup). In case your specific project needs this or you want to build a general re-usable component you should do this.
     
Our final improved code could look like this:


```js
class SlimHeader extends rb.Component {
    
    static get defaults(){
        return {
            topThreshold: 80,
        };
    }
    
    static get events(){
        return {
            'scroll:@(window)': 'calculateState',
        };
    }
    
    constructor(element, initialDefaults){
        super(element, initialDefaults);
        
        this.isSlim = false;
        
        this.calculateState = rb.throttle(this.calculateState);
        
        this.calculateState();
    }
    
    setOption(name, value, isSticky){
        super.setOption(name, value, isSticky);
        
        //if topThreshold or switchedOff option changed re-calculate with these options.
        if(name == 'topThreshold' || name == 'switchedOff'){
            this.calculateState();
        }
    }
    
    calculateState(){
        const {switchedOff, topThreshold} = this.options;
        //if it is switchedOff it is never slim 
        const shouldBeSlim = !switchedOff && topThreshold < document.scrollingElement.scrollTop;
        
        if(this.isSlim != shouldBeSlim){
            this.isSlim = shouldBeSlim;
            this.$element.rbToggleStateRaf('slim', this.isSlim);
            this.triggerRaf();
        }
    }
}

rb.live.register('slimheader', SlimHeader);
```
