let shrinkNavWrapper;

const html = `
    <style>
        .shrinknav-wrapper {
            width: 600px;
        }
        
        .shrinknav-item {
            width: 180px;
        }
    </style>
    <div class="shrinknav" data-module="shrinknav">
        <div class="shrinknav-item"></div>
        <div class="shrinknav-item"></div>
        <div class="shrinknav-item"></div>
        <div class="shrinknav-item"></div>
        <div class="shrinknav-item"></div>
        <div class="shrinknav-item"></div>
        <div class="shrinknav-item is-toggle-item">
            <div class="shrinknav-panel">
    
            </div>
        </div>
    </div>`
;

function createShrinkNav(){
    destoryShrinkNav();

    shrinkNavWrapper = document.createElement('div');
    shrinkNavWrapper.innerHTML = html;
    shrinkNavWrapper.className = 'shrinknav-wrapper';

    document.body.appendChild(shrinkNavWrapper);
}

function destoryShrinkNav() {
    if(shrinkNavWrapper){
        shrinkNavWrapper.remove();
        shrinkNavWrapper = null;
    }
}

function shrinknavComponent(options){
    if(options && options.size){
        shrinkNavWrapper.style.width = typeof options.size == 'number' ?
            options.size + 'px' :
            options.size
        ;
        delete options.size;
    }
    return rb.$(shrinkNavWrapper).find('.shrinknav').rbComponent('shrinknav', options);
}

describe('shrinknav', function () {
    beforeEach(function() {
        createShrinkNav();
    });

    it('render shrinkNav with default options', function(done) {
        const shrinkNav = shrinknavComponent();

        rbTest.wait().then(()=>{
            expect(shrinkNav.mainbarItems.length).toEqual(2);
            done();
        });
    });
});
