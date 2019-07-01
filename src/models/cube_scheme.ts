import { DBCube } from "./interfaces";
import { Cube } from "./Cube";

export abstract class CubeScheme {
    abstract build(dbCube: DBCube[]): Cube[];
}

export class RAMI extends CubeScheme {

    private zLayers = ['asset', 'integration', 'communication', 'information', 'functional', 'business'];
    private xLayers = ['connected_world', 'enterprise', 'work_centers', 'station', 'control_device', 'field_device', 'product'];
    private yLayers = ['type_development', 'type_maintenance', 'instance_production', 'instance_maintenance'];

    constructor(){
        super();
    }

    private normalizeTag(tag: string): string {
        return tag.toLocaleLowerCase().replace(/\s|,|;/g, '_')
    }

    build (dbCube: DBCube[]): Cube[] {
        return dbCube.map((dbCube: DBCube) => {
            const cube: Cube = new Cube(dbCube);
            const tags: string[] = dbCube.contentTags.split(';');
            if(tags.length === 3) {
                const [z, x, y] = tags.map((tag:string, index: number):number => {
                    const normalizedTag = this.normalizeTag(tag);
                    let searchArr: string[] = [];
                    switch(index){
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
    }
    
}