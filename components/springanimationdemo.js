import '../utils/springAnimation';

const rb = window.rb;
const $ = rb.$;

/**
 * Class component to create a SpringAnimation Demo
 *
 */
class SpringAnimationDemoGroup extends rb.Component {

    static get defaults() {
        return {
            stiffnessBase: 3,
            stiffnessInc: 15,

            dampingBase: 5,
            dampingInc: 5,

            initialExampleCount: 4,
            waitBetweenAnimations: 1000
        };
    }

    static get events(){
        return {
            'springanimationdemoended': 'onChildDemoEnded'
        };
    }

    constructor(element, initialDefaults) {
        super(element, initialDefaults);

        this.log(this);

        this.childWrapper = this.query('.{name}-childwrapper');
        this.templates = Object.assign({}, this.templates, {
            childTemplate: rb.template(this.query('.{name}-child-template').innerHTML)
        });

        this.onChildDemoEnded = rb.debounce(this.onChildDemoEnded, { delay: 100 });
        this.createChildComponents(this.options.initialExampleCount);
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
    }

    getChildComponents(){
        this.childCompontents = this.queryAll('[data-module="springanimationdemo"]').map(element => rb.getComponent(element));
    }

    onChildDemoEnded(){
        const allEnded = this.childCompontents.reduce((previousValue, childComp) => previousValue && childComp.ended, true);
        if(allEnded){
            setTimeout(()=>{
                this.startChildComponents();
            }, this.options.waitBetweenAnimations);
        }
    }

    startChildComponents(){
        this.childCompontents.forEach(childComp => childComp.createSpring());
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
        this.isAtEnd = false;
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
        this.createSpring();
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
        const inputsForOption = this.inputsForOptions[optionUpdated] || [];

        inputsForOption.forEach((input)=>{
            if(input !== event.target){
                input.value = event.target.value;
            }
        });

        this.setOption(optionUpdated, event.target.value);
    }

    readLayout(){
        const newMaxPos = this.element.clientWidth - this.animateElement.clientWidth;

        if(newMaxPos === this.maxPos){
            return;
        }

        this.maxPos = newMaxPos;

        if(this.springAnimation){
            this.springAnimation.target = this.isAtEnd && this.springAnimation.currentValue === this.maxPos ? 0 : this.maxPos;
        }
    }

    get ended(){
        return this._hasEnded;
    }

    createSpring(opts){
        if(!this._hasEnded){
            return;
        }

        const springOpts = Object.assign({
            from: this.latestValue,
            target: this.isAtEnd ? 0 : this.maxPos,
            stiffness: this.options.stiffness,
            damping: this.options.damping,
            start: ()=>{
                // add callback for start
            },
            progress: (data)=>{
                // this.log(this.animateElement, data);
                this.setElPos(data);
            },
            complete: ()=>{
                this.isAtEnd = !this.isAtEnd;
                this._hasEnded = true;
                this.trigger('ended');
                this.updateStateClass();
            }
        }, opts);

        this.springAnimation = new rb.SpringAnimation(springOpts);
        this._hasEnded = false;
        this.updateStateClass();

        this.log(this.springAnimation);
    }

    updateStateClass(){
        $(this.animateElement).rbToggleState('spring{-}animated', !this._hasEnded);
    }

    setElPos(data){
        // console.log(this.);
        // instead... draw canvas!
        this.animateElement.style.transform = `translateX(${data.currentValue}px)`;
        this.latestValue = data.currentValue;
    }

    detached(){
        // TODO: implement this
        this.log('removed', this);
        this.trigger('removed');
    }

    // shift key -> make slow
    // alt key -> show ghosts (would be better with canvas)
}



rb.live.register('springanimationdemogroup', SpringAnimationDemoGroup);

export {SpringAnimationDemoGroup, SpringAnimationDemo};
export default rb.live.register('springanimationdemo', SpringAnimationDemo);
