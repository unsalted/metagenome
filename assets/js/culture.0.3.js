//-----------------------------------------------------
// Draw grid lines



var drawGridLines = function(num_rectangles_wide, num_rectangles_tall, boundingRect) {
    var width_per_rectangle = boundingRect.width / num_rectangles_wide;
    var height_per_rectangle = boundingRect.height / num_rectangles_tall;
    for (var i = 0; i <= num_rectangles_wide; i++) {
        var xPos = boundingRect.left + i * width_per_rectangle;
        var topPoint = new paper.Point(xPos, boundingRect.top);
        var bottomPoint = new paper.Point(xPos, boundingRect.bottom);
        var aLine = new paper.Path.Line(topPoint, bottomPoint);
        aLine.strokeColor = 'black';
        aLine.sendToBack();
    }
    for (var i = 0; i <= num_rectangles_tall; i++) {
        var yPos = boundingRect.top + i * height_per_rectangle;
        var leftPoint = new paper.Point(boundingRect.left, yPos);
        var rightPoint = new paper.Point(boundingRect.right, yPos);
        var aLine = new paper.Path.Line(leftPoint, rightPoint);
        aLine.strokeColor = 'black';
        aLine.sendToBack();
    }
}

var displayRatio = view.bounds.height/view.bounds.width;
var gridHeight = 10;



drawGridLines(gridHeight/displayRatio, gridHeight, view.bounds);


//-----------------------------------------------------
// Organism

