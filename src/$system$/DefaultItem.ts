// @ts-ignore /* @vite-ignore */
import {subscribe, makeReactive, makeObjectAssignable} from "/externals/lib/object.js";

// @ts-ignore /* @vite-ignore */
import {
    redirectCell
// @ts-ignore /* @vite-ignore */
} from "/externals/core/grid.js";

//
export const setProperty = (target, name, value, importance = "")=>{
    if ("attributeStyleMap" in target) {
        const raw = target.attributeStyleMap.get(name);
        const prop = raw?.[0] ?? raw?.value;
        if (parseFloat(prop) != value && prop != value || prop == null) {
            //if (raw?.[0] != null) { raw[0] = value; } else
            if (raw?.value != null) { raw.value = value; } else
            { target.attributeStyleMap.set(name, value); };
        }
    } else
    {
        const prop = target?.style?.getPropertyValue?.(name);
        if (parseFloat(prop) != value && prop != value || prop == null) {
            target.style.setProperty(name, value, importance);
        }
    }
}

//
export const trackItemState = (element, item, [value, prop], args?)=>{
    if (item && !item?.cell) { item.cell = makeObjectAssignable(makeReactive([0, 0])); };
    if (item && args) { item.cell = redirectCell(item?.cell, args); };

    //
    if (element) {
        if (prop == "cell") { subscribe(value, (v,p)=>setProperty(element, ["--cell-x","--cell-y"][parseInt(p)], v)); } else
        if (prop == "label" && element.matches("span")) { element.innerHTML = value; } else
        if (prop == "icon") { element[prop] = value; } else
        if (element?.dataset && typeof prop == "string" && !URL.canParse(prop) && !prop.includes("\/") && !prop.includes("#")) { element.dataset[prop] = value; };
    }

    //
    element?.dispatchEvent?.(new CustomEvent("u2-item-state-change", {
        detail: {item, value, prop},
        bubbles: true,
        cancelable: true
    }));
}

//
export const createItem = (item, gridSystem)=>{
    if (!item) return;

    // if exists, skip
    const exists = gridSystem?.querySelector?.(`.u2-grid-item[data-id=\"${item?.id}\"]`);
    if (exists) { return exists; }

    //
    const newItem = document.createElement("div");
    newItem.style.setProperty("--ox-r-span", "1");
    newItem.style.setProperty("--ox-c-span", "1");
    return newItem;
}

//
export default createItem;
