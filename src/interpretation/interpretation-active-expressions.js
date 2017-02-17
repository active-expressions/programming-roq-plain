import Interpreter from '../../lib/jsinterpreter/interpreter.js';
import Stack from 'stack-es2015-modules';
import { PropertyListener } from './listener.js';

const expressionObserverStack = new Stack();

export class ExpressionObserver {
    constructor(func, scope, item, callback) {
        this.func = func;
        this.scope = scope;
        this.item = item;

        this.lastValue = this.getCurrentValue();
        this.callback = callback;
        this.propertyListeners = new Set();

        this.installListeners();
    }

    getCurrentValue() {
        return this.func(this.item);
    }

    propertyAssigned() {
        let currentValue = this.getCurrentValue();
        if(this.lastValue === currentValue) { return; }
        this.lastValue = currentValue;

        this.callback();
    }

    installListeners() {
        // in case of multiple interpretations on top of each other
        expressionObserverStack.withElement(this, () => {
            ExpressionInterpreter.runAndReturn(this.func, this.scope, this.item);
        });
    }

    removeListeners() {
        this.propertyListeners.forEach(listener => listener.dependingObservers.delete(this));
        this.propertyListeners.clear();
    }
}

export class ExpressionInterpreter extends Interpreter {

    static runAndReturn(func, scope = {}, ...params) {
        function argumentNameForIndex(key) {
            return '__arg__' + key;
        }

        let i = new ExpressionInterpreter(
            `var returnValue = (${func.toString()})(${params.map((value, key) => argumentNameForIndex(key)).join(', ')});`,
            (self, rootScope) => {
                Object.keys(scope).forEach(k => {
                    let value = scope[k];
                    self.setProperty(rootScope, k, self.createPseudoObject(value));
                });

                params.forEach((value, key) => {
                    let name = argumentNameForIndex(key);
                    self.setProperty(rootScope, name, self.createPseudoObject(value));
                });
            });
        i.run();
        return i.stateStack[0].scope.properties.returnValue.valueOf();
    }

    getProperty(obj, name) {
        let object = obj.valueOf(),
            prop = name.valueOf();

        PropertyListener
            .watchProperty(object, prop)
            .addHandler(expressionObserverStack.top());

        return super.getProperty(obj, name);
    }
}
