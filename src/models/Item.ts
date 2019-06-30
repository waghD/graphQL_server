import {DBItem} from './interfaces';
import { Content } from './Content';

export class Item implements Item{
    itemUid: number;
    type: 'book' | 'shelf' | 'unknown';
    label: string;
    content: Content[] = [];
    refs: Item[] = [];

    private itemIds: number[];
    private contentIds: number[];

    constructor(dbItem: DBItem){
        this.itemUid = dbItem.itemUid;
        this.type = (dbItem.type === 'book') ? dbItem.type : 'unknown';
        this.label = dbItem.label;
        this.contentIds = dbItem.content.split(';').map((str: string): number => {
            return parseInt(str);
        });
        this.itemIds = dbItem.refs.split(';').map((str: string): number => {
            return parseInt(str);
        })
    }

    getContent(contentList: Content[]): void {
        const contentArr: Content[] = [];
        this.contentIds.forEach((id:number) => {
            const index: number = contentList.findIndex((content: Content): boolean => content.contentId === id);
            if(index !== -1) {
                contentArr.push(contentList[index]);
            }
        })
        this.content = contentArr;
    }

    getRefs(itemList: Item[]):void {
        const itemArr: Item[] = [];
        this.itemIds.forEach((id:number) => {
            const index: number = itemList.findIndex((item: Item): boolean => item.itemUid === id);
            if(index !== -1) {
                itemArr.push(itemList[index]);
            }
        })
        this.refs = itemArr;
    }
}