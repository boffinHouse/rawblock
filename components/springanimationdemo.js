import '../utils/rb_springAnimation';

const rb = window.rb;
// const $ = rb.$;

/**
 * Class component to create a SpringAnimation Demo
 *
 */
class SpringAnimationDemo extends rb.Component {
    static get defaults() {
        return {
            // measureElement: 'self',
            // items: '.children(.{name}{e}item)',
            // toggleItemSelector: '.is{-}toggle{-}item',
            // togglePanel: 'find(.{name}{e}panel)',
            // minItems: 2,
            // minSubItems: 2,
            // growItems: false,
        };
    }

    static get events(){
    }

    constructor(element, initialDefaults) {
        super(element, initialDefaults);

        this.animateElement = this.query('.{name}-element');

        // this.setElPos = this.setElPos.bind(this);

        setTimeout(()=>{
            this.createSpring();
        });
    }

    createSpring(){


        this.springAnimation = new rb.SpringAnimation({
            from: 0,
            target: 100,
            progress: (data)=>{
                this.log(this.animateElement, data);
                this.setElPos(data);
            },
            complete: ()=>{
                this.log('competed this', this);
            }
        });

        this.log('created spring', this, this.springAnimation);
    }

    setElPos(data){
        // console.log(this.);
        this.animateElement.style.transform = `translateX(${data.currentValue}px)`;
    }
}

export default rb.live.register('springanimationdemo', SpringAnimationDemo);
