import { DBCube } from "./interfaces";
import { Cube } from "./Cube";

/**
 * Abstract Class from which different Model schemes may inherit
 */
export abstract class CubeScheme {
    abstract build(dbCube: DBCube[], fill: boolean): Cube[];
    abstract checkConsistency(cubes: Cube[]): void;
}

/**
 * Implementation of CubeScheme specific for the RAMI Model.
 */
export class RAMI extends CubeScheme {

    private zLayers = ['asset', 'integration', 'communication', 'information', 'functional', 'business'];
    private xLayers = ['connected_world', 'enterprise', 'work_centers', 'station', 'control_device', 'field_device', 'product'];
    private yLayers = ['type_development', 'type_maintenance', 'instance_production', 'instance_maintenance'];

    constructor() {
        super();
    }

    /**
     * Normalizes the content tag string to be more like to match the layer strings assigned to the RAMI model.
     * @param tag Tag string from Cube object
     */
    private normalizeTag(tag: string): string {
        return tag.toLocaleLowerCase().replace(/\s|,|;/g, '_')
    }

    /**
     * Checks whether or not the Rami Model is consistent.
     * All connections between Cubes should be mutual.
     * Connected Cubes should be neighbours in the Grid.
     */
    checkConsistency(cubes: Cube[]): void{
        const realCubes = cubes.filter((filtCube: Cube): boolean => filtCube.uid !== -1);
        realCubes.forEach((cube: Cube): void => {
            if(!cube.checkMyNeighbours()){
                throw new Error(`Cube ${cube.uid} does not share mutual relations with its neighbours`);
            }
            cube.neighbours.forEach((neighbourCube: Cube): void => {
                if(cube.x === neighbourCube.x && cube.y === neighbourCube.y){
                    // z offset neighbours
                    const smallerZ = cube.z > neighbourCube.z ? neighbourCube.z : cube.z;
                    const biggerZ = cube.z > neighbourCube.z ? cube.z : neighbourCube.z;
                    if(biggerZ - smallerZ > 1){
                        // there is a gap between the connected Cubes. check whether there is really no other cube in between
                        const index = realCubes.findIndex((findCube: Cube): boolean => findCube.x === cube.x && findCube.y === cube.y && findCube.z > smallerZ && findCube.z < biggerZ && findCube.uid !== -1);
                        if(index !== -1){
                            // there is a cube between
                            throw new Error(`Cube ${cube.uid} and Cube ${neighbourCube.uid} are not actual neighbours because Cube ${cubes[index].uid} is in between`);
                        }
                    }
                } else if(cube.x === neighbourCube.x && cube.z === neighbourCube.z){
                    // y offset neighbours
                    const smallerY = cube.y > neighbourCube.y ? neighbourCube.y : cube.y;
                    const biggerY = cube.y > neighbourCube.y ? cube.y : neighbourCube.y;
                    if(biggerY - smallerY > 1) {
                        // there is a gap between the connected Cubes. check whether there is really no other cube in between
                        const index = realCubes.findIndex((findCube: Cube): boolean => findCube.x === cube.x && findCube.z === cube.z && findCube.y > smallerY && findCube.y < biggerY && findCube.uid !== -1);
                        if(index !== -1){
                            // there is a cube between
                            throw new Error(`Cube ${cube.uid} and Cube ${neighbourCube.uid} are not actual neighbours because Cube ${cubes[index].uid} is in between`);
                        }
                    }
                } else if(cube.z === neighbourCube.z && cube.y === neighbourCube.y) {
                    // x offset neighbours
                    const smallerX = cube.x > neighbourCube.x ? neighbourCube.x : cube.x;
                    const biggerX = cube.x > neighbourCube.x ? cube.x : neighbourCube.x;
                    if(biggerX - smallerX > 1) {
                        // there is a gap between the connected Cubes. check whether there is really no other cube in between
                        const index = realCubes.findIndex((findCube: Cube): boolean => findCube.y === cube.y && findCube.z === cube.z && findCube.x > smallerX && findCube.x < biggerX && findCube.uid !== -1);
                        if(index !== -1){
                            // there is a cube between
                            throw new Error(`Cube ${cube.uid} and Cube ${neighbourCube.uid} are not actual neighbours because Cube ${cubes[index].uid} is in between`);
                        }
                    }
                } else {
                    // Connected Cubes are not neighbours
                    throw new Error(`Cube ${cube.uid} is not an actual neighbour to Cube ${neighbourCube.uid}`);
                }
            })
        })
    }

    /**
     * Fills up the entire RAMI Model with empty Cubes where no actual content Cubes are placed
     * @param cubes List of Actual Cubes.
     */
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

    /**
     * Build Method that creates the full RAMI Model out of the Database result.
     * @param dbCube Resultset from Cube Table in database.
     * @param fill Boolean whether or not the Model should be filled up with empty cubes
     */
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