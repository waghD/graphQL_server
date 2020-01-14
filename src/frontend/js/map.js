class Map {
    mapCtx = null;
    ref = null;
    isMapCubeSelected = false;
    //selected cube on hover
    selectedMapCube = null;
    //cube currently resided in
    selectedCube = null;
    enhancedCubes = null;
    scaffoldingCubesCords = null;
    map = null;
    div = 1.7;
    cubeLength = null;
    displayLayers = null;
    arrow = null;
    previousAction = 0;
    lookUp = false;
    lookDown = false;
    navigator = null;
    topText = null;
    TEXTMAXWIDTH = null;

    /**
     * Constructor initializing map, passed ref object is
     * reference to main.js context
     */
    constructor(ref) {
        this.ref = ref;
        this.TEXTMAXWIDTH = 580; //pixel
        this.isMapCubeSelected = false;
        this.selectedMapCube = null;
        this.enhancedCubes = [];
        this.scaffoldingCubesCords = [];
        this.topText = "";
        this.navigator = new Navigator(0, 3, this.repaintDirection, this);
        this.displayLayers = [];
        this.map = document.getElementById("mapCanvas");
        this.mapCtx = this.map.getContext('2d');
        this.initializeMap();
        this.addLayerSelection();
        this.addEventHandlers();
    }

    /**
     * Initializes map with height and width an arrow (navigation) image
     */
    initializeMap() {
        this.map.width = window.innerWidth / 3;
        this.map.height = window.innerHeight / 2;
        this.arrow = document.createElement("img");
        this.arrow.src = "./assets/arrow_up_left.svg";
        this.cubeLength = (window.innerWidth / 3) / Math.max(this.ref.maxX, this.ref.maxY, this.ref.maxZ) / 4;

    }

    /**
     * Adds layer selection to map view and 
     * holds listeners for modifying map cubes accordingly
     */
    addLayerSelection() {
        let mapButtonsContainer = this.ref.createMapButtonsContainer(this.map.height);
        let layerButtonContainer = this.ref.createDiv("layerButtonContainer");
        let layerButtonList = this.ref.createLayerButtonList("layerButtonList");

        for (let i = 0; i < this.ref.maxZ; i++) {
            let layerButton = this.ref.createLayerButton("layerButton-" + String(i), "layer-button");
            layerButtonList.append(layerButton);
        }

        layerButtonContainer.append(layerButtonList);
        document.querySelector("body").append(mapButtonsContainer);
        let layerSelector = this.ref.createDiv("mapLayerSelector");

        for (let i = nrOfLayers - 1; i >= 0; i--) {
            let layerA = this.ref.createLayerA("#", i + 1);
            layerA.addEventListener('click', (e) => {
                let selectedNr = Number(e.target.innerText) - 1;
                if (this.displayLayers.includes(selectedNr)) {
                    let elIndex = this.displayLayers.indexOf(selectedNr);
                    e.target.classList.remove('active');

                    if (elIndex > -1)
                        this.displayLayers.splice(elIndex, 1);
                } else {
                    this.displayLayers.push(selectedNr);
                    e.target.classList.add('active');

                }
                this.repaintMapCube(cubes, "", this.enhancedCubes, this.scaffoldingCubesCords, false)

            });
            layerSelector.append(layerA);
        }
        mapButtonsContainer.append(layerSelector);
    }

    /**
     * Click and mousemove listener for map canvas object
     */
    addEventHandlers() {
        this.map.addEventListener('click', e => this.clickListener(e));
        this.map.addEventListener('mousemove', e => this.mousemoveListener(e));
    }

    /**
     * Click listener; on click, change to clicked cube (room)
     */
    clickListener(e) {
        if (this.selectedMapCube !== null && this.selectedMapCube != this.selectedCube) {
            this.enhancedCubes = [];
            this.scaffoldingCubesCords = null;
            this.selectedCube = this.selectedMapCube;
            let directions = this.ref.methods.getDirections(this.selectedMapCube);
            //  this.ref.updateRoom(this.selectedMapCube, directions);
            this.ref.room.navigateToRoom(this.selectedMapCube, directions, true);
            this.repaintMapCube(ref.cubes, "", [], null, false, this.selectedMapCube);
            //this.repaintMapCube(hoverCubeArr, this.selectedMapCube.label);
        }
    }


    /**
     * Mousemove listener; on hover, determine and apply color to hovered block
     * if hovered over one
     */
    mousemoveListener(e) {
        this.isMapCubeSelected = false;
        this.selectedMapCube = null;

        let rect = this.map.getBoundingClientRect(),
            x = e.clientX - rect.left,
            y = e.clientY - rect.top,
            i = 0,
            r;

        let hoverCubeArr = [];
        let div = this.div;
        this.topText = "";
        let showCubes = [...cubes].sort((b2, b1) => ref.methods.sortByXYZCoordinates(b1, b2));

        for (let i = 0; i < showCubes.length; i++) {
            let block = this.ref.methods.iterationCopy(showCubes[i]);
            this.mapCtx.beginPath();

            drawTopSidePathOfCube(this.mapCtx, (window.innerWidth / 3 - this.cubeLength * 1.5 * block.cords.x + this.cubeLength * 1.5 * block.cords.y) / div,
                (window.innerHeight / 2 + this.cubeLength * 0.75 * block.cords.x + this.cubeLength * 0.75 * block.cords.y - this.cubeLength * 1.5 * block.cords.z) / div,
                this.cubeLength / div,
                this.cubeLength / div,
                this.cubeLength / div);
            drawLeftSidePathOfCube(this.mapCtx, (window.innerWidth / 3 - this.cubeLength * 1.5 * block.cords.x + this.cubeLength * 1.5 * block.cords.y) / div,
                (window.innerHeight / 2 + this.cubeLength * 0.75 * block.cords.x + this.cubeLength * 0.75 * block.cords.y - this.cubeLength * 1.5 * block.cords.z) / div,
                this.cubeLength / div,
                this.cubeLength / div);
            drawRightSidePathOfCube(this.mapCtx, (window.innerWidth / 3 - this.cubeLength * 1.5 * block.cords.x + this.cubeLength * 1.5 * block.cords.y) / div,
                (window.innerHeight / 2 + this.cubeLength * 0.75 * block.cords.x + this.cubeLength * 0.75 * block.cords.y - this.cubeLength * 1.5 * block.cords.z) / div,
                this.cubeLength / div,
                this.cubeLength / div);
            this.mapCtx.closePath();

            let isVisible = this.displayLayers.length == 0 || this.displayLayers.includes(block.cords.z) ? true : false;
            if (this.mapCtx.isPointInPath(x, y) && !this.isMapCubeSelected && block.uid !== null && isVisible) {
                this.isMapCubeSelected = true;
                this.selectedMapCube = showCubes[i];
                block.color = "white";
                this.topText = block.label;
            }
            hoverCubeArr.push(block);
        };
        hoverCubeArr = hoverCubeArr.reverse();
        this.repaintMapCube(hoverCubeArr, this.topText, this.enhancedCubes, this.scaffoldingCubesCords, false);


    }

    /**
     * Callback function for Navigator; Repaint map canvas (arrow only) to show the correct direction
     * the user currently views
     */
    repaintDirection() {
        this.repaintMapCube(cubes, this.topText, this.enhancedCubes, this.scaffoldingCubesCords, true);
    }

    /**
     * Map cubes repaint function; Repaint cubes on map with text (on hover), show enhanced cubes in context(bright colour),
     * show scaffolding cubes (grey) in context, draw direction arrow in correct direction
     */
    repaintMapCube(cube, topText = "", enhanceCubes = [], scaffoldingCubesCords = null, updateDirectionArrow = false, currentCube = null) {
        if (currentCube != null)
            this.selectedCube = currentCube;
        //this.mapCtx.save();
        //this.mapCtx.translate(-100,-100);

        this.mapCtx.save();
        //this.mapCtx.translate(130,0);
        //Initialize map depending on passed parameters
        this.enhancedCubes = enhanceCubes;
        this.scaffoldingCubesCords = scaffoldingCubesCords;
        this.mapCtx.clearRect(0, 0, this.map.width, this.map.height);
        this.mapCtx.fillStyle = "#000000";
        this.mapCtx.globalAlpha = 0.4;
        this.mapCtx.fillRect(0, 0, this.map.width, this.map.height);
        this.mapCtx.restore();
        this.mapCtx.globalAlpha = 1.0;


        this.mapCtx.save();
        if (updateDirectionArrow) {
            switch (this.navigator.val) {
                case 0:
                    this.arrow.src = "./assets/arrow_up_left.svg";
                    break;
                case 1:
                    this.arrow.src = "./assets/arrow_up_right.svg";
                    break;
                case 2:
                    this.arrow.src = "./assets/arrow_down_right.svg";
                    break;
                case 3:
                    this.arrow.src = "./assets/arrow_down_left.svg";
                    break;
                case 4:
                    this.arrow.src = "./assets/arrow-up.svg";
                    break;
                case 5:
                    this.arrow.src = "./assets/arrow-down.svg";
                    break;
            }

            this.arrow.onload = () => {
                debugger
                this.mapCtx.globalAlpha = 1.0;
                this.mapCtx.drawImage(this.arrow, 70, 70, 70, 70);
            };
        } else {

            this.mapCtx.globalAlpha = 1.0;
            this.mapCtx.drawImage(this.arrow, 70, 70, 70, 70);
            //this.mapCtx.translate(-25,-25);



        }
        this.mapCtx.restore();

        cube.forEach(elem => {
            let div = this.div;

            if (scaffoldingCubesCords == null) {
                let drawColor = this.selectedCube.uid == elem.uid ? "#FFFAF0" : elem.color;
                //Make cubes transparent not being defined, determine by uid == null
                this.mapCtx.globalAlpha = elem.uid !== null ? 1.0 : 0.4;
                //Enhancement definiton; Enhance cubes for currently selected item context
                if (elem.uid !== null && this.enhancedCubes.includes(elem.uid)) {
                    this.mapCtx.save();
                    //mapCtx.fillStyle = 'red';
                    this.mapCtx.fillStyle = 'rgb(255,128,0)';
                    this.mapCtx.strokeStyle = 'rgb(255,128,0)';
                    this.mapCtx.shadowOffsetX = 0;
                    this.mapCtx.shadowOffsetY = 0;
                    this.mapCtx.shadowBlur = 25;
                    this.mapCtx.shadowColor = 'rgb(255,128,0)';
                    this.mapCtx.lineWidth = 6;
                    //mapCtx.shadowColor = 'rgba(255, 0, 0, 1)';

                }

                if (this.displayLayers.length == 0 || this.displayLayers.includes(elem.cords.z))
                    /*  drawCube(this.mapCtx, elem.x/div, elem.y/div, elem.wx/div,
                              elem.wy/div, elem.h/div, drawColor
                          );*/
                    drawCube(this.mapCtx, (window.innerWidth / 3 - this.cubeLength * 1.5 * elem.cords.x + this.cubeLength * 1.5 * elem.cords.y) / div,
                        (window.innerHeight / 2 + this.cubeLength * 0.75 * elem.cords.x + this.cubeLength * 0.75 * elem.cords.y - this.cubeLength * 1.5 * elem.cords.z) / div,
                        this.cubeLength / div,
                        this.cubeLength / div, this.cubeLength / div, drawColor
                    );

                if (elem.uid !== null && enhanceCubes.includes(elem.uid)) this.mapCtx.restore();
            } else {
                if (elem.uid === this.selectedCube.uid || this.enhancedCubes.includes(elem.uid) ||
                    this.isInScaffoldingCords(this.scaffoldingCubesCords, elem.cords)) {

                    let drawColor = "#565652";

                    if (this.selectedCube.uid == elem.uid) {

                        drawColor = "#FFFAF0";
                    } else if (this.enhancedCubes.includes(elem.uid)) {
                        drawColor = elem.color;
                    }
                    //Make cubes transparent not being defined, determine by uid == null
                    // this.mapCtx.globalAlpha = elem.uid !== null ? 1.0:0.4;
                    //Enhancement definiton; Enhance cubes for currently selected item context
                    if (this.enhancedCubes.includes(elem.uid)) {
                        this.mapCtx.save();
                        this.mapCtx.fillStyle = 'rgb(255,128,0)';
                        this.mapCtx.strokeStyle = 'rgb(255,128,0)';
                        this.mapCtx.shadowOffsetX = 0;
                        this.mapCtx.shadowOffsetY = 0;
                        this.mapCtx.shadowBlur = 25;
                        this.mapCtx.shadowColor = 'rgb(255,128,0)';
                        this.mapCtx.lineWidth = 6;
                    }

                    if (this.displayLayers.length == 0 || this.displayLayers.includes(elem.cords.z))
                        drawCube(this.mapCtx, (window.innerWidth / 3 - this.cubeLength * 1.5 * elem.cords.x + this.cubeLength * 1.5 * elem.cords.y) / div,
                            (window.innerHeight / 2 + this.cubeLength * 0.75 * elem.cords.x + this.cubeLength * 0.75 * elem.cords.y - this.cubeLength * 1.5 * elem.cords.z) / div,
                            this.cubeLength / div,
                            this.cubeLength / div, this.cubeLength / div, drawColor
                        );

                    if (elem.uid !== null && enhanceCubes.includes(elem.uid)) this.mapCtx.restore();
                }

            }

        });
        //Set top text
        this.mapCtx.save();
        this.mapCtx.font = "1.4rem Arial";
        this.mapCtx.textAlign = "center";
        this.mapCtx.fillStyle = "white";
        this.mapCtx.globalAlpha = 1.0;
        this.mapCtx.fillText(topText, this.map.width / 2, 50, this.TEXTMAXWIDTH);
        this.mapCtx.restore();


    }

    /**
     * Show map canvas (if it was set invisible by css "display:none" before)
     */
    show() {
        this.map.style.display = "";
        document.getElementById('mapButtonContainer').style.display = "block";
    }

    /**
     * Determines if a cube is part of the scaffolding path by it's coordinates
     */
    isInScaffoldingCords(scaffoldingCords, elemCords) {
        let inScaffCords = false;
        scaffoldingCords.forEach(scaffCords => {
            if (scaffCords.x == elemCords.x && scaffCords.y == elemCords.y && scaffCords.z == elemCords.z) {
                inScaffCords = true;
                return;
            }
        });
        return inScaffCords;
    }



}