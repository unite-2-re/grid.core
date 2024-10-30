// @ts-ignore
import styles from "./GridBox.scss?inline";

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
const loadBlobStyle = (preInit: string)=>{
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.type = "text/css";
    style.href = preInit;
    style.dataset.owner = "grid";
    document.head.appendChild(style);
    return style;
}

//
loadBlobStyle(preInit);
