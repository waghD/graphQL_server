import {DBItem} from './interfaces';

export class Item implements Item{
    itemUid: number;
    type: 'book' | 'shelf' | 'unknown';
    label: string;
    content: string;
    refs: Item[] = [];

    private itemIds: number[];

    constructor(dbItem: DBItem){
        this.itemUid = dbItem.itemUid;
        this.type = (dbItem.type === 'book') ? dbItem.type : 'unknown';
        this.label = dbItem.label;
        this.content = dbItem.content;
        this.itemIds = dbItem.refs.split(';').map((str: string): number => {
            return parseInt(str);
        })
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