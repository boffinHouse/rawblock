const rb = window.rb;

/**
 *
 * @param element
 * @param [margin=0] {Number}
 * @param [intersect=0] {Number}
 * @param [viewportWidth] {Number}
 * @param [viewportHeight] {Number}
 */
rb.checkInViewport = function (element, margin, intersect, viewportWidth, viewportHeight){
    let tmpValue, boxArea, intersectArea;
    let value = false;
    let box = element.getBoundingClientRect();

    if(box.top || box.left || box.right || box.bottom || element.getClientRects().length){
        let top = 0;
        let left = 0;
        let right = viewportWidth || window.innerWidth;
        let bottom = viewportHeight || window.innerHeight;

        if(margin){
            top -= margin;
            left -= margin;
            right += margin;
            bottom += margin;
        }

        tmpValue = (box.top <= bottom && box.bottom >= top && box.left <= right && box.right >= left);

        if(tmpValue){
            value = tmpValue;

            if(intersect == 1){
                value = (box.top >= top && box.bottom <= bottom && box.left >= left && box.right <= right);
            } else if(intersect) {
                boxArea = Math.min(box.width, right) * Math.min(box.height, bottom);
                intersectArea = (Math.min(box.bottom, bottom) - Math.max(box.top, top)) *  (Math.min(box.right, right) - Math.max(box.left, left));

                value = intersectArea / boxArea >= intersect;
            }
        }
    }


    return value;
};


export default rb.checkInViewport;
