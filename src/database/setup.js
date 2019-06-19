const fs = require('fs');
const sqlite = require('sqlite3');
const path = require('path');

const DB_FILE_NAME = 'sqlite.db';

fs.unlinkSync(path.join(__dirname, DB_FILE_NAME));

const db = new sqlite.Database(`./${DB_FILE_NAME}`, async (err) => {
    if (err) {
        console.log('error in creation');
        console.error(err.message);
    } else {
        console.log('Connected successfully to database');
        const cubeFile = fs.readFileSync(path.join(__dirname, 'cube.json'), {
            encoding: 'utf-8'
        })
        const itemFile = fs.readFileSync(path.join(__dirname, 'items.json'), {
            encoding: 'utf-8'
        })

        const cubes = JSON.parse(cubeFile);
        const items = JSON.parse(itemFile);

        const promArr = [
            new Promise((res, rej) => {
                db.run('CREATE TABLE cube (uid integer PRIMARY KEY, label text, color text, x integer, y integer, z integer, items text, neighbours text)', (err) => {
                    if(err) {
                        rej(err);
                    } else {
                        console.log('Created Table cube');
                        res();
                    }
                });
            }),
            new Promise((res, rej) => {
                db.run('CREATE TABLE item (itemUid integer PRIMARY KEY, type text, label text, content text, refs text)', (err) => {
                    if(err) {
                        rej(err);
                    } else {
                        console.log('Created Table item');
                        res();
                    }
                });
            })
        ]

        await Promise.all(promArr);

        cubes.forEach((cube) => {
            db.run(`INSERT INTO cube (uid, label, color, x, y, z, items, neighbours) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [cube.uid, cube.label, cube.color, cube.x, cube.y, cube.z, cube.items.join(';'), cube.neighbours.join(';')], (err) => {
                    if (err) {
                        console.log('error in cube insert')
                        console.error(err.message);
                    } else {
                        console.log('Cube Insert successfull');
                    }
                })
        })

        items.forEach((item) => {
            db.run('INSERT INTO item (itemUid, type, label, content, refs) VALUES (?, ?, ?, ?, ?)',
                [item.itemUid, item.type, item.label, item.content, item.refs.join(';')], (err) => {
                    if (err) {
                        console.log('error in item insert')
                        console.error(err.message);
                    } else {
                        console.log('Item Insert successfull');
                    }
                })
        })
    }
})

process.addListener('beforeExit', () => {
    if(db.open){
        db.close();
    }
})