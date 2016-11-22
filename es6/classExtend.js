/*
 * Class Extend
 * get set property
 */
class Parent {
    constructor(name) {
        this._name = name;
    }

    sayHi() {
        console.log('hello this is Parent', this.name);
    }

    get name() {
        return this._name || '';
    }

    set name(value) {
        if (value) {
            this._name = value;
        }
    }
}

class Child extends Parent {
    constructor(name) {
        super(name);
    }

    sayHello() {
        console.log('hello this is Child', this.name);
    }
}

var child = new Child('salo');
child.name = '';
console.log(child.name);
child.sayHi();
child.sayHello();