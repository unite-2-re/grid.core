// @ts-ignore
import styles from "./GridBox.scss?inline&compress";

//
export const preInit = URL.createObjectURL(new Blob([styles], {type: "text/css"}));

//
class UIGridBoxElement extends HTMLElement {
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
customElements.define("ui-gridbox", UIGridBoxElement);

//
export default () => {};
export { UIGridBoxElement };

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
const hash = async (string: string) => {
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(string));
    return "sha256-" + btoa(String.fromCharCode.apply(null, new Uint8Array(hashBuffer) as unknown as number[]));
}

//
const loadStyleSheet = async (inline: string, base?: [any, any], integrity?: string|Promise<string>)=>{
    const url = URL.canParse(inline) ? inline : URL.createObjectURL(new Blob([inline], {type: "text/css"}));
    if (base?.[0] && (!URL.canParse(inline) || integrity) && base?.[0] instanceof HTMLLinkElement) {
        const I: any = (integrity ?? hash(inline));
        if (typeof I?.then == "function") {
            I?.then?.((H)=>base?.[0]?.setAttribute?.("integrity", H));
        } else {
            base?.[0]?.setAttribute?.("integrity", I as string);
        }
    }
    if (base) setStyleURL(base, url);
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
const loadInlineStyle = (inline: string, rootElement = document.head)=>{
    const PLACE = (rootElement.querySelector("head") ?? rootElement);
    if (PLACE instanceof HTMLHeadElement) { loadBlobStyle(inline); }

    //
    const style = document.createElement("style");
    style.dataset.owner = OWNER;
    loadStyleSheet(inline, [style, "innerHTML"]);
    PLACE.appendChild(style);
}

//
loadBlobStyle(preInit);
