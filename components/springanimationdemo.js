import rb, { Component } from '../core';
import '../utils/spring-animation';

const $ = Component.$;

/**
 * Class component to create a SpringAnimation Demo
 *
 */
class SpringAnimationDemoGroup extends Component {

    static get defaults() {
        return {
            stiffnessBase: 30,
            stiffnessInc: 20,

            dampingBase: 4,
            dampingInc: 2,

            autostart: true,
            initialExampleCount: 4,
            waitBetweenAnimations: 1000,

        };
    }

    static get events(){
        return {
            'springanimationdemoended': 'onChildDemoEnded',
            'click:closest(.{name}-ctrl-btn)': 'onControlButtonClick'
        };
    }

    constructor(element, initialDefaults) {
        super(element, initialDefaults);

        this.allEnded = true;
        this.childsWereAtEnd = false;

        this.templates = Object.assign({}, this.templates, {
            childTemplate: rb.template(this.query('.{name}-child-template').innerHTML),
        });

        this.rAFs({that: this}, 'createChildComponents', 'removeChildComponent');

        this.getElements();
        this.updateControlStates();
        this.onChildDemoEnded = rb.debounce(this.onChildDemoEnded, { delay: 100 });
        this.createChildComponents(this.options.initialExampleCount);
    }

    setOption(name, value, isSticky) {
        super.setOption(name, value, isSticky);

        switch (name){
            case 'autostart':
                this.updateControlStates();
                if(this.allEnded && value){ this.restartChildComponents(); }
                break;
            default:
                this.log('unknown option was set');
                break;
        }

        // this.log(name, value, isSticky);
    }

    getElements(){
        this.childWrapper = this.query('.{name}-childwrapper');
        this.inputAutostart = this.query('input[data-{name}-button-type="autostart"]');
    }

    updateControlStates(){
        this.inputAutostart.checked = this.options.autostart;
    }

    createChildComponents(count){
        const o = this.options;

        for(let i = 0; i < count; i++){
            this.childWrapper.insertAdjacentHTML('beforeend', this.render('childTemplate', {
                stiffness: o.stiffnessBase + (o.stiffnessInc * i),
                damping: o.dampingBase + (o.dampingInc * i),
            }));
        }

        this.getChildComponents();

        if(o.autostart){
            this.restartChildComponents();
        }
    }

    addChildComponent(){
        const o = this.options;
        const latestChild = this.childCompontents[this.childCompontents.length - 1];
        const stiffness = (latestChild ? latestChild.options.stiffness : o.stiffnessBase) + o.stiffnessInc;
        const damping = (latestChild ? latestChild.options.damping : o.dampingBase) + o.dampingInc;

        this.childWrapper.insertAdjacentHTML('beforeend', this.render('childTemplate', { stiffness, damping }));
        this.getChildComponents();

        // start added springdemo
        this.childCompontents[this.childCompontents.length - 1].createSpring(this.childsWereAtEnd);
    }

    removeChildComponent(childComp){
        const childCompToRemove = childComp || this.childCompontents[this.childCompontents.length - 1];
        childCompToRemove.element.remove();
        this.getChildComponents();
    }

    getChildComponents(){
        return this.childCompontents = this.queryAll('[data-module="springanimationdemo"]').map(element => rb.getComponent(element));
    }

    onChildDemoEnded(){
        this.allEnded = this.childCompontents.reduce((previousValue, childComp) => previousValue && childComp.ended, true);

        if(this.allEnded){
            this.childsWereAtEnd = !this.childsWereAtEnd;

            if(this.options.autostart){
                this.allEnded = false;
                setTimeout(()=>{
                    this.restartChildComponents();
                }, this.options.waitBetweenAnimations);
            }
        }
    }

    onControlButtonClick(event){
        const type = event.target.getAttribute(this.interpolateName('data-{name}-button-type'));

        switch (type) {
            case 'add':
                this.addChildComponent();
                break;
            case 'remove':
                this.removeChildComponent();
                break;
            case 'autostart':
                this.setOption('autostart', !!event.target.checked);
                break;
            case 'toggle':
                this.startStop();
                break;
            default:
                this.logWarn('unknown control button type:', type);
        }
    }

