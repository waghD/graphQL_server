import { DBCube } from "./interfaces";
import { Cube } from "./Cube";

interface CubeScheme {
    build: (dbCube: DBCube[]) => Cube[]
}

export class RAMI implements CubeScheme {

    build (dbCube: DBCube[]): Cube[] {
        return dbCube.map((dbCube: DBCube) => new Cube(dbCube));
    }
    
}