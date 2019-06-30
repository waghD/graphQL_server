
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

export interface DBContent {
    contentId: number,
    label: string,
    contentType: string,
    text: string,
    src: string,
}

export interface Content {
    contentId: number;
    label: string;
    contentType: 'text' | 'imageLink' | 'pdfLink';
    text: string;
    src: string;
}

export interface Item {
    itemUid: number;
    type: 'book' | 'shelf' | 'unknown';
    label: string;
    content: Content[];
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