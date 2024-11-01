// @ts-ignore
import styles from "./GridBox.scss?inline&compress";

//
export const preInit = URL.createObjectURL(new Blob([styles], {type: "text/css"}));

//
class GridBoxElement extends HTMLElement {
    #initialized: boolean = false;

    //
    #initialize() {
        if (!this.#initialized) {
            this.#initialized = true;

            // legacy?
            this.classList.add("u2-grid-layout");

            //
            /*const shadow = this.attachShadow({mode: 'open'});
            const style  = document.createElement("style");
            style.innerHTML = `@import url("${preInit}");`;
            shadow.appendChild(style);*/
        }
    }

    //
    constructor() {
        super();
    }

    //
    connectedCallback() {
        this.#initialize();
    }
}

//
customElements.define("u-gridbox", GridBoxElement);

//
export default () => {};
export { GridBoxElement };

//
const OWNER = "gridbox";

//
const setStyleURL = (base: [any, any], url: string)=>{
    //
    if (base[1] == "innerHTML") {
        base[0][base[1]] = `@import url("${url}");`;
    } else {
        base[0][base[1]] = url;
    }
}

//
const loadStyleSheet = (inline: string, base?: [any, any])=>{
    const url = URL.canParse(inline) ? inline : URL.createObjectURL(new Blob([inline], {type: "text/css"}));
    if (base) setStyleURL(base, url);
}

//
const loadInlineStyle = (inline: string, rootElement = document.head)=>{
    const style = document.createElement("style");
    style.dataset.owner = OWNER;
    loadStyleSheet(inline, [style, "innerHTML"]);
    (rootElement.querySelector("head") ?? rootElement).appendChild(style);
}

//
const loadBlobStyle = (inline: string)=>{
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.type = "text/css";
    style.crossOrigin = "same-origin";
    style.dataset.owner = OWNER;
    loadStyleSheet(inline, [style, "href"]);
    document.head.appendChild(style);
    return style;
}

//
loadBlobStyle(preInit);