    startStop(){
        if(!this.childCompontents){
            this.getChildComponents();
        }

        if(this.allEnded){
            this.restartChildComponents();
        } else {
            this.allEnded = true;
            this.childCompontents.forEach(childComp => childComp.stopSpring());
        }
    }

    restartChildComponents(){
        if(!this.childCompontents){
            this.getChildComponents();
        }
        this.childCompontents.forEach(childComp => childComp.createSpring(this.childsWereAtEnd));
        this.allEnded = false;
    }
}


class SpringAnimationDemo extends rb.Component {
    static get defaults() {
        return {
            stiffness: 50,
            damping: 50
        };
    }

    static get events(){
        return {
            'rb_layoutchange': 'readLayout',
            'input:matches([data-{name}-controls)]': 'onControlInput'
        };
    }

    constructor(element, initialDefaults) {
        super(element, initialDefaults);

        this.maxPos = null;
        this.springAnimation = null;
        this.latestValue = 0;
        this.wasAtEnd = false;
        this._hasEnded = true;

        // elements
        this.animateElement = this.query('.{name}-element');
        this.inputsForOptions = this.queryAll('[data-{name}-controls]').reduce((inputsForOptions, el)=>{
            const optionName = el.getAttribute(this.interpolateName('data-{name}-controls'));
            inputsForOptions[optionName] = inputsForOptions[optionName] || [];
            inputsForOptions[optionName].push(el);
            return inputsForOptions;
        }, {});

        this.readLayout();
    }

    setOption(name, value, isSticky) {
        super.setOption(name, value, isSticky);
        if(this.springAnimation && name in this.springAnimation){
            this.springAnimation[name] = value;
        }
    }

    onControlInput(event){
        const optionUpdated = event.target.getAttribute(this.interpolateName('data-{name}-controls'));

        if(!optionUpdated || !(optionUpdated in this.options)){
            return;
        }
        const newValue = parseFloat(event.target.value) || 0;
        const inputsForOption = this.inputsForOptions[optionUpdated] || [];

        inputsForOption.forEach((input)=>{
            // if(input !== event.target){
                input.value = newValue;
            // }
        });

        this.setOption(optionUpdated, newValue);
    }

    readLayout(){
        const newMaxPos = this.element.clientWidth - this.animateElement.clientWidth;

        if(newMaxPos === this.maxPos){
            return;
        }

        this.maxPos = newMaxPos;

        if(this.springAnimation){
            this.springAnimation.target = (this.wasAtEnd && this.springAnimation.currentValue === this.maxPos) ? 0 : this.maxPos;
        }
    }

    get ended(){
        return this._hasEnded;
    }

    createSpring(wasAtEnd, opts){
        if(!this._hasEnded){
            return;
        }

        this.wasAtEnd = !!wasAtEnd;

        const springOpts = Object.assign({
            from: this.latestValue || (!this.wasAtEnd ? 0 : this.maxPos),
            target: this.wasAtEnd ? 0 : this.maxPos,
            stiffness: this.options.stiffness,
            damping: this.options.damping,
            start: ()=>{
                // add callback for start
            },
            stop: ()=>{
                this._hasEnded = true;
            },
            progress: (data)=>{
                // this.log(this.animateElement, data);
                this.setElPos(data);
            },
            complete: ()=>{
                this._hasEnded = true;
                this.trigger('ended');
                this.updateStateClass();
            },
        }, opts);

        this.springAnimation = new rb.SpringAnimation(springOpts);
        this._hasEnded = false;
        this.updateStateClass();
    }

    stopSpring(){
        if(this.springAnimation){
            this.springAnimation.stop();
        }
    }

    updateStateClass(){
        $(this.animateElement).rbToggleState('spring{-}animated', !this._hasEnded);
    }

    setElPos(data){
        // instead... draw canvas!
        this.animateElement.style.transform = `translateX(${data.currentValue}px)`;
        this.latestValue = data.currentValue;
    }

    detached(){
        if(this.springAnimation){
            this.springAnimation.stop();
            this.springAnimation = null;
        }
        this.trigger('removed');
    }

    // shift key -> make slow
    // alt key -> show ghosts (would be better with canvas)
}

Component.register('springanimationdemogroup', SpringAnimationDemoGroup);

export {SpringAnimationDemoGroup, SpringAnimationDemo};
export default Component.register('springanimationdemo', SpringAnimationDemo);
