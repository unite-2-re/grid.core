import { getCorrectOrientation } from "../$core$/GridItemUtils";
import { setStyleRules, type StyleTuple } from "./StyleRules";

//
export const whenAnyScreenChanges = (cb)=>{
    //
    if ("virtualKeyboard" in navigator) {
        // @ts-ignore
        navigator?.virtualKeyboard?.addEventListener?.(
            "geometrychange",
            cb,
            {passive: true}
        );
    }

    //
    document.documentElement.addEventListener("DOMContentLoaded", cb, {
        passive: true,
    });
    screen.orientation.addEventListener("change", cb, {passive: true});
    matchMedia("(orientation: portrait)").addEventListener("change", cb, {passive: true});
    self.addEventListener("resize", cb, {passive: true});

    //
    window?.visualViewport?.addEventListener?.("scroll", cb);
    window?.visualViewport?.addEventListener?.("resize", cb);

    //
    document.documentElement.addEventListener("fullscreenchange", cb);

    //
    requestIdleCallback(cb, {timeout: 1000});
}



//
const regProp = (options: any)=>{
    try {
        CSS?.registerProperty?.(options);
    } catch(e) {
        console.warn(e);
    };
};

//
regProp?.({
    name: "--drag-x",
    syntax: "<number>",
    inherits: true,
    initialValue: "0",
});

//
regProp?.({
    name: "--drag-y",
    syntax: "<number>",
    inherits: true,
    initialValue: "0",
});

//
regProp?.({
    name: "--grid-r",
    syntax: "<number>",
    inherits: true,
    initialValue: "0",
});

//
regProp?.({
    name: "--grid-c",
    syntax: "<number>",
    inherits: true,
    initialValue: "0",
});

//
regProp?.({
    name: "--translate-x",
    syntax: "<length-percentage>",
    inherits: true,
    initialValue: "0px",
});

//
regProp?.({
    name: "--translate-y",
    syntax: "<length-percentage>",
    inherits: true,
    initialValue: "0px",
});

//
export const getOrientedPoint = () => {
    const orientation = getCorrectOrientation();
    switch (orientation) {
        case "portrait-primary":
            return {
                "--translate-x": `calc(calc(calc(var(--grid-w) / var(--f-col)) * var(--dir-x)) * 1px)`,
                "--translate-y": `calc(calc(calc(var(--grid-h) / var(--f-row)) * var(--dir-y)) * 1px)`,
            };

        case "portrait-secondary":
            return {
                "--translate-x": `calc(calc(calc(var(--grid-w) / var(--f-col)) * var(--dir-x)) * -1px)`,
                "--translate-y": `calc(calc(calc(var(--grid-h) / var(--f-row)) * var(--dir-y)) * -1px)`,
            };

        case "landscape-primary":
            return {
                "--translate-x": `calc(calc(calc(var(--grid-w) / var(--f-row)) * var(--dir-y)) * 1px)`,
                "--translate-y": `calc(calc(calc(var(--grid-h) / var(--f-col)) * var(--dir-x)) * -1px)`,
            };

        case "landscape-secondary":
            return {
                "--translate-x": `calc(calc(calc(var(--grid-w) / var(--f-row)) * var(--dir-y)) * -1px)`,
                "--translate-y": `calc(calc(calc(var(--grid-h) / var(--f-col)) * var(--dir-x)) * 1px)`,
            };

        default:
            return {
                "--translate-x": `calc(calc(calc(var(--grid-w) / var(--f-col)) * var(--dir-x)) * 1px)`,
                "--translate-y": `calc(calc(calc(var(--grid-h) / var(--f-row)) * var(--dir-y)) * 1px)`,
            };
    }
};

//
export const animationSequence = (DragCoord = [0, 0], CellStart = null, CellEnd = null) => {
    return [{
        "--drag-x": DragCoord?.[0] || 0,
        "--drag-y": DragCoord?.[1] || 0,
        "--grid-c": CellStart?.[0] != null ? (CellStart?.[0]+1) : "var(--fp-cell-x)",
        "--grid-r": CellStart?.[1] != null ? (CellStart?.[1]+1) : "var(--fp-cell-y)",
    }, // starting...
    {
        "--drag-x": 0,
        "--drag-y": 0,
        "--grid-c": CellEnd?.[0] != null ? (CellEnd?.[0]+1) : "var(--fc-cell-x)",
        "--grid-r": CellEnd?.[1] != null ? (CellEnd?.[1]+1) : "var(--fc-cell-y)",
    }];
};

//
const realCellOriented = {
    "portrait-primary": {
        "grid-column": "var(--grid-column)",
        "grid-row": "var(--grid-row)",
    },
    "landscape-primary": {
        "grid-column": "var(--grid-row)",
        "grid-row": "calc(var(--layout-c) - var(--grid-column) + 1)",
    },
    "portrait-secondary": {
        "grid-column": "calc(var(--layout-c) - var(--grid-column) + 1)",
        "grid-row": "calc(var(--layout-r) - var(--grid-row) + 1)",
    },
    "landscape-secondary": {
        "grid-column": "calc(var(--rows) - var(--grid-row) + 1)",
        "grid-row": "var(--grid-column)",
    }
};

//
const currentCellLayout = {...realCellOriented[getCorrectOrientation()]};

//
export const updateOrientation = (_) => {
    Object.assign(currentCellLayout, realCellOriented[getCorrectOrientation()]);
};

//
const classes: StyleTuple[] = [
    [":where(.u2-grid-item), :where(.u2-grid-page > *), :where(.u2-grid-item-label)", currentCellLayout]
];

//
const initialize = ()=>{
    whenAnyScreenChanges((e?: any) => {
        updateOrientation(e);
        setStyleRules(classes);
    });
}

//
export default initialize;
