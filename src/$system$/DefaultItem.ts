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
        if ((parseFloat(prop||"0") != value && prop != value) || !prop) {
            target.style.setProperty(name, value, importance);
        }
    }
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
