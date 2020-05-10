import { Hydrate } from './hydrate';

const renderComponent = component => {
    if(component.__instance__ && component.__instance__.render) {
        component.computedValue = component.__instance__.render(component.attributes);
    }
    return component;
};

export default {
    render: (component, target) => {
        let renderedComponent;
        renderedComponent = Hydrate(component, renderComponent);
        console.log(renderedComponent);
        const targetElement = document.querySelector(target);
        return renderedComponent;
    }
};