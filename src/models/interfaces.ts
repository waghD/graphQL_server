export interface DBCube {
    uid: number;
    label: string;
    color: string;
    x: number;
    y: number;
    z: number;
    items: string;
    neighbours: string;
}

export interface DBItem {
    itemUid: number;
    type: string;
    label: string;
    content: string;
    refs: string
}

export interface Item {
    itemUid: number;
    type: 'book' | 'shelf' | 'unknown';
    label: string;
    content: string;
    refs: Item[];
}

export interface Cube {
    uid: number;
    label: string;
    color: string;
    x: number;
    y: number;
    z: number;
    items: Item[];
    neighbours: Cube[];
}