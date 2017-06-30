const CSS = window.CSS;

const cssSupports = CSS && CSS.supports ?
    function(){
        return CSS.supports.apply(CSS, arguments);
    } :
    function(){
        return '';
    }
;

if(window.rb){
    rb.cssSupports = cssSupports;
}

export default cssSupports;
