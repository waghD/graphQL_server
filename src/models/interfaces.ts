/**
 * Database Model for Cubes
 */
export interface DBCube {
    uid: number;
    label: string;
    color: string;
    contentTags: string;
    items: string;
    neighbours: string;
}

/**
 * Database Model for Items
 */
export interface DBItem {
    itemUid: number;
    type: string;
    label: string;
    content: string;
    refs: string
}

/**
 * Database Model for Itemcontent
 */
export interface DBContent {
    contentId: number,
    label: string,
    contentType: string,
    text: string,
    src: string,
}

/**
 * Interface for Item Content Objects
 */
export interface Content {
    contentId: number;
    label: string;
    contentType: 'text' | 'imageLink' | 'pdfLink' | 'externalLink';
    text: string;
    src: string;
}

/**
 * Interface for Item Objects
 */
export interface Item {
    itemUid: number;
    type: 'book' | 'shelf' | 'unknown';
    label: string;
    content: Content[];
    refs: Item[];
}

/**
 * Interface for Cube Objects
 */
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