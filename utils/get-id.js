let id = Math.round(Date.now() * Math.random());

/**
 * Returns a unique id based on Math.random and Date.now().
 * @memberof rb
 * @returns {string}
 */
export default function getID() {
    id += Math.round(Math.random() * 1000);
    return id.toString(36);
}

if(window.rb){
    window.rb.getID = getID;
}
