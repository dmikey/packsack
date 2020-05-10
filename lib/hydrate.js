// generic jsx based app composition
// sans any rendering
// render state will be managed by a platform plugin
const hydrateComponent = (component, handler, parent) => {

    if (component.children && component.children.length > 0) {
        for(let i=0;i < component.children.length;i++) {
            const childComponent = component.children[i];
            component = handler(component, parent);
            component.children[i] = hydrateComponent(childComponent, handler, component);
        }
    };
     
    if (typeof component.elementName == 'function') {
        component.__instance__ = new component.elementName();
        if (component.elementName.name) {
            component.elementName = component.elementName.name;
        }
    }

    component = handler(component, parent);
    return component;
};

const Hydrate = (dehydratedComponent, handler) => {
    // simple hydrater, that just does a quick look through 
    // each tier, and runs the function instance.
    const hydratedComponent = hydrateComponent(dehydratedComponent, handler);
    return hydratedComponent;
};

export {
    Hydrate
};