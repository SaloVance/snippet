/*
 * Object.defineProperty
 * two property descriptors, one of these two flavors, cannot be both
 * data descriptors : writable and value
 * accessor descriptors: getter-setter pair of functions
 */
function Company() {
    var newbie;
    this.staff = [];

    //data descriptors
    Object.defineProperty(this, 'boss', {
        configurable: false,
        enmuerable: true,
        value: 'BigBrother',
        writable: false
    });

    //accessor descriptors
    Object.defineProperty(this, 'newbie', {
        configurable: false,
        enumerable: true,
        //value: null,
        //writable: true,
        get: function() {
            console.log('calling newbie...')
            return newbie;
        },
        set: function(fresh) {
            if (fresh) {
                newbie && this.staff.push(newbie);
                newbie = fresh;
            }
        }
    });
}

var comp = new Company();
comp.newbie = 'salo';
comp.newbie = '';
comp.newbie = 'vance';
comp.newbie = 'xiaoming'

console.log(comp.boss);
console.log(comp.newbie);
console.log(comp.staff);