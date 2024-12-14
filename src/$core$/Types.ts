//
export interface GridItemType {
    cell: [number, number];
    id: string;
    label: string;
    pointerId?: number;
    icon: string;
    href?: string;
    action?: string;
    detached?: boolean;
};

//
export interface GridArgsType {
    item: GridItemType;
    list: Set<string> | string[];
    items: Map<string, GridItemType>|Set<GridItemType>|GridItemType[];
    layout: [number, number];
    size: [number, number];
};

//
export interface GridStateType {
    lists: Set<string> | string[];
    items: Map<string, GridItemType>|Set<GridItemType>|GridItemType[];
    layout: [number, number];
};
