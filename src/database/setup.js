const fs = require('fs');
const sqlite = require('sqlite3');
const path = require('path');

const DB_FILE_NAME = 'sqlite.db';

const dbPath = path.join(__dirname, DB_FILE_NAME);

if(fs.existsSync(dbPath)){
    fs.unlinkSync(dbPath);
}

const db = new sqlite.Database(dbPath, async (err) => {
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
        const contentFile = fs.readFileSync(path.join(__dirname, 'content.json'), {
            encoding: 'utf-8'
        })

        const cubes = JSON.parse(cubeFile);
        const items = JSON.parse(itemFile);
        const content = JSON.parse(contentFile);

        const promArr = [
            new Promise((res, rej) => {
                db.run('CREATE TABLE cube (uid integer PRIMARY KEY, label text, color text, contentTags text, items text, neighbours text)', (err) => {
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
            }),
            new Promise((res, rej) => {
                db.run('CREATE TABLE content (contentId integer PRIMARY KEY, label text, contentType text, text text, src text)', (err) => {
                    if(err) {
                        rej(err);
                    } else {
                        console.log('Created Table content');
                        res();
                    }
                });
            })
        ]

        await Promise.all(promArr);

        cubes.forEach((cube) => {
            db.run(`INSERT INTO cube (uid, label, color, contentTags, items, neighbours) VALUES (?, ?, ?, ?, ?, ?)`,
                [cube.uid, cube.label, cube.color, cube.contentTags.join(';'), cube.items.join(';'), cube.neighbours.join(';')], (err) => {
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
                [item.itemUid, item.type, item.label, item.content.join(';'), item.refs.join(';')], (err) => {
                    if (err) {
                        console.log('error in item insert')
                        console.error(err.message);
                    } else {
                        console.log('Item Insert successfull');
                    }
                })
        })

        content.forEach((content) => {
            db.run('INSERT INTO content (contentId, label, contentType, text, src) VALUES (?, ?, ?, ?, ?)',
                [content.id, content.label, content.contentType, content.text, content.src || ''], (err) => {
                    if (err) {
                        console.log('error in content insert')
                        console.error(err.message);
                    } else {
                        console.log('Content Insert successfull');
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