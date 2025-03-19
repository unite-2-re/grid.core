// @ts-ignore /* @vite-ignore */
import {subscribe, makeObjectAssignable, makeReactive } from "/externals/lib/object.js";

// @ts-ignore /* @vite-ignore */
import { observeContentBox } from "/externals/lib/dom.js";

//
import $createItem, { setProperty } from "./DefaultItem";

// @ts-ignore /* @vite-ignore */
import {
    redirectCell,
// @ts-ignore /* @vite-ignore */
} from "/externals/core/grid.js";
import { bindInteraction } from "./Interaction";

//
export const inflectInGrid = (gridSystem, items, /*list: string[]|Set<string> = [],*/ createItem = $createItem)=>{
    //
    const size = [0, 0], layout = [4, 8];
    observeContentBox(gridSystem, (boxSize)=>{
        size[0] = boxSize.inlineSize;
        size[1] = boxSize.blockSize;
    });

    //
    setProperty(gridSystem, "--layout-c", layout[0] = parseInt(gridSystem.style.getPropertyValue("--layout-c") || "0") || layout[0] || 4);
    setProperty(gridSystem, "--layout-r", layout[1] = parseInt(gridSystem.style.getPropertyValue("--layout-r") || "0") || layout[1] || 8);

    //
    const bindInternal = (newItem, item)=>{
        bindInteraction(newItem, {item, list: null, items, layout, size});
        newItem?.dispatchEvent?.(new CustomEvent("u2-item-added", {
            detail: {item},
            bubbles: true,
            cancelable: true
        }));
        return newItem;
    }

    //
    const elements: HTMLElement[] = [];

    //
    subscribe(items, (item, index, old)=>{
        if (item && item?.id) {
            const newItem = createItem(item, gridSystem);
            const id = item?.id; newItem.dataset.id = id;
            if (!newItem.classList.contains('u2-grid-item')) {
                newItem.classList.add('u2-grid-item');
            }

            //
            setProperty(gridSystem, "--layout-c", layout[0] = parseInt(gridSystem?.style?.getPropertyValue("--layout-c") || "0") || layout[0] || 4);
            setProperty(gridSystem, "--layout-r", layout[1] = parseInt(gridSystem?.style?.getPropertyValue("--layout-r") || "0") || layout[1] || 8);

            //
            if (!gridSystem?.contains?.(newItem)) {
                gridSystem?.appendChild?.(newItem);
                bindInternal(newItem, item);
                subscribe(item, (state, property)=>{
                    const args = {item, list: null, items, layout, size};
                    if (item && !item?.cell) { item.cell = makeObjectAssignable(makeReactive([0, 0])); };
                    if (item && args) { item.cell = redirectCell(item?.cell, args); };
                    if (property == "cell") { subscribe(state, (v,p)=>setProperty(newItem, ["--cell-x","--cell-y"][parseInt(p)], v)); }
                });
            }

            //
            if (elements.indexOf(newItem) < 0) { elements.push(newItem); };
        } else {
            const oldItem = gridSystem.querySelector(`.u2-grid-item[data-id=\"${old?.id}\"]`);
            if (oldItem) {
                //
                const idx = elements.indexOf(oldItem);
                if (idx >= 0) { elements.splice(idx, 1); };

                //
                oldItem?.dispatchEvent?.(new CustomEvent("u2-item-removed", {
                    detail: {item},
                    bubbles: true,
                    cancelable: true
                }));
                oldItem.remove();
            }
        }
    });

    //
    return elements;
}
