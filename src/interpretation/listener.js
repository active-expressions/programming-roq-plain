import { PropertyAccessor } from './property-accessor.js';
import { isPrimitive } from '../utils.js';

const LISTENERS_BY_ACCESSOR = new Map();

export class PropertyListener {
    static watchProperty(obj, propName) {
        let mapObj;
        if(LISTENERS_BY_ACCESSOR.has(obj)) {
            mapObj = LISTENERS_BY_ACCESSOR.get(obj);
        } else {
            mapObj = {};
            LISTENERS_BY_ACCESSOR.set(obj, mapObj);
        }

        if(!mapObj.hasOwnProperty(propName)) {
            mapObj[propName] = new PropertyListener(obj, propName);
        }

        return mapObj[propName];
    };

    constructor(obj, propName) {
        this.dependingObservers = new Set();

        this.propertyAccessor = new PropertyAccessor(obj, propName);
        this.propertyAccessor.setterCallback(newValue => this.newValueSet(newValue));
    }

    addHandler(observer) {
        this.dependingObservers.add(observer);
        observer.propertyListeners.add(this);
    }

    newValueSet(newValue) {
        if(!isPrimitive(newValue)) {
            this.recalculate();
        }

        this.applyCallbacks();
    }

    applyCallbacks() {
        this.dependingObservers.forEach(observer => observer.propertyAssigned());
    }

    recalculate() {
        let tempObservers = [];
        this.dependingObservers.forEach(observer => tempObservers.push(observer));

        tempObservers.forEach(observer => observer.removeListeners());
        tempObservers.forEach(observer => observer.installListeners());
    }
}
