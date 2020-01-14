/**
 * Enter cube for the first time after choosing starting point;
 * roomDirections hold neighbouring cubes (ahead, right, left, behind, down, up)
 * appendToElement is html element to append canvas room to
 */
class Room {


    currentCube = null;
    mouse = null;
    cubes = null;
    semItems = [];
    keyboard = {};
    allItems = [];
    doors = [];
    scene = null;
    wallColor = null;
    camera = null;

    raycaster = null;
    gtlfADoor = null;
    aDoorScene = null;
    aDoor = null;
    gltfBDoor = null;
    bDoorScene = null;
    bDoor = null;
    gtlfLDoor = null;
    lDoorScene = null;
    lDoor = null;
    gtlfRDoor = null;
    rDoorScene = null;
    rDoor = null;
    gtlfDDoor = null;
    downDoor = null;
    downDoorScene = null;
    prevCamPos = null;
    gtlfUDoor = null;
    upDoor = null;
    upDoorScene = null;
    doorEnterMotionVal = 0.1;
    domEvents = null;
    gltfLoader = null;
    light = null;
    shelf = null;
    cubeRef = null;
    floor = null;
    wallMesh1 = null;
    wallMesh2 = null;
    wallMesh3 = null;
    wallMesh4 = null;
    renderer = null;
    topText = null
    appendToElement = null;
    doorProms = [];

