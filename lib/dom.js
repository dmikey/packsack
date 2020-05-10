import { Hydrate } from './hydrate';

let hydratedComponent;
const renderComponent = component => {
    console.log('render this component >>', component);
};

export default {
    render: (component, target) => {
        hydratedComponent = Hydrate(component);
        const targetElement = document.querySelector(target);
        const renderedComponent = renderComponent(component);
        console.log(targetElement, hydratedComponent);
        return hydratedComponent;
    }
};