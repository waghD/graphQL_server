class Cube {
    constructor(uid, label, items, cords, x, y, cubeLength, color) {
        this.uid = uid;
        this.label = label;
        this.items = items;
        this.cords = cords;
        this.x = x;
        this.y = y;
        this.cubeLength = cubeLength,
            this.color = color;
    }
}

function shadeColor(color, percent) {
    color = color.substr(1);
    var num = parseInt(color, 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = (num >> 8 & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

// Draw a cube to the specified specifications
function drawCube(ctxt, x, y, wx, wy, h, color) {
    ctxt.beginPath();
    drawLeftSidePathOfCube(ctxt, x, y, wx, h);
    ctxt.closePath();
    ctxt.fillStyle = shadeColor(color, -10);
    ctxt.strokeStyle = color;
    ctxt.stroke();
    ctxt.fill();
    ctxt.beginPath();
    drawRightSidePathOfCube(ctxt, x, y, wy, h);
    ctxt.closePath();

    ctxt.fillStyle = shadeColor(color, 10);
    ctxt.strokeStyle = shadeColor(color, 50);
    ctxt.stroke();
    ctxt.fill();
    ctxt.beginPath();
    drawTopSidePathOfCube(ctxt, x, y, wx, wy, h);
    ctxt.closePath();

    ctxt.fillStyle = shadeColor(color, 20);
    ctxt.strokeStyle = shadeColor(color, 60);
    ctxt.stroke();
    ctxt.fill();
}

function drawTopSidePathOfCube(ctxt, x, y, wx, wy, h) {
    ctxt.moveTo(x, y - h);
    ctxt.lineTo(x - wx, y - h - wx * 0.5);
    ctxt.lineTo(x - wx + wy, y - h - (wx * 0.5 + wy * 0.5));
    ctxt.lineTo(x + wy, y - h - wy * 0.5);
}

function drawLeftSidePathOfCube(ctxt, x, y, wx, h) {
    ctxt.moveTo(x, y);
    ctxt.lineTo(x - wx, y - wx * 0.5);
    ctxt.lineTo(x - wx, y - h - wx * 0.5);
    ctxt.lineTo(x, y - h * 1);
}

function drawRightSidePathOfCube(ctxt, x, y, wy, h) {
    ctxt.moveTo(x, y);
    ctxt.lineTo(x + wy, y - wy * 0.5);
    ctxt.lineTo(x + wy, y - h - wy * 0.5);
    ctxt.lineTo(x, y - h * 1);
}

function D3Point(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}