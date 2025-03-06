export * from "./$core$/GridItemUtils";
export * from "./$core$/Properties";
export * from "./$wcomp$/GridBox";
export * from "./$system$/TrackingSystem";

// @ts-ignore
import styles from "./$wcomp$/GridBox.scss?inline&compress";
export const preInit = URL.createObjectURL(new Blob([styles], {type: "text/css"}));

// @ts-ignore
import { loadBlobStyle } from "/externals/lib/dom.js";
import prop from "./$core$/Properties";

// stub
const init = ()=>{
    loadBlobStyle(preInit);
    prop();
};

//
export default init;
