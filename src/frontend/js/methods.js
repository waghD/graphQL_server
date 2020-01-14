class Methods {
    /**
     * Returns promise to query database for the cube configuration
     * according to input url and port on start screen of application
     */
    async loadCubeConfiguration(url, port) {
        return new Promise((resolve, reject) => {

            fetch(url + ":" + port, {

                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        query: `{  cubes {
                              uid
                              label
                              color
                              x
                              y
                              z
                              items {
                                itemUid
                                type
                                label
                                content {
                                  label
                                  contentType
                                  text
                                  src
                                }
                                refs {
                                  itemUid
                                }
                              } 
                            }}`
                    })
                }).then(response => response.json())
                .then(data => {
                    resolve(data);
                })
                .catch(err => {
                    reject(err);
                })
        });
    }
    /**
     * Initialize cube configuration after loading it;
     * Determines number of layers, number of levels, cube length (for drawing),
     * initializes map, generates transparent (non-clickable) cubes and initializes
     * the layer selector
     */
    async initializeCube(cubeConf, ref) {
        let cube = cubeConf;
        let maxCubeVals = this.getMaxCords(cube);
        maxX = maxCubeVals.x;
        maxY = maxCubeVals.y;
        maxZ = maxCubeVals.z;
        cubeLength = window.innerWidth / 8 / Math.max(maxX, maxY, maxZ);

        //add respective cubeUid to each item
        cube.forEach(b => {

            b.items.forEach(item => {
                item.cubeUid = b.uid;
            });

            if (b.uid != -1)
                cubes.push(new Cube(
                    b.uid,
                    b.label,
                    b.items,
                    new D3Point(b.x, b.y, b.z),
                    window.innerWidth / 2 - cubeLength * 1.5 * b.x + cubeLength * 1.5 * b.y,
                    window.innerHeight / 2 + cubeLength * 0.75 * b.x + cubeLength * 0.75 * b.y - cubeLength * 1.5 * b.z,
                    cubeLength,

                    b.color
                ));
            b.items.forEach(item => {
                if (item.type == "book")
                    items[item.itemUid] = item;
            });
        });

        nrOfLayers = maxZ + 1;
        nrOfLevels = maxY + 1;
        map = new Map(ref);
        //Adding all cubes that are not defined but reqired for cube dimension
        //If not used, only blocks are displayed that are actually defined
        for (let i = 0; i <= maxZ; i++) {
            for (let j = 0; j <= maxY; j++) {
                for (let k = 0; k <= maxX; k++) {
                    let cordsUsed = false;
                    for (let z = 0; z < cubes.length; z++) {
                        if (cubes[z].cords.x == k && cubes[z].cords.y == j && cubes[z].cords.z == i) {
                            cordsUsed = true;
                            break;
                        }
                    }
                    if (!cordsUsed)
                        cubes.push(new Cube(
                            null,
                            '',
                            null,
                            new D3Point(k, j, i),
                            window.innerWidth / 2 - cubeLength * 1.5 * k + cubeLength * 1.5 * j,
                            window.innerHeight / 2 + cubeLength * 0.75 * k + cubeLength * 0.75 * j - cubeLength * 1.5 * i,
                            cubeLength,
                            "#000000"
                        ));
                }
            }
        }

        //sorting cubes for draw order on canvas
        cubes = cubes.sort((b1, b2) => this.sortByXYZCoordinates(b1, b2));
        this.initExplLayerSelector(cubes, ref);

        this.repaintCube(cubes);

    }

    /**
     *   Sort function for cubes array
     */
    sortByXYZCoordinates(b1, b2) {
        if (b1.cords.z < b2.cords.z) return -1;
        if (b1.cords.z > b2.cords.z) return 1;

        if (b1.cords.x < b2.cords.x) return -1;
        if (b1.cords.x > b2.cords.x) return 1;

        if (b1.cords.y < b2.cords.y) return -1;
        if (b1.cords.y > b2.cords.y) return 1;
    }

    /**
     * Repaint cubes on canvas after clearing it,
     * if cube is visible according to selected layers
     */
    repaintCube(cubes) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cubes.forEach(elem => {
            ctx.globalAlpha = elem.uid !== null ? 1.0 : 0.4;
            if (ref.displayLayers.length == 0 || ref.displayLayers.includes(elem.cords.z))
                drawCube(ctx, elem.x, elem.y, elem.cubeLength, elem.cubeLength, elem.cubeLength, elem.color);
        });
    }

    /**
     * Generates hard copy of an object
     */
    iterationCopy(src) {
        let target = {};
        for (let prop in src) {
            if (src.hasOwnProperty(prop)) {
                target[prop] = src[prop];
            }
        }
        return target;
    }

    /**
     * Callback function for room.js; Repaints map canvas on navigating through door
     * or visualizing context of an item
     */
    updateMap(block, enhanced = [], scaffoldingCords = null, updateDirectionArrow = false) {
        map.repaintMapCube(cubes, "", enhanced, scaffoldingCords, updateDirectionArrow, block);

    }
    /** Gets the neighbour blocks for a certain block according to coordinates: 
     * Ahead, Behind, Left, Right, Top, Bottom 
     */
    getDirections(cube) {
        let cCords = cube.cords;
        let directions = {};
        for (let i = 0; i < cubes.length; i++) {
            if (cubes[i].uid !== null) {
                let curZ = cubes[i].cords.z;
                let curY = cubes[i].cords.y;
                let curX = cubes[i].cords.x;
                //top
                if (curZ == cCords.z + 1 && curY == cCords.y &&
                    curX == cCords.x)
                    directions.up = cubes[i];
                //bottom
                if (curZ == cCords.z - 1 && curY == cCords.y &&
                    curX == cCords.x)
                    directions.down = cubes[i];
                //left
                if (curX == cCords.x - 1 && curY == cCords.y &&
                    curZ == cCords.z)
                    directions.right = cubes[i];
                //right
                if (curX == cCords.x + 1 && curY == cCords.y &&
                    curZ == cCords.z)
                    directions.left = cubes[i];
                //ahead
                if (curY == cCords.y - 1 && curX == cCords.x &&
                    curZ == cCords.z)
                    directions.ahead = cubes[i];
                //behind
                if (curY == cCords.y + 1 && curX == cCords.x &&
                    curZ == cCords.z)
                    directions.behind = cubes[i];
            }

        }
        return directions;
    }



    /**
     * Initializes the modal for displaying an items information
     */
    showModal(content) {
        modal.style.display = "block";
        let contentArr = [];
        let pageCnt = 1;
        content.forEach(c => {
            let contentElement;
            switch (c.contentType) {
                case "imageLink":
                    contentArr.push('<div class="cont-container"> <h3 class="cont-label">' + c.label + '</h3><img class="cont-img" src="' + c.src + '" alt="' + c.text + '" /> </div>');

                    break;
                case "text":
                    contentArr.push('<div class="cont-container"> <h3 class="cont-label">' + c.label + '</h3><p class="cont-text">' + c.text + '</p> </div>');
                case "pdfLink":
                    contentArr.push('<div class="cont-container"> <h3 class="cont-label">' + c.label + '</h3><object class="cont-pdf" data="' + c.src + '" type="application/pdf"><embed src="' + c.src + '" type="application/pdf"/></object> </div>');
                    break;
            }
        })

        document.querySelector('.modal-content-box').innerHTML = contentArr[0];
        document.querySelector('.page-counter-disp').innerHTML = "1/" + contentArr.length;
        document.querySelector('.prev-content-arr').addEventListener('click', () => {
            if (pageCnt > 1) {
                pageCnt--;
                document.querySelector('.modal-content-box').innerHTML = contentArr[pageCnt - 1];
                document.querySelector('.page-counter-disp').innerHTML = String(pageCnt) + "/" + String(contentArr.length);
            }
        });
        document.querySelector('.next-content-arr').addEventListener('click', () => {
            if (pageCnt < contentArr.length) {
                pageCnt++;

                document.querySelector('.modal-content-box').innerHTML = contentArr[pageCnt - 1];
                document.querySelector('.page-counter-disp').innerHTML = String(pageCnt) + "/" + String(contentArr.length);
            }
        });
    }

    /**
     * Adds the layer selector to right side of screen on entry-choosing screen
     */
    initExplLayerSelector(cubes, ref) {

        for (let i = nrOfLayers - 1; i >= 0; i--) {
            let layerA = document.createElement('a');
            layerA.href = "#";
            layerA.innerText = i + 1;
            layerA.addEventListener('click', (e) => {
                let selectedNr = Number(e.target.innerText) - 1;
                if (ref.displayLayers.includes(selectedNr)) {
                    let elIndex = ref.displayLayers.indexOf(selectedNr);
                    e.target.classList.remove('active');

                    if (elIndex > -1)
                        ref.displayLayers.splice(elIndex, 1);
                } else {
                    ref.displayLayers.push(selectedNr);
                    e.target.classList.add('active');

                }
                this.repaintCube(cubes);

            });
            document.getElementById('explLayerSelector').append(layerA);
        }
    }

    /**
     * Initialize the popup modal for later usage of showModal(content), where
     * content is passed to be displayed
     */
    initializeModal() {
        // Get the modal
        modal = document.getElementById("contentModal");

        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];

        // When the user clicks on the button, open the modal 

        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
            modal.style.display = "none";
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    }

    /**
     * Get block on certain coordinates
     */
    getBlockOnCords(x, y, z) {
        cubes.forEach(cube => {
            if (cube.cords.x == x && cube.cords.y == y && cube.cords.z == z)
                return cube;
        })
    }

    /** 
     * Get block by unique identifier (integer)
     */
    getBlockOnUid(uid) {
        let retCube = null;
        cubes.forEach(cube => {
            if (cube.uid == uid) {
                retCube = cube;
                return;
            }
        });
        return retCube;
    }

    /**
     * Determines maximum x, y and z values of all cubes.
     */
    getMaxCords(cube) {
        let maxX = 0,
            maxY = 0,
            maxZ = 0;
        cube.forEach(b => {
            maxX = b.x > maxX ? b.x : maxX;
            maxY = b.y > maxY ? b.y : maxY;
            maxZ = b.z > maxZ ? b.z : maxZ;
        });
        return {
            x: maxX,
            y: maxY,
            z: maxZ
        };
    }

    /**
     * Disable load button (connection screen for choosing url and port of database)
     */
    disableLoadButton() {
        $('#connectButton').attr('disabled', true);
        $('#connectButton').css('opacity', '0.5');
    }

    /**
     * Enable load button (connection screen for choosing url and port of database)
     */
    enableLoadButton() {
        $('#connectButton').attr('disabled', false);
        $('#connectButton').css('opacity', '1');
    }
}