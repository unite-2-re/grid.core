//
const regProp = (options: any)=>{
    try {
        CSS?.registerProperty?.(options);
    } catch(e) {
        console.warn(e);
    };
};

//
export const initProps = ()=>{
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
}

//
export default initProps;
