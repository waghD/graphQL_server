import {DBCube, Item} from './interfaces';

/**
 * Class representation of a Cube/Room in the RAMI Model
 */
export class Cube implements Cube {
    uid: number;
    label: string;
    color: string;
    x: number = -1;
    y: number = -1;
    z: number = -1;
    items: Item[] = [];
    neighbours: Cube[] = [];

    private itemIds: number[];
    private neighbourIds: number[];

    constructor(dbCube: DBCube) {
        this.uid = dbCube.uid;
        this.label = dbCube.label;
        this.color = dbCube.color;
        this.itemIds = dbCube.items.split(';').map((str: string) => {
            return parseInt(str);
        })
        this.neighbourIds = dbCube.neighbours.split(';').map((str: string) => {
            return parseInt(str);
        })
    }

    /**
     * Sets the coordinate of this Cube
     * @param z Z Coordinate
     * @param x X Coordinate
     * @param y Y Coordinate
     */
    setCoords(z: number, x: number, y: number){
        if(z < 0 || x < 0 || y < 0){
            console.log(this.label + ' invalid coordinate');
        }
        this.z = z;
        this.x = x;
        this.y = y;
    }

    /**
     * Translates the id list of neighbouring cubes to object references.
     * Has to be executed after creation of all cubes in model. 
     * @param cubeList Full list of Cubes
     */
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

    /**
     * Translates item id list to list of object references, just like getNeighbours.
     * Has to be executed after all Item objects have been initialized. 
     * @param itemList Full list of Items in Model
     */
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

    /**
     * Checks whether all Connections to other cubes are mutual. 
     */
    checkMyNeighbours(): boolean {
        let neighboursOk = true;
        this.neighbours.forEach((neighbour: Cube):void => {
            const index = neighbour.neighbours.findIndex((trailbackCube:Cube):boolean => trailbackCube.uid === this.uid);
            if(index === -1){
                neighboursOk = false;
            }
        })
        return neighboursOk;
    }
}