var center = view.center;
var randomIntFromInterval = function(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

function genPos(min, max){      //generate random point within range;
    var pos = [center.x + randomIntFromInterval(min, max), center.y + randomIntFromInterval(min, max)];
    return pos;
}


var initPositions = [
    genPos(-200, 200),
    genPos(-200, 200),
    genPos(-200, 200)
];
var cultures = [];
var layer = 0,
    maxLayers = 6,
    colors = ['red', 'green', 'blue', 'yellow']
    opacity = 1,
    usedColors = [],
    handle_len_rate = 2.4;


function lookup(array, n){                              //find by id
    var lookup = {};
    var array = red.paths;
    for (var i = 0, len = array.length; i < len; i++) {
        lookup[array[i].id] = array[i];
    }
    return (lookup[n]);
}


var Culture = function (min){
    var parent = this;
    this.positions = [];
    this.paths = [];
    this.color;
    this.radii = [];    //store original radius
    this.originBounds = [];   // store original bounds
    this.originPositions = {x : [], y : []};
    this.minRadius = 20;   //default value;
    this.layer;
    this.layerGroup = new Group();
    this.seed = [];
    if (min) this.minRadius = min;
    this.connections = new Group();

    this.generate = function (positions, range, color, radii, diff){
        
        parent.positions = positions;

        for (var i = 0, l = positions.length; i < l; i++) {

            if (radii){ // check if child, scale child layer - variance
                var radius = (radii[i] * diff) - randomIntFromInterval(range[0], range[1]); 
            } else {
                var radius = randomIntFromInterval(range[0], range[1]);
            }

            if (radius <= parent.minRadius){
                return;
            }

            parent.radii.push(radius);

            if (diff) {radius - diff}
            var sidesArr = [8]; //possibly make this fixed
            var sides = sidesArr[Math.floor(Math.random() * sidesArr.length)];
            var path = new Path.RegularPolygon({
                center: positions[i],
                radius: radius,
                sides: sides,
                fillColor: color,
                opacity: opacity
            });
            path.smooth();

            parent.originBounds.push([path.bounds.width, path.bounds.height]);
            parent.originPositions.x.push(path.position.x);
            parent.originPositions.y.push(path.position.y);
            parent.color = color;

            //if (randomIntFromInterval(1,3) <= 2)

            parent.paths.push(path);

        }
        this.setSeed();
        parent.layer = new Layer({
            children: parent.paths
        });

    }
    this.connect = function (){
        parent.connections.children = [];
        for (var i = 0, l = parent.paths.length; i < l; i++) {
            for (var j = i - 1; j >= 0; j--) {
                var path = metaball(parent.paths[i], parent.paths[j], 0.5, handle_len_rate, 300);
                if (path) {
                    parent.connections.appendTop(path);
                    parent.connections.moveAbove(parent.paths[i]);
                    path.removeOnMove();
                }
            }
        }
    }
    this.setSeed = function(min, max){
        for (var i = parent.paths.length - 1; i >= 0; i--) {
            parent.seed.push(Math.round(Math.random()) * 2 - 1);    // set random neg
        };
    }
    this.scale = function (amount, seed) {
        var paths = parent.paths;
        for (var i = 0, l = paths.length; i < l; i++) {
            
            var path = paths[i];

            var bounds = parent.originBounds[i];  //get bounds

            var w = bounds[0];
            var h = bounds[1];
            var rn = 1;

            if (seed){
                rn = parent.seed[i];   // set random negative
            }

            path.bounds.height = h + (amount*rn);
            path.bounds.width = w + (amount*rn);
            // reset origin to middle during scale;
            path.position.x = parent.originPositions.x[i];
            path.position.y = parent.originPositions.y[i]; 
        }
        this.connect();
    }
    this.appendNode = function(radius, point, index){
        console.log('append: '+index);
        var sidesArr = [8]; //possibly make this fixed
        var path = new Path.RegularPolygon({
            center: point,
            radius: radius,
            sides: 8,
            fillColor: parent.color,
            opacity: opacity
        });
        path.smooth();
        path.moveBelow(parent.paths[0]);    //move to back of culture
        parent.paths.push(path);    //set info to array
        parent.originBounds.push([path.bounds.width, path.bounds.height]);
        parent.originPositions.x.push(path.position.x);
        parent.originPositions.y.push(path.position.y);
        this.setSeed();
        if(index !== 0){
            cultures[0].appendNode(radius*1.4, point, 0);    //set base
        }
        //this.grow(path, radius);
    }
    this.removeNode = function(i, index){
        console.log('remove: '+index);
        var path = parent.paths[i];
        //var id = path._id;
        path.remove();
        parent.originBounds.splice(i, 1);
        parent.originPositions.x.splice(i, 1);
        parent.originPositions.y.splice(i, 1);
        parent.paths.splice(i, 1);
        this.setSeed();
        /*if (index !== 0){
            var n = cultures[0].paths.indexOf(lookup(id));
            cultures[0].removeNode(n);
        }*/
    }
   /* this.grow = function(path, amount){
        var w = path.bounds.width;
        var h = path.bounds.height;
        var origin =  parent.originBounds[parent.paths.indexOf(path)];
        var orignWidth = origin[0];
        var orignHeight = origin[1];
        path.bounds.width = originWidth+amount;
        path.bounds.height = originHeight+amount; 
        origin = [path.bounds.width, path.bounds.height];
    }*/
}

var red = new Culture();
var blue = new Culture();
var green = new Culture();

cultures.push(red);
cultures.push(green);
cultures.push(blue);


red.generate(initPositions, [80, 250], 'red');
blue.generate(red.positions, [0, 40], 'blue', red.radii, 0.75);
green.generate(blue.positions, [0, 10], 'green', blue.radii, 0.65);


function breath(type, length, speed, event){
    var amount = 0;
    switch(type) {
        case "sin":
            amount = Math.sin(event.time*speed)*length;
        break;
        case "cos":
            amount = Math.cos(event.time*speed)*length;
        break;
        default:
            amount = 0;
    }
    return amount; 
}


//var blue = new Connections(bluePaths);

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

//__________________________________________________
//INIT ANIMATION

var controller = new Controller();
    

function onFrame(event) {
    
    red.scale(breath('cos', 20, 1, event), true); // type, length, speed, event
    green.scale(breath('sin', 20, 0.8, event), true);
    blue.scale(breath('cos', 20, 0.8, event), true);


    controller.setTime(event);
    controller.run(event.delta);
}



