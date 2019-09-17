import * as sqlite from 'sqlite3';
import { DBItem, DBCube, DBContent } from "./models/interfaces";
import { Item } from './models/Item';
import { Cube } from './models/Cube';
import * as path from 'path';
import { Content } from './models/Content';
import { RAMI, CubeScheme } from './models/cube_scheme';

const DB_FILE_NAME = 'sqlite.db';

const dbPath = path.join(__dirname, 'database', DB_FILE_NAME);

/**
 * Setup Database connection
 */
const db = new sqlite.Database(dbPath, sqlite.OPEN_READONLY, (err) => {
  if (err) {
    console.log('error in db');
    console.error(err.message);
  } else {
    console.log('Connected successfully to database');
  }
})

/**
 * Converts Data from Database to javascript objects in memory
 * @param dbItems Database resultset from Items table
 */
const convertItems = (dbItems: DBItem[]): Promise<Item[]> => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM `content`', (err: Error, res: DBContent[]) => {
      let content: Content[] = [];
      if (err) {
        console.error(err);
      } else {
        content = res.map((dbContent: DBContent): Content => {
          return new Content(dbContent);
        })
      }

      // convert Data to Objects
      const itemList: Item[] = dbItems.map((item: DBItem): Item => {
        return new Item(item);
      })

      // resolve id based connections to object references
      itemList.forEach((item: Item, i: number, list: Item[]): void => {
        item.getRefs(list);
        item.getContent(content);
      })
      resolve(itemList);
    })
  })
}

/**
 * Helper function used by all API Methods, to convert Database result of table Cubes to a Rami model
 * @param dbCubes Resultset from Database
 * @param fill Boolean whether or not the Model should be filled with empty Cubes
 */
const convertCubes = (dbCubes: DBCube[], fill: boolean = false): Promise<Cube[]> => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM item', async (err: Error, res: DBItem[]) => {
      if (err) {
        console.error(err.message);
        resolve([]);
      }
      try{
        const items = await convertItems(res);
  
        const rami: CubeScheme = new RAMI();
  
        // get rami model
        const cubes: Cube[] = rami.build(dbCubes, fill);
  
        // replace id based connections with object references
        cubes.forEach((cube: Cube, i: number, list: Cube[]): void => {
          cube.getItems(items);
          cube.getNeighbours(list);
        })

        // check consistency of model
        rami.checkConsistency(cubes);

        resolve(cubes);
      }catch(error){
        console.error(error);
        resolve([]);
      }
    })
  })
}

/**
 * Recursively navigates the graph data to find the shortest path between a given cube and a target cube.
 * Main function for the pathTo method in the API
 * @param cube Current cube from which point the search starts
 * @param fullArray Array of all Cubes that have been visited by the recursive function
 * @param targetId Cube to which the path should lead
 * @param pathArray Array of Cubes on the current path
 */
const findPathRecursive = (cube: Cube, fullArray: Cube[], targetId: number, pathArray: Cube[]): Cube[] => {

  // add current cube to list of visited cubes to avoid endless loops
  pathArray.push(cube);
  fullArray.push(cube);

  // recursive anchor
  if (cube.uid == targetId) return pathArray;

  // path in the direction of every neighbour that was not yet pathed to
  const paths: Cube[][] = [];
  cube.neighbours.forEach(neighbor => {
    if (fullArray.findIndex(cubeInQuestion => cubeInQuestion.uid === neighbor.uid) === -1) {
      paths.push(findPathRecursive(neighbor, fullArray, targetId, [...pathArray]));
    }
  })

  // select shortest path
  if (paths.length > 0) {
    let shortestPath = paths[0];
    paths.forEach(path => shortestPath = ((shortestPath.length > path.length && path.length > 0) || shortestPath.length === 0) ? path : shortestPath);
    return shortestPath;
  }
  return [];
}

/**
 * Recursively paths through the graph of items, to find all items that are connected to a given item. 
 * Items may be connection through several other items, they don't need to be directly connected. 
 * @param item Current item from which the search originates
 * @param array List of already visited items
 */
const findConnectedItemsRecursive = (item: Item, array: Item[]): Item[] => {

  // add item to list of visited items
  array.push(item);

  // continue to connected not yet visited items
  item.refs.forEach(ref => {
    if (array.findIndex(find => ref.itemUid === find.itemUid) === -1) {
      findConnectedItemsRecursive(ref, array);
    }
  })
  return array;
}

/**
 * Closes db connection in case of server shutdown
 */
process.addListener('beforeExit', () => {
  db.close();
})

/**
 * Exported object as Nodejs module, that exposes entrypoint functions that get executed on corresponding api calls to the server.
 */
export default {
  Query: {
    /**
     * Enty point function to get a list of all cubes. If id is given as argument only this specific cube will be returned.
     */
    cubes: (parent: any, args: any, context: any, info: any) => {
      return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM cube`, (error: Error, result: DBCube[]) => {
          if (error) {
            console.log('err')
            console.error(error.message);
            resolve([]);
          } else {
            convertCubes(result, true)
              .then(res => {
                if (args.id) {
                  const filtered = res.filter(cube => cube.uid == args.id);
                  if (filtered) resolve(filtered);
                }
                resolve(res);
              })
          }
        })
      })
    },
    /**
     * Entry point to a pathing function that returns the path between two cubes. Path in the sense of a path through graph data.
     * Returns all cubes on the shortest path between the selected cubes. 
     */
    pathTo: (parent: any, args: any, context: any, info: any) => {
      if (!args.startId || !args.targetId) return [];
      return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM cube`, (error: Error, result: DBCube[]) => {
          if (error) {
            console.log('err')
            console.error(error.message);
            resolve([]);
          } else {
            convertCubes(result)
              .then(res => {
                const start = res.filter(cube => cube.uid == args.startId);
                if (!start[0]) resolve([]);
                if (res.findIndex(cube => cube.uid == args.targetId) === -1) resolve([]);
                resolve(findPathRecursive(start[0], [], args.targetId, []));
              })
          }
        })
      })
    },
    /**
     * Entry point function that returns all cubes that contain an item that is connected to a selected item.
     */
    connectedOverItem: (parent: any, args: any, context: any, info: any) => {
      if (!args.itemId) return [];

      return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM item`, async (error: Error, result: DBItem[]) => {
          if (error) {
            console.log('err')
            console.error(error.message);
            resolve([]);
          } else {
            const res = await convertItems(result)
            const index = res.findIndex(item => item.itemUid == args.itemId);
            if (index === -1) resolve([]);
            const items = findConnectedItemsRecursive(res[index], []);
            db.all(`SELECT * FROM cube`, (error: Error, cubeResult: DBCube[]) => {
              if (error) {
                console.log('err')
                console.error(error.message);
                resolve([]);
              } else {
                convertCubes(cubeResult)
                  .then(cubeRes => {
                    const filteredCubes = cubeRes.filter(cube => {
                      cube.items = cube.items.filter(it => items.findIndex(filt => filt.itemUid === it.itemUid) !== -1);
                      return cube.items.length > 0;
                    })
                    resolve(filteredCubes);
                  })
              }
            })
          }
        })
      })
    }
  },
}