/******************************************
 ** Methods for creating html elements to be 
 ** used repeatedly
 *******************************************/
function createMapButtonsContainer(mapHeight) {
    let el = document.createElement('div');

    el.id = "mapButtonContainer";

    el.style.top = 0;
    el.style.right = 0;
    el.style.position = "absolute";
    el.style.display = "none";
    el.style.height = mapHeight + "px";
    return el;
}

function createDiv(id) {
    let el = document.createElement('div');
    el.id = id;
    return el;
}

function createLayerButtonList(id) {
    let el = document.createElement('ul');
    el.id = id;
    return el;
}

function createLayerButton(id, classNames) {
    let el = document.createElement('li');
    el.className = classNames;
    el.id = id;
    return el;
}

function createLayerA(href, innerText) {
    let el = document.createElement('a');
    el.href = href;
    el.innerText = innerText;
    return el;
}

function createCloseContextContainer() {
    let closeRelContainer = document.createElement('img');
    closeRelContainer.src = "./assets/close_icon.png";
    closeRelContainer.id = "closeRelContainer";
    return closeRelContainer;
}

function createObjLabel(href, label, classNames) {
    let objLabel = document.createElement('a');
    objLabel.href = href;
    objLabel.innerHTML = label;
    objLabel.className = classNames;
    return objLabel;
}