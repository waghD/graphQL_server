import { DBCube } from "./interfaces";
import { Cube } from "./Cube";

export abstract class CubeScheme {
    abstract build(dbCube: DBCube[], fill: boolean): Cube[];
}

export class RAMI extends CubeScheme {

    private zLayers = ['asset', 'integration', 'communication', 'information', 'functional', 'business'];
    private xLayers = ['connected_world', 'enterprise', 'work_centers', 'station', 'control_device', 'field_device', 'product'];
    private yLayers = ['type_development', 'type_maintenance', 'instance_production', 'instance_maintenance'];

    constructor() {
        super();
    }

    private normalizeTag(tag: string): string {
        return tag.toLocaleLowerCase().replace(/\s|,|;/g, '_')
    }

    private fillWithEmptyCubes(cubes: Cube[]): Cube[] {
        const emptyDbCube: DBCube = {
            color: '#ffffff',
            contentTags: 'empty;empty;empty',
            items: '',
            label: 'Empty Cube',
            neighbours: '',
            uid: -1
        }
        const ramiCube: Cube[][][] = new Array<Cube[][]>(this.zLayers.length)
        for(let z = 0; z < this.zLayers.length; z++){
            const xArr = new Array<Cube[]>(this.xLayers.length);
            for(let x = 0; x < this.xLayers.length; x++){
                const yArr = new Array<Cube>(this.yLayers.length);
                for(let y = 0; y < this.yLayers.length; y++){
                    const emptyCube = new Cube(emptyDbCube);
                    emptyCube.setCoords(z, x, y);
                    yArr[y] = emptyCube;
                }
                xArr[x] = yArr;
            }
            ramiCube[z] = xArr;
        }
        cubes.forEach((cube: Cube) => {
            if (!ramiCube[cube.z][cube.x][cube.y] || ramiCube[cube.z][cube.x][cube.y].uid === -1) {
                ramiCube[cube.z][cube.x][cube.y] = cube;
            } else {
                console.error(`duplicate cube! at: ${cube.z}:${cube.x}:${cube.y}`);
                console.log(cube);
                console.log(ramiCube[cube.z][cube.x][cube.y]);
            }
        })
        return ramiCube.flat(2);
    }

    build(dbCube: DBCube[], fill: boolean): Cube[] {
        const cubes: Cube[] = dbCube.map((dbCube: DBCube) => {
            const cube: Cube = new Cube(dbCube);
            const tags: string[] = dbCube.contentTags.split(';');
            if (tags.length === 3) {
                const [z, x, y] = tags.map((tag: string, index: number): number => {
                    const normalizedTag = this.normalizeTag(tag);
                    let searchArr: string[] = [];
                    switch (index) {
                        case 0: {
                            searchArr = this.zLayers;
                            break;
                        }
                        case 1: {
                            searchArr = this.xLayers;
                            break;
                        }
                        case 2: {
                            searchArr = this.yLayers;
                            break;
                        }
                        default: {
                            console.error('too many tags');
                        }
                    }
                    return searchArr.findIndex((val: string) => val === normalizedTag);
                })
                cube.setCoords(z, x, y);
            }
            return cube;
        });
        return fill ? this.fillWithEmptyCubes(cubes) : cubes;
    }

}