    constructor(cubes, cube, roomDirections, appendToElement, cubeRef) {
        this.cubeRef = cubeRef
        this.cubes = cubes;
        this.appendToElement = appendToElement
        this.currentCube = cube;
        this.wallColor = cube.color;

        this.mouse = new THREE.Vector2();
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.raycaster = new THREE.Raycaster();
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.renderer.setClearColor("#e5e5e5");
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.domElement.className += " current-room";
        appendToElement.appendChild(this.renderer.domElement);

        this.domEvents = new THREEx.DomEvents(this.camera, this.renderer.domElement);

        this.gltfLoader = new THREE.GLTFLoader();
        this.light = new THREE.PointLight(0xFFFFFF, 1, 500);
        this.floor = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 20, 1, 1),
            new THREE.MeshBasicMaterial({
                color: this.wallColor
            })
        );
        this.wallMesh1 = new THREE.Mesh(
            new THREE.BoxGeometry(20, 9, 1),
            new THREE.MeshLambertMaterial({
                color: this.wallColor
            })
        );


        this.wallMesh2 = new THREE.Mesh(
            new THREE.BoxGeometry(20, 9, 1),
            new THREE.MeshLambertMaterial({
                color: this.wallColor
            })
        );

        this.wallMesh3 = new THREE.Mesh(
            new THREE.BoxGeometry(20, 9, 1),
            new THREE.MeshLambertMaterial({
                color: this.wallColor
            })
        );

        this.wallMesh4 = new THREE.Mesh(
            new THREE.BoxGeometry(20, 9, 1),
            new THREE.MeshLambertMaterial({
                color: this.wallColor
            })
        );

        this.topText = document.createElement("div");
        this.topText.style.zIndex = 2;
        this.topText.className = "toptext";
        document.querySelector('body').appendChild(this.topText);
        this.light.position.set(5, 5, 5);


        this.floor.material.side = THREE.DoubleSide;

        this.floor.rotation.x += Math.PI / 2;




        this.wallMesh1.rotation.y += Math.PI / 2;
        this.wallMesh1.position.x = -10;
        this.wallMesh1.position.y = 3.5;

        this.wallMesh2.rotation.y += Math.PI / 2;
        this.wallMesh2.position.x = 10;
        this.wallMesh2.position.y = 3.5;

        this.wallMesh3.position.x = 0;
        this.wallMesh3.position.y = 3.5;
        this.wallMesh3.position.z = -9.5;

        this.wallMesh4.position.x = 0;
        this.wallMesh4.position.y = 3.5;
        this.wallMesh4.position.z = 9.5;

        //Load shelf by gltf asynchronously
        this.gltfLoader.load('./assets/simple_shelf/scene.gltf', (gltf) => {


            this.shelf = gltf.scene.children[0];
            this.scene.add(this.shelf);

            this.shelf.scale.x = 2.5;
            this.shelf.scale.y = 3.5;
            this.shelf.scale.z = 2.5;
            //-----> X
            this.shelf.position.x = -3.3;

            this.shelf.position.y = 1.5;
            this.shelf.position.z = -5.9;

            this.allItems.push(this.shelf);
        });
        //Initialize doors and up/down planks
        for (let i = 0; i < 4; i++) this.doorProms.push(this.drawDoor());

        this.doorProms.push(this.drawUpDownDoor());
        this.doorProms.push(this.drawUpDownDoor());

        var scope = this;

        /*On loading finish, place doors and up down planks
         * and add respesctive listeners
         */

        Promise.all(this.doorProms).then((res) => {
            this.gtlfADoor = res[0];
            this.aDoorScene = this.gtlfADoor.scene;
            this.aDoor = this.aDoorScene.children[0];

            this.domEvents.addEventListener(this.aDoor, 'click', event => {
                this.currentCube = this.aDoor.enteringCube;
                this.cubeRef.methods.updateMap(this.aDoor.enteringCube);
                this.navigateToRoom(this.aDoor.enteringCube, this.cubeRef.methods.getDirections(this.aDoor.enteringCube));
            });
            this.scene.add(this.aDoor);
            this.aDoor.scale.x = 0.03;
            this.aDoor.scale.y = 0.03;
            this.aDoor.scale.z = 0.03;
            this.aDoor.position.y = 1;
            this.aDoor.position.z = -7.4;

            this.gltfRDoor = res[1];
            this.rDoorScene = this.gltfRDoor.scene;
            this.rDoor = this.rDoorScene.children[0];

            this.domEvents.addEventListener(this.rDoor, 'click', event => {
                this.currentCube = this.rDoor.enteringCube;
                this.cubeRef.methods.updateMap(this.rDoor.enteringCube);
                this.navigateToRoom(this.rDoor.enteringCube, this.cubeRef.methods.getDirections(this.rDoor.enteringCube));
            });

            this.scene.add(this.rDoor);
            this.rDoor.scale.x = 0.03;
            this.rDoor.scale.y = 0.03;
            this.rDoor.scale.z = 0.03;
            //-----> X
            this.rDoor.rotation.z = 4.7;

            this.rDoor.position.y = 1;
            this.rDoor.position.x = 7.7;
            this.rDoor.position.z = 0;

            this.gltfBDoor = res[2];
            this.bDoorScene = this.gltfBDoor.scene;
            this.bDoor = this.bDoorScene.children[0];

            this.domEvents.addEventListener(this.bDoor, 'click', event => {
                this.currentCube = this.bDoor.enteringCube;
                this.cubeRef.methods.updateMap(this.bDoor.enteringCube);
                this.navigateToRoom(this.bDoor.enteringCube, this.cubeRef.methods.getDirections(this.bDoor.enteringCube));
            });

            this.scene.add(this.bDoor);

            this.bDoor.scale.x = 0.03;
            this.bDoor.scale.y = 0.03;
            this.bDoor.scale.z = 0.03;

            this.bDoor.position.y = 1;
            this.bDoor.position.z = 7.4;

            this.gltfLDoor = res[3];
            this.lDoorScene = this.gltfLDoor.scene;
            this.lDoor = this.lDoorScene.children[0];

            this.domEvents.addEventListener(this.lDoor, 'click', event => {
                this.currentCube = this.lDoor.enteringCube;
                this.cubeRef.methods.updateMap(this.lDoor.enteringCube);
                this.navigateToRoom(this.lDoor.enteringCube, this.cubeRef.methods.getDirections(this.lDoor.enteringCube));

            });
            this.scene.add(this.lDoor);
            this.lDoor.scale.x = 0.03;
            this.lDoor.scale.y = 0.03;
            this.lDoor.scale.z = 0.03;
            this.lDoor.rotation.z = 4.7;

            this.lDoor.position.x = -7.7;
            this.lDoor.position.y = 1;
            this.lDoor.position.z = 0;

            this.gltfDDoor = res[4];
            this.downDoorScene = this.gltfDDoor.scene;
            this.downDoor = this.downDoorScene.children[0];

            this.downDoor.position.y = 0.05;
            this.downDoor.scale.x = 0.05;
            this.downDoor.scale.y = 0.05;
            this.downDoor.scale.z = 0.05;

            this.downDoor.rotation.y = 3.1419;

            this.domEvents.addEventListener(this.downDoor, 'click', event => {
                this.currentCube = this.downDoor.enteringCube;
                this.cubeRef.methods.updateMap(this.downDoor.enteringCube);
                this.navigateToRoom(this.downDoor.enteringCube, this.cubeRef.methods.getDirections(this.downDoor.enteringCube));
            });
            this.scene.add(this.downDoor);

            this.gltfDDoor = res[5];
            this.upDoorScene = this.gltfDDoor.scene;
            this.upDoor = this.upDoorScene.children[0];

            this.upDoor.position.y = 10;
            this.upDoor.scale.x = 0.05;
            this.upDoor.scale.y = 0.05;
            this.upDoor.scale.z = 0.05;

            this.upDoor.rotation.y = 0;

            this.domEvents.addEventListener(this.upDoor, 'click', event => {
                this.currentCube = this.upDoor.enteringCube;
                updateMap(this.upDoor.enteringCube);
                this.navigateToRoom(this.upDoor.enteringCube, this.cubeRef.methods.getDirections(this.upDoor.enteringCube));
            });
            this.scene.add(this.upDoor);

            //Show doors according to cube neighbours 
            this.setDoorOptions(roomDirections);

            // Initialize books of room
            this.initBooks(cube.items)

            //Add objects to canvas scene
            this.scene.add(this.floor);
            this.scene.add(this.light);
            this.scene.add(this.wallMesh1);
            this.scene.add(this.wallMesh2);
            this.scene.add(this.wallMesh3);
            this.scene.add(this.wallMesh4);

            //Initialize starting position of user in room
            this.camera.position.set(0, 5, 0);
            this.camera.lookAt(new THREE.Vector3(0, 5, 0));

            //event listeners
            window.addEventListener('keyup', function(e) {
                scope.keyUp(e)
            });
            window.addEventListener('mousemove', function(e) {
                scope.onMouseMove(e)
            });
            window.addEventListener('resize', function(e) {
                scope.onResize(e)
            });

        });

        this.animate(scope);
    }




    /** Required for rendering process 
     *
     */
    animate(scope) {

        requestAnimationFrame(() => {
            return scope.animate(scope);
        });
        this.renderer.render(this.scene, this.camera);
    }


    /**
     * Cleanup function; On changing room, free resources (material)
     * of objects
     */
    cleanMaterial(material) {
        material.dispose()
        for (const key of Object.keys(material)) {
            const value = material[key]
            if (value && typeof value === 'object' && 'minFilter' in value) {
                value.dispose()
            }
        }
    }

    /**
     * On Mousemove; use raycaster to determine if user hovers over item
     * and show name of item accordingly
     */
    onMouseMove(event) {
        let rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / (rect.width - rect.left)) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        let intersects = this.raycaster.intersectObjects(this.scene.children, true);
        for (let i = 0; i < intersects.length; i++) {
            if (intersects[i].object.hoverText !== undefined) {
                this.topText.innerHTML = intersects[i].object.hoverText;
            }

        }
    }

    /**
     * Initialize books of this room, position them
     * and add listeners for showing their information
     * and list relations and context on click
     */
    initBooks(items) {
        let bookItems = [];
        items.forEach(item => {
            if (item.type == "book")
                bookItems.push(item);
        });
        const bookPosX = -2.8;
        let bookProms = [];
        for (let i = 0; i < bookItems.length; i++) {
            bookProms.push(this.drawBook(bookItems[i]));
        }
        Promise.all(bookProms).then(res => {
            res.forEach((resObj, index) => {
                let bookObj = resObj.gltf;
                let bookInfo = resObj.book;
                bookObj.scene.traverse(child => {
                    if (child.isMesh)
                        child.hoverText = bookInfo.label;
                });
                let book = bookObj.scene.children[0];
                book.objLabel = bookInfo.label;
                book.objContent = bookInfo.content;
                let bookRelations = [];
                bookInfo.refs.forEach(refObj => {
                    bookRelations.push(refObj.itemUid);
                });
                book.objRelations = bookRelations;
                this.scene.add(book);

                book.scale.x = 4;
                book.scale.y = 4;
                book.scale.z = 4;
                book.rotation.x = 15.7;
                book.rotation.y = -2;
                book.position.y = 5.35;
                book.position.x = bookPosX - index * 0.2;
                book.position.z = -6;
                this.domEvents.addEventListener(book, 'click', event => {
                    this.showRelations(book);
                });
                this.semItems.push(book);
            })
        })
    }

    /**
     * Set doors visible/invisible according to 
     * available neighbours of current cube
     */
    setDoorOptions(roomDirections) {
        if (!('ahead' in roomDirections)) {
            this.hideObject(this.aDoor);
        } else {
            this.aDoor.traverse(child => {
                if (child.isMesh) {
                    child.hoverText = roomDirections["ahead"].label;
                }
            });
            this.aDoor.enteringCube = roomDirections["ahead"]
            this.showObject(this.aDoor);
        }

        if (!('right' in roomDirections)) {
            this.hideObject(this.rDoor);
        } else {
            this.rDoor.traverse(child => {
                if (child.isMesh)
                    child.hoverText = roomDirections["right"].label;
            });
            this.rDoor.enteringCube = roomDirections["right"]

            this.showObject(this.rDoor);

        }



        if (!('behind' in roomDirections)) {
            this.hideObject(this.bDoor);
        } else {
            this.bDoor.traverse(child => {
                if (child.isMesh)
                    child.hoverText = roomDirections["behind"].label;
            });
            this.showObject(this.bDoor);
            this.bDoor.enteringCube = roomDirections["behind"]
        }




        if (!('left' in roomDirections)) {
            this.hideObject(this.lDoor);
        } else {
            this.lDoor.traverse(child => {
                if (child.isMesh)
                    child.hoverText = roomDirections["left"].label;
            });
            this.lDoor.enteringCube = roomDirections["left"];

            this.showObject(this.lDoor);

        }

        if (!('down' in roomDirections)) {
            this.hideObject(this.downDoor);
        } else {
            this.downDoor.traverse(child => {
                if (child.isMesh)
                    child.hoverText = roomDirections["down"].label;
            });
            this.downDoor.enteringCube = roomDirections["down"];

            this.showObject(this.downDoor);
        }

        if (!('up' in roomDirections)) {
            this.hideObject(this.upDoor);
        } else {
            this.upDoor.traverse(child => {
                if (child.isMesh)
                    child.hoverText = roomDirections["up"].label;
            });
            this.upDoor.enteringCube = roomDirections["up"];

            this.showObject(this.upDoor);
        }



    }

    /**
     * Keyboard constants
     */
    keyboard = {
        LEFT: 37,
        RIGHT: 39,
        UP: 38,
        DOWN: 40
    };

    /**
     * Note integer value of key pressed down
     */
    keyDown(event) {
        keyboard[event.keyCode] = true;
    }

    /**
     * Reacts to navigation input on arrow keys by user;
     * Only allows navigation according to navigator object in map.js
     */
    keyUp(event) {
        if ((map.navigator.val == 4 && event.keyCode != this.keyboard.DOWN) || (map.navigator.val == 5 && event.keyCode != this.keyboard.UP)) {
            //Do nothing, don't react to anything other than "down" navigation after "up" and vice versa
        } else {
            let doorPos = null;
            switch (event.keyCode) { // left arrow key
                case this.keyboard.LEFT:
                    map.navigator.left();
                    doorPos = this.translateNavToObject(map.navigator.val).position;
                    this.camera.lookAt(doorPos.x, 5, doorPos.z);

                    break;
                case this.keyboard.RIGHT: // right arrow key
                    map.navigator.right();
                    doorPos = this.translateNavToObject(map.navigator.val).position;
                    this.camera.lookAt(doorPos.x, 5, doorPos.z);
                    break;

                case this.keyboard.UP: // up arrow key

                    map.navigator.up();
                    doorPos = this.translateNavToObject(map.navigator.val).position;
                    if (map.navigator.val <= 3)
                        this.camera.lookAt(doorPos.x, 5, doorPos.z);
                    else
                        this.camera.lookAt(0, 10, 0);
                    break;
                case this.keyboard.DOWN: // down arrow key
                    map.navigator.down();
                    doorPos = this.translateNavToObject(map.navigator.val).position;
                    if (map.navigator.val <= 3)
                        this.camera.lookAt(doorPos.x, 5, doorPos.z);
                    else
                        this.camera.lookAt(0, 0, 0);
                    break;
            }
        }
    }

    /**
     * Convert value of navigator to respective door that should
     * be viewed at
     */
    translateNavToObject(navValue) {
        switch (navValue) {
            case 0:
                return this.aDoor;
                break;
            case 1:
                return this.rDoor;
                break;
            case 2:
                return this.bDoor;
                break;
            case 3:
                return this.lDoor;
                break;
            case 4:
                return this.upDoor;
                break;
            case 5:
                return this.downDoor;
                break;
        }
    }


    /**
     * Load book object asynchronously
     */
    async drawBook(book) {
        return new Promise((resolve, project) => {
            this.gltfLoader.load('./assets/book/scene.gltf', (gltf) => {
                resolve({
                    gltf: gltf,
                    book: book
                });
            });
        });
    }

    /**
     * Load door object asynchronously
     */
    async drawDoor() {
        return new Promise((resolve, project) => {
            this.gltfLoader.load('./assets/simple_door/scene.gltf', (gltf) => {
                resolve(gltf);
            });
        })
    }

    /**
     * Load up/down plank object asynchronously
     */
    async drawUpDownDoor() {
        return new Promise((resolve, project) => {
            this.gltfLoader.load('./assets/simple_plank/scene.gltf', (gltf) => {
                resolve(gltf);
            });
        })
    }

    /**
     * Cleanup function for objects of room
     */
    traverseAndDispose(toTraverse) {
        toTraverse.forEach((el) => {
            if (el.isMesh) {
                el.geometry.dispose();
                if (el.material.isMaterial) {
                    this.cleanMaterial(el.material)
                } else {
                    // an array of materials
                    for (const material of el.material) cleanMaterial(material)
                }
            } else {
                this.traverseAndDispose(el.children);

            }
        });
    }

    /**
     * Resize function for screen responsiveness of room
     */
    onResize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    /**
     * Cleanup functions for semantic items
     */
    cleanup() {
        for (let i = 0; i < this.semItems.length; i++) {
            this.scene.remove(this.semItems[i]);
        }
        this.traverseAndDispose(this.semItems);
        this.semItems.length = 0;
    }

    /**
     * Show relations of object; on click on object
     * Rerenders map accordingly to item context and
     * cubes of related items
     */
    showRelations(object) {

        if (!document.getElementById('relationContainer')) {
            let relContainer = document.createElement('div');
            relContainer.id = 'relationContainer';
            relContainer.style.height = document.querySelector('.current-room').height + "px";
            relContainer.style.width = document.querySelector('.current-room').width / 6.0 + "px";
            this.appendToElement.appendChild(relContainer);
        } else {
            document.getElementById('relationContainer').style.display = "";
        }
        //empty container
        let relContainer = document.getElementById("relationContainer");
        while (relContainer.firstChild) {
            relContainer.removeChild(relContainer.firstChild);
        }
        let relatedCubeUids = [];
        let scaffoldingCubeCords = [];



        let closeRelContainer = createCloseContextContainer();

        closeRelContainer.addEventListener('click', () => {
            relationContainer.style.display = "none";
            this.cubeRef.methods.updateMap(this.currentCube, [], null);
        });
        relContainer.appendChild(closeRelContainer);
        let objLabel = createObjLabel('#', "Objekt:" + object.objLabel, 'obj-item-link')
        objLabel.addEventListener('click', () => {
            this.cubeRef.methods.showModal(object.objContent);
        });
        relContainer.appendChild(objLabel);
        object.objRelations.forEach(refId => {
            relatedCubeUids.push(items[refId].cubeUid);
            let refCube = this.cubeRef.methods.getBlockOnUid(items[refId].cubeUid);
            let curScaffoldingCubeCords = [];
            curScaffoldingCubeCords.push(...this.getScaffoldingBlocksCords(
                new D3Point(
                    this.currentCube.cords.x, this.currentCube.cords.y, this.currentCube.cords.z
                ),
                new D3Point(
                    refCube.cords.x, refCube.cords.y, refCube.cords.z
                )
            ));
            scaffoldingCubeCords.push(...curScaffoldingCubeCords);
            let relObjContainer = document.createElement('div');
            relObjContainer.className = "relation-object-container";
            let relObjLabel = createObjLabel('#', items[refId].label, "item-link");

            let idOfRefBlockParent = null;
            this.cubes.forEach(b => {
                if (b.items)
                    b.items.forEach(item => {
                        if (item.type == "book" && item.itemUid == refId) {
                            idOfRefBlockParent = item.cubeUid;
                        }
                    });
            });

            relObjLabel.addEventListener('click', (e) => {
                if ($('.relation-object-container.active').length) {
                    if ($($('.relation-object-container.active')[0]).is($(e.target.parentNode))) {
                        this.cubeRef.methods.updateMap(this.currentCube, relatedCubeUids, Array.from(new Set(scaffoldingCubeCords)));
                        $('.relation-object-container.active').removeClass('active');
                    } else {
                        $('.relation-object-container.active').removeClass('active');
                        e.target.parentNode.classList.add('active');
                        this.cubeRef.methods.updateMap(this.currentCube, [idOfRefBlockParent], curScaffoldingCubeCords);
                    }
                } else {
                    e.target.parentNode.classList.add('active');
                    this.cubeRef.methods.updateMap(this.currentCube, [idOfRefBlockParent], curScaffoldingCubeCords);
                }
            });
            relObjContainer.appendChild(relObjLabel);

            relContainer.appendChild(relObjContainer);


        });
        this.cubeRef.methods.updateMap(this.currentCube, relatedCubeUids, Array.from(new Set(scaffoldingCubeCords)));
    }

    /**
     * Determine coordinates of path between current cube and the 
     * cube holding specific item the context should be displayed for
     */
    getScaffoldingBlocksCords(curCords, itemCords) {
        let scaffoldingBlocksCords = [];
        let currentBlockCords = this.cubeRef.methods.iterationCopy(curCords);
        if (curCords.x != itemCords.x) {
            while (curCords.x > itemCords.x) {
                curCords.x--;
                scaffoldingBlocksCords.push(new D3Point(curCords.x, curCords.y, curCords.z));
            }
            while (curCords.x < itemCords.x) {
                curCords.x++;
                scaffoldingBlocksCords.push(new D3Point(curCords.x, curCords.y, curCords.z));
            }
        }
        if (curCords.y != itemCords.y) {
            while (curCords.y > itemCords.y) {
                curCords.y--;

                scaffoldingBlocksCords.push(new D3Point(curCords.x, curCords.y, curCords.z));
            }
            while (curCords.y < itemCords.y) {
                curCords.y++;
                scaffoldingBlocksCords.push(new D3Point(curCords.x, curCords.y, curCords.z));
            }
        }
        if (curCords.z != itemCords.z) {

            while (curCords.z > itemCords.z) {
                curCords.z--;
                scaffoldingBlocksCords.push(new D3Point(curCords.x, curCords.y, curCords.z));
            }
            while (curCords.z < itemCords.z) {
                curCords.z++;
                scaffoldingBlocksCords.push(new D3Point(curCords.x, curCords.y, curCords.z));
            }
        }
        return scaffoldingBlocksCords;
    }

    /**
     * Hide object in scene; don't display it (e.g. door that leads to no neighbour)
     */
    hideObject(obj) {
        obj.traverse(child => {
            if (child instanceof THREE.Mesh)
                child.visible = false;
        });
    }

    /**
     * Show object in scene
     */
    showObject(obj) {
        obj.traverse(child => {
            if (child instanceof THREE.Mesh)
                child.visible = true;
        });
    }

    /**
     * Set colors of walls and floor according to cube color (color is defined in configuration of cube on server)
     */
    setWallAndFloorColors(hexColor) {

        this.wallMesh1.material.color.setHex(hexColor);
        this.wallMesh2.material.color.setHex(hexColor);
        this.wallMesh3.material.color.setHex(hexColor);
        this.wallMesh4.material.color.setHex(hexColor);
        this.floor.material.color.setHex(hexColor);


    }

    /**
     * Change room; Upon clickin on door leading to another room,
     * cleanup the scene and initialize necessary objects to visualize
     * content of entered room; Interval timer for "moving towards door" animation
     */
    navigateToRoom(cube, roomDirections, byMapEvent = false) {
        setTimeout(() => {
            clearInterval(moveTimer);
            this.cleanup();
            this.setDoorOptions(roomDirections);
            this.initBooks(cube.items);
            this.setWallAndFloorColors(cube.color.replace("#", "0x"));

            let element = document.getElementById('relationContainer');
            if (typeof(element) != 'undefined' && element != null)
                document.getElementById('relationContainer').style.display = "none";
            this.currentCube = cube;
            this.camera.position.set(0, 5, 0);


        }, 1000);
        var moveTimer = setInterval(() => {
            let sootheDirectionVal = byMapEvent ? 4 : map.navigator.val
            switch (sootheDirectionVal) {
                case 0:
                    this.camera.position.z -= this.doorEnterMotionVal;
                    break;
                case 1:
                    this.camera.position.x += this.doorEnterMotionVal;
                    break;
                case 2:
                    this.camera.position.z += this.doorEnterMotionVal;
                    break;
                case 3:
                    this.camera.position.x -= this.doorEnterMotionVal;
                    break;
                case 4:
                    this.camera.position.y += this.doorEnterMotionVal;
                    break;
                case 5:
                    this.camera.position.y -= this.doorEnterMotionVal;
                    break;
            }
        }, 70);
    }
}