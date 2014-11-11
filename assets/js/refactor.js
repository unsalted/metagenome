var center = view.center;
var handle_len_rate = 2.4;
var displayRatio = view.bounds.height/view.bounds.width;    //redraw grid lines
var gridHeight = 10;
var grid = new Layer({
    strokeColor: 'black'
});

//----------------------------------------------------
// reuseable

function genPos(min, max){      //generate random point within range;
    var pos = [center.x + randomIntFromInterval(min, max), center.y + randomIntFromInterval(min, max)];
    return pos;
}

var randomIntFromInterval = function(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

//-----------------------------------------------------
// Draw grid lines



var drawGridLines = function(num_rectangles_wide, num_rectangles_tall, boundingRect, layer) {
    var width_per_rectangle = boundingRect.width / num_rectangles_wide;
    var height_per_rectangle = boundingRect.height / num_rectangles_tall;
    for (var i = 0; i <= num_rectangles_wide; i++) {
        var xPos = boundingRect.left + i * width_per_rectangle;
        var topPoint = new paper.Point(xPos, boundingRect.top);
        var bottomPoint = new paper.Point(xPos, boundingRect.bottom);
        var aLine = new paper.Path.Line(topPoint, bottomPoint);
        layer.addChild(aLine);
        aLine.strokeColor = 'black';
        aLine.sendToBack();
    }
    for (var i = 0; i <= num_rectangles_tall; i++) {
        var yPos = boundingRect.top + i * height_per_rectangle;
        var leftPoint = new paper.Point(boundingRect.left, yPos);
        var rightPoint = new paper.Point(boundingRect.right, yPos);
        var aLine = new paper.Path.Line(leftPoint, rightPoint);
        layer.addChild(aLine);
        aLine.strokeColor = 'black';
        aLine.sendToBack();
    }
}

drawGridLines(gridHeight/displayRatio, gridHeight, view.bounds, grid);


//-----------------------------------------------------
// Create metagenome

var Metagenome = new Layer();

var Culture = function(){
    var parent = this;
    this.colonies = new Group();
    this.connections = new Group();
    this.states = {
        'create': false,
        'kill': false,
        'scale': false,
        'color': {'bool': true, 'color': null}
    };
    this.attribute = function(color){       // sets culture styles
        parent.colonies.style = {
            fillColor: color
        }
    }
    this.populate = function(pos, point, radius){   // spawns and merges child
        var colony = new Path.Circle({
                name: 'colony-'+[pos],
                center: point,
                radius: radius
                //opacity: 0.5
        });
        parent.colonies.addChild(colony);
    }
    this.kill = function(colony){
        parent.removeChild(colony);         // removes child
    }
    this.connect = function(){
        parent.connections.children = [];
        for (var i = 0, l = parent.colonies.children.length; i < l; i++) {
            for (var j = i - 1; j >= 0; j--) {
                var path = metaball(parent.colonies.children[i], parent.colonies.children[j], 0.5, handle_len_rate, 300);
                if (path) {
                    parent.connections.appendTop(path);
                    parent.connections.moveAbove(parent.colonies.children[i]);
                    path.removeOnMove();
                }
            }
        }
    }
}


var IntitMetagenome = function(metagenome){
    var parent = this;
    this.diversity = randomIntFromInterval(1, 4);    // get number of layers
    this.colonies = randomIntFromInterval(2, 5);
    this.metagenome = metagenome;
    var initPositions = [];
    var initRadii = [];
    var initScales = [ 1, 0.75, 0.65, 0.55, 0.45, 0.40, 0.35];             
    for (var i = 0; i < colonies; i++) {    // set init positions and radii
        initPositions.push(genPos(-200, 200));
        initRadii.push(randomIntFromInterval(50, 200));
    };
    var colors = [
    'red',
    'blue',
    'green',
    'pink',
    ];

    this.initCulture = function(culture, color, positions, radii, scale){
        for (var i = positions.length - 1; i >= 0; i--) {
            culture.attribute(color);
            culture.populate(i, positions[i], radii[i]*scale);
        };
        culture.connect();
    };
    this.start = function(){
        for (var i = diversity; i >= 0; i--) {
            var culture = new Culture();
            console.log(colors[i]);
            this.initCulture(culture, colors[i], initPositions, initRadii, initScales[i]);      //randomize color order later
            parent.metagenome.addChildren[culture];
        }
            parent.metagenome.reverseChildren();
    }
    return this.start();
}

var organism = IntitMetagenome(Metagenome);

console.log(Metagenome);
//organism.start();



// From Metaball Example in Paper.js
// Ported from original Metaball script by SATO Hiroyuki
// http://park12.wakwak.com/~shp/lc/et/en_aics_script.html
// ---------------------------------------------


function metaball(ball1, ball2, v, handle_len_rate, maxDistance) {
    var center1 = ball1.position;
    var center2 = ball2.position;
    var radius1 = ball1.bounds.width / 2;
    var radius2 = ball2.bounds.width / 2;
    var pi2 = Math.PI / 2;
    var d = center1.getDistance(center2);
    var u1, u2;

    if (radius1 == 0 || radius2 == 0)
        return;

    if (d > maxDistance || d <= Math.abs(radius1 - radius2)) {
        return;
    } else if (d < radius1 + radius2) { // case circles are overlapping
        u1 = Math.acos((radius1 * radius1 + d * d - radius2 * radius2) /
                (2 * radius1 * d));
        u2 = Math.acos((radius2 * radius2 + d * d - radius1 * radius1) /
                (2 * radius2 * d));
    } else {
        u1 = 0;
        u2 = 0;
    }
    var angle1 = (center2 - center1).getAngleInRadians();
    var angle2 = Math.acos((radius1 - radius2) / d);
    var angle1a = angle1 + u1 + (angle2 - u1) * v;
    var angle1b = angle1 - u1 - (angle2 - u1) * v;
    var angle2a = angle1 + Math.PI - u2 - (Math.PI - u2 - angle2) * v;
    var angle2b = angle1 - Math.PI + u2 + (Math.PI - u2 - angle2) * v;
    var p1a = center1 + getVector(angle1a, radius1);
    var p1b = center1 + getVector(angle1b, radius1);
    var p2a = center2 + getVector(angle2a, radius2);
    var p2b = center2 + getVector(angle2b, radius2);

    // define handle length by the distance between
    // both ends of the curve to draw
    var totalRadius = (radius1 + radius2);
    var d2 = Math.min(v * handle_len_rate, (p1a - p2a).length / totalRadius);

    // case circles are overlapping:
    d2 *= Math.min(1, d * 2 / (radius1 + radius2));

    radius1 *= d2;
    radius2 *= d2;

    var path = new Path({
        segments: [p1a, p2a, p2b, p1b],
        style: ball1.style,
        closed: true,
    });
    var segments = path.segments;
    segments[0].handleOut = getVector(angle1a - pi2, radius1);
    segments[1].handleIn = getVector(angle2a + pi2, radius2);
    segments[2].handleOut = getVector(angle2b - pi2, radius2);
    segments[3].handleIn = getVector(angle1b + pi2, radius1);
    return path;
}

function roll(odds){
    var n = Math.floor(Math.random() * odds) + 1;
    if (n == odds) return true;
}


var Controller = function(){
    var parent = this;
    this.state;
    this.time = 0;
    this.setTime = function(event){
        parent.time = event.time;
    }
    this.count = function(n){
        if (parent.time%n < .02) {     // .02 because of margin of error w/modulo
            if (parent.time >= n) return true;
        }
        
    }
    this.run = function(delta){
        if(parent.count(5) == true){
            var i = red.paths.length-1; //get highest possible array number
            if (roll(5) == true){
                var index = randomIntFromInterval(1, cultures.length-1);
                var cult = cultures[index];
                var radius = randomIntFromInterval(50,200);
                var position = genPos(-200, 200);
                cult.appendNode(radius, genPos(-200, 200), index);
            } 
            if (roll(5) == true){
                var index2 = randomIntFromInterval(1, cultures.length-1);
                var cult2 =  cultures[index2];
                if (cult2.length >1){
                    cultures[index].removeNode(randomIntFromInterval(0, i, index));    //random node from array
                }
            }        }
    }
}



// ------------------------------------------------
function getVector(radians, length) {
    return new Point({
        // Convert radians to degrees:
        angle: radians * 180 / Math.PI,
        length: length
    });
}


//-----------------------------------------
// Event


function onResize(event) {
    displayRatio = view.bounds.height/view.bounds.width;    //redraw grid lines
    gridHeight = 10;
    grid.removeChildren();
    drawGridLines(gridHeight/displayRatio, gridHeight, view.bounds, grid);
    grid.selected = false;
    center = view.center;
}

function onFrame(event) {

}




