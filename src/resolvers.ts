import * as sqlite from 'sqlite3';
import { DBItem, DBCube, DBContent } from "./models/interfaces";
import { Item } from './models/Item';
import { Cube } from './models/Cube';
import * as path from 'path';
import { Content } from './models/Content';
import { RAMI } from './models/cube_scheme';

const DB_FILE_NAME = 'sqlite.db';

const dbPath = path.join(__dirname, 'database', DB_FILE_NAME);

const db = new sqlite.Database(dbPath, sqlite.OPEN_READONLY, (err) => {
  if (err) {
    console.log('error in db');
    console.error(err.message);
  } else {
    console.log('Connected successfully to database');
  }
})

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

      const itemList: Item[] = dbItems.map((item: DBItem): Item => {
        return new Item(item);
      })
      itemList.forEach((item: Item, i: number, list: Item[]): void => {
        item.getRefs(list);
        item.getContent(content);
      })
      resolve(itemList);
    })
  })
}

const convertCubes = (dbCubes: DBCube[], fill: boolean = false): Promise<Cube[]> => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM item', async (err: Error, res: DBItem[]) => {
      if (err) {
        console.error(err.message);
        resolve([]);
      }

      const items = await convertItems(res);

      const cubes: Cube[] = new RAMI().build(dbCubes, fill);

      cubes.forEach((cube: Cube, i: number, list: Cube[]): void => {
        cube.getItems(items);
        cube.getNeighbours(list);
      })
      resolve(cubes);
    })
  })
}

const findPathRecursive = (cube: Cube, fullArray: Cube[], targetId: number, pathArray: Cube[]): Cube[] => {
  pathArray.push(cube);
  fullArray.push(cube);
  if (cube.uid == targetId) return pathArray;
  const paths: Cube[][] = [];
  cube.neighbours.forEach(neighbor => {
    if (fullArray.findIndex(cubeInQuestion => cubeInQuestion.uid === neighbor.uid) === -1) {
      paths.push(findPathRecursive(neighbor, fullArray, targetId, [...pathArray]));
    }
  })
  if (paths.length > 0) {
    let shortestPath = paths[0];
    paths.forEach(path => shortestPath = ((shortestPath.length > path.length && path.length > 0) || shortestPath.length === 0) ? path : shortestPath);
    return shortestPath;
  }
  return [];
}

const findConnectedItemsRecursive = (item: Item, array: Item[]): Item[] => {
  array.push(item);
  item.refs.forEach(ref => {
    if (array.findIndex(find => ref.itemUid === find.itemUid) === -1) {
      findConnectedItemsRecursive(ref, array);
    }
  })
  return array;
}

process.addListener('beforeExit', () => {
  db.close();
})

export default {
  Query: {
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