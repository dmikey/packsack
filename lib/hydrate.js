// generic jsx based app composition
const hydrateComponent = (component) => {
    const fn = component.elementName;
    component.fn = fn;
    component.elementName = fn.name;
    if(component.children && component.children.length > 0) {
        for(let i=0;i<component.children.length;i++) {
            component.children[i] = hydrateComponent(component.children[i]);
        }
    }
    return component;
};

const Hydrate = dehydratedComponent => {
    // simple hydrater, that just does a quick look through 
    // each tier, and runs the function instance.
    const hydratedComponent = hydrateComponent(dehydratedComponent);
    return hydrateComponent;
};

export {
    Hydrate
}