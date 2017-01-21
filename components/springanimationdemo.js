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

        this.onChildDemoEnded = rb.debounce(this.onChildDemoEnded, { delay: 100 });
        this.getChildComponents();
    }

    getChildComponents(){
        this.childCompontents = this.queryAll('[data-module="springanimationdemo"]').map(element => rb.getComponent(element));
    }

    onChildDemoEnded(){
        const allEnded = this.childCompontents.reduce((previousValue, childComp) => previousValue && childComp.hasEnded, true);
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
            'input:matches([data-{name}-controls)]': 'onRangeInput'
        };
    }

    constructor(element, initialDefaults) {
        super(element, initialDefaults);

        this.animateElement = this.query('.{name}-element');
        this.latestValue = 0;
        this.isAtEnd = false;
        this.hasEnded = true;

        this.readLayout();
        this.createSpring();
    }

    setOption(name, value, isSticky) {
        super.setOption(name, value, isSticky);
        this.log(arguments);
    }

    onRangeInput(event){
        const optionUpdated = event.target.getAttribute(this.interpolateName('data-{name}-controls'));
        if(!optionUpdated || !(optionUpdated in this.options)){
            return;
        }
        this.setOption(optionUpdated, event.target.value);
    }

    readLayout(){
        this.maxPos = this.element.clientWidth - this.animateElement.clientWidth;
    }

    get ended(){
        return this.hasEnded;
    }

    createSpring(opts){
        if(!this.hasEnded){
            return;
        }

        const springOpts = Object.assign({
            from: this.latestValue,
            target: this.isAtEnd ? 0 : this.maxPos,
            stiffness: this.options.stiffness,
            damping: this.options.damping,
            progress: (data)=>{
                // this.log(this.animateElement, data);
                this.setElPos(data);
            },
            complete: ()=>{
                this.isAtEnd = !this.isAtEnd;
                this.hasEnded = true;
                this.trigger('ended');
                this.updateStateClass();
            }
        }, opts);

        this.springAnimation = new rb.SpringAnimation(springOpts);
        this.hasEnded = false;
        this.updateStateClass();
    }

    updateStateClass(){
        $(this.animateElement).rbToggleState('spring{-}animated', !this.hasEnded);
    }

    setElPos(data){
        // console.log(this.);
        this.animateElement.style.transform = `translateX(${data.currentValue}px)`;
        this.latestValue = data.currentValue;
    }

    // shift -> make slow
    // alt -> show ghosts
}



rb.live.register('springanimationdemogroup', SpringAnimationDemoGroup);

export {SpringAnimationDemoGroup, SpringAnimationDemo};
export default rb.live.register('springanimationdemo', SpringAnimationDemo);
