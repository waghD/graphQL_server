import {DBItem, DBCube, Item} from './interfaces';

export class Cube implements Cube{
    uid: number;
    label: string;
    color: string;
    x: number;
    y: number;
    z: number;
    items: Item[] = [];
    neighbours: Cube[] = [];

    private itemIds: number[];
    private neighbourIds: number[];

    constructor(dbCube: DBCube) {
        this.uid = dbCube.uid;
        this.label = dbCube.label;
        this.color = dbCube.color;
        this.x = dbCube.x;
        this.y = dbCube.y;
        this.z = dbCube.z;
        this.itemIds = dbCube.items.split(';').map((str: string) => {
            return parseInt(str);
        })
        this.neighbourIds = dbCube.neighbours.split(';').map((str: string) => {
            return parseInt(str);
        })
    }

    getNeighbours(cubeList: Cube[]): void {
        const neighbourArr: Cube[] = [];
        this.neighbourIds.forEach((id:number) => {
            const index: number = cubeList.findIndex((cube: Cube): boolean => cube.uid === id);
            if(index !== -1) {
                neighbourArr.push(cubeList[index]);
            }
        })
        this.neighbours = neighbourArr;
    }

    getItems(itemList: Item[]): void {
        const itemArr: Item[] = [];
        this.itemIds.forEach((id:number) => {
            const index: number = itemList.findIndex((item: Item): boolean => item.itemUid === id);
            if(index !== -1) {
                itemArr.push(itemList[index]);
            }
        })
        this.items = itemArr;
    }
}