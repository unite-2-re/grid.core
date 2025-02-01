// @ts-ignore /* @vite-ignore */
import {subscribe} from "/externals/lib/object.js";

// @ts-ignore /* @vite-ignore */
import AxGesture, {grabForDrag} from "/externals/core/interact.js";

// @ts-ignore /* @vite-ignore */
import { observeContentBox } from "/externals/lib/dom.js";

// @ts-ignore
import { getBoundingOrientRect, agWrapEvent, orientOf } from "/externals/core/agate.js";

//
import $createItem, { setProperty, trackItemState } from "./DefaultItem";

// @ts-ignore /* @vite-ignore */
import {
    redirectCell,
    convertOrientPxToCX,
    animationSequence,
// @ts-ignore /* @vite-ignore */
} from "/externals/core/grid.js";

//
const getSpan = (el, ax)=>{
    const prop = el.style.getPropertyValue(["--ox-c-span", "--ox-r-span"][ax]);
    const factor = ((parseFloat(prop || "1") || 1) - 1);
    return Math.min(Math.max(factor-1, 0), 1);
}

//
const ROOT = document.documentElement;

//
export const inflectInGrid = (gridSystem, items, list: string[]|Set<string> = [], createItem = $createItem)=>{
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
        //
        const gesture = new AxGesture(newItem);
        gesture?.longPress?.({
            handler: "*",
            anyPointer: true,
            mouseImmediate: true,
            minHoldTime: 60 * 3600,
            maxHoldTime: 100
        }, agWrapEvent((evc)=>{
            const ev = evc?.detail || evc;

            if (!newItem.dataset.dragging)
            {
                const n_coord: [number, number] = (ev.orient ? [...ev.orient] : [ev?.clientX || 0, ev?.clientY || 0]) as [number, number];
                if (ev?.pointerId >= 0) {
                    ev?.capture?.(newItem);
                    if (!ev?.capture) {
                        (newItem as HTMLElement)?.setPointerCapture?.(ev?.pointerId);
                    }
                }

                //
                const shifting = agWrapEvent((evc_l: any)=>{
                    const ev_l = evc_l?.detail || evc_l;
                    if (ev_l?.pointerId == ev?.pointerId) {
                        const coord: [number, number] = (ev_l.orient ? [...ev_l.orient] : [ev_l?.clientX || 0, ev_l?.clientY || 0]) as [number, number];
                        const shift: [number, number] = [coord[0] - n_coord[0], coord[1] - n_coord[1]];
                        if (Math.hypot(...shift) > 10) {
                            ROOT.removeEventListener("pointermove", shifting);
                            grabForDrag(newItem, ev_l, {
                                propertyName: "drag",
                                shifting: [
                                    parseFloat(newItem?.style?.getPropertyValue("--drag-x")) || 0,
                                    parseFloat(newItem?.style?.getPropertyValue("--drag-y")) || 0
                                ],
                            });
                        }
                    }
                });

                //
                const releasePointer = agWrapEvent((evc_l)=>{
                    const ev_l = evc_l?.detail || evc_l;
                    if (ev_l?.pointerId == ev?.pointerId) {
                        unbind(ev_l);
                        ev_l?.release?.();
                    }
                });

                //
                const unbind = agWrapEvent((evc_l)=>{
                    const ev_l = evc_l?.detail || evc_l;
                    if (ev_l?.pointerId == ev?.pointerId) {
                        ROOT.removeEventListener("pointermove", shifting);
                        ROOT.removeEventListener("pointercancel", releasePointer);
                        ROOT.removeEventListener("pointerup", releasePointer);
                    }
                });

                //
                ROOT.addEventListener("pointermove", shifting);
                ROOT.addEventListener("pointercancel", releasePointer);
                ROOT.addEventListener("pointerup", releasePointer);
            }
        }));

        //
        newItem.addEventListener("m-dragstart", (ev)=>{
            const cbox = getBoundingOrientRect(newItem) || newItem?.getBoundingClientRect?.();
            const pbox = getBoundingOrientRect(gridSystem) || gridSystem?.getBoundingClientRect?.();
            const rel : [number, number] = [(cbox.left + cbox.right)/2 - pbox.left, (cbox.top + cbox.bottom)/2 - pbox.top];

            //
            layout[0] = gridSystem.style.getPropertyValue("--layout-c") || layout[0];
            layout[1] = gridSystem.style.getPropertyValue("--layout-r") || layout[1];

            //
            const args = {item, list, items, layout, size};
            const CXa  = convertOrientPxToCX(rel, args, orientOf(gridSystem));
            const prev = [item.cell[0], item.cell[1]];
            const cell = redirectCell([Math.floor(CXa[0]), Math.floor(CXa[1])], args);

            //
            if (prev[0] != cell[0] || prev[1] != cell[1]) {
                if (ev?.detail?.holding?.modified != null) {
                    setProperty(newItem, "--drag-x", ev.detail.holding.modified[0] = 0);
                    setProperty(newItem, "--drag-y", ev.detail.holding.modified[1] = 0);
                } else {
                    setProperty(newItem, "--drag-x", 0);
                    setProperty(newItem, "--drag-y", 0);
                }
                item.cell = cell;
                setProperty(newItem, "--p-cell-x", item.cell[0]);
                setProperty(newItem, "--p-cell-y", item.cell[1]);
            }

            //
            newItem.dataset.dragging = "";
        });

        //
        newItem.addEventListener("m-dragend", async (ev)=>{
            const cbox = getBoundingOrientRect(newItem) || newItem?.getBoundingClientRect?.();
            const pbox = getBoundingOrientRect?.(gridSystem) || gridSystem?.getBoundingClientRect?.();
            const rel : [number, number] = [(cbox.left + cbox.right)/2 - pbox.left, (cbox.top + cbox.bottom)/2 - pbox.top];

            //
            layout[0] = gridSystem.style.getPropertyValue("--layout-c") || layout[0];
            layout[1] = gridSystem.style.getPropertyValue("--layout-r") || layout[1];

            //
            const args = {item, list, items, layout, size};
            const CXa  = convertOrientPxToCX(rel, args, orientOf(gridSystem));

            //
            const clamped = [Math.floor(CXa[0]), Math.floor(CXa[1])];
            clamped[0] = Math.max(Math.min(clamped[0], layout[0]-1), 0);
            clamped[1] = Math.max(Math.min(clamped[1], layout[1]-1), 0);

            //
            const cell = redirectCell(clamped, args);
            const prev = [item.cell[0], item.cell[1]];

            //
            setProperty(newItem, "--cell-x", cell[0]);
            setProperty(newItem, "--cell-y", cell[1]);

            //
            const animation = newItem.animate(animationSequence([
                parseInt(newItem.style.getPropertyValue("--drag-x")),
                parseInt(newItem.style.getPropertyValue("--drag-y"))
            ], item.cell, cell), {
                fill: "both",
                duration: 150,
                easing: "linear"
            });

            //
            let shifted = false;
            const onShift: [any, any] = [(ev)=>{
                if (!shifted) {
                    shifted = true;
                    //animation?.commitStyles?.();
                    animation?.cancel?.();
                }

                //
                newItem?.removeEventListener?.("m-dragstart", ...onShift);
            }, {once: true}];

            // not fact, but for animation
            setProperty(newItem, "--p-cell-x", prev[0]);
            setProperty(newItem, "--p-cell-y", prev[1]);

            //
            newItem?.addEventListener?.("m-dragstart", ...onShift);
            //await new Promise((r)=>requestAnimationFrame(r));
            await animation?.finished?.catch?.(console.warn.bind(console));

            //
            if (!shifted) {
                // commit dragging result
                item.cell = cell;
                onShift?.[0]?.();

                //
                setProperty(newItem, "--p-cell-x", item.cell[0]);
                setProperty(newItem, "--p-cell-y", item.cell[1]);

                //
                if (ev?.detail?.holding?.modified != null) {
                    setProperty(newItem, "--drag-x", ev.detail.holding.modified[0] = 0);
                    setProperty(newItem, "--drag-y", ev.detail.holding.modified[1] = 0);
                } else {
                    setProperty(newItem, "--drag-x", 0);
                    setProperty(newItem, "--drag-y", 0);
                }

                //
                delete newItem.dataset.dragging;
            }
        });

        //
        newItem?.dispatchEvent?.(new CustomEvent("u2-item-added", {
            detail: {item},
            bubbles: true,
            cancelable: true
        }));

        //
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
                subscribe(item, (state, property)=>trackItemState(newItem, item, [state, property], {item, list, items, layout, size}));
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
