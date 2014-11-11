//----------------------------------------------------
//Culture.js version 1.0

var center = view.center;
var handle_len_rate = 2.4;
var displayRatio = view.bounds.height/view.bounds.width;    //redraw grid lines
var gridHeight = 10;
var sizeMax = Math.floor(view.bounds.height/3); //generate max-size based on screen height;
var grid = new Layer({
    strokeColor: 'black'
});

//----------------------------------------------------
// reuseable

var genPos = function(min, max){      //generate random point within range;
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
var cultureArray = [];
var environments = [];

var Culture = function(){
    this.colonies = [];
    this.data = {
        spawn : false,
        kill: false,
        scale: false,
        color: {bool: true, color: null},
        breath: {speed: 1, depth: 0.3},
        scale: 1
    }
    this.connections = new Group();
    this.attribute = function(color){       // sets culture styles
        this.colonies.style = {
            fillColor: color
        }
    }
    this.spawn = function(pos, point, radius, color, sin, neg){   // spawns and merges child
        var colony = new Path.Circle({
                name: 'colony-'+[pos],
                center: point,
                fillColor: color,
                radius: radius,
                data: {'sin': sin, 'neg': neg}
        });
        this.colonies.push(colony);
    }
    this.scale = function(n){
        var colonies = this.colonies;


    }
    this.kill = function(colony){
        this.removeChild(colony);         // removes child
    }
    this.connect = function(){
        this.connections.children = [];
        for (var i = 0, l = this.colonies.length; i < l; i++) {
            for (var j = i - 1; j >= 0; j--) {
                var path = metaball(this.colonies[i], this.colonies[j], 0.5, handle_len_rate, 300);
                if (path) {
                    this.connections.appendTop(path);
                    this.connections.moveAbove(this.colonies[i]);
                    path.removeOnMove();
                }
            }
        }
    }
}

//-----------------------------------------
// Environment listener

var Environment = function(cult){
    this.culture = cult;
    this.spawnColony = function(){
        if (this.culture.data.spawn){
            var index = this.culture.colonies.length - 1;
            var scale = culture.data.scale;
            var neg = Math.round(Math.random()) * 2 - 1 // random negative;
            var sin = Math.random()<.5; // true false
            culture.spawn(index, genPos(-sizeMax, sizeMax), randomIntFromInterval*scale, sin, neg);
            this.culture.state.spawn = false;
        }
    }
    this.killColony = function(){
        if (this.culture.data.kill){
            var length = this.culture.colonies.length;
            if (length > 1){
                this.culture.kill(Math.randomIntFromInterval(0, length));
            } else {
                Organism.killCulture(culture);
            }
            this.culture.data.kill = false;
        }
    }
    this.shareCulture = function(culture1, culture2){
        //coming
    }
    this.breath = function(event){
        var colonies = this.culture.colonies;
        for (var i = colonies.length - 1; i >= 0; i--) {
            var colony = colonies[i];
            var sin = colony.data.sin;
            var neg = colony.data.neg;
            var speed = this.culture.data.breath.speed;
            var depth = this.culture.data.breath.depth;
            var bounds = [colony.bounds.height, colony.bounds.width];
            var amount;


            if (sin){
                amount = 1+((Math.sin(event.time*1.5)*0.001)*neg);
            } else {
                amount = 1+((Math.cos(event.time*1.5)*0.001)*neg);
            }

            colony.scale(amount);
        }    
            this.culture.connect();
    }
}
console.log(environments);

var animate = function(event, array){
    for (var i = array.length - 1; i >= 0; i--) {
        var env = array[i];
            env.breath(event);
            env.killColony(event);
            env.spawnColony(event);
    };
}

//-----------------------------------------
// Initialize function / Population control


var Population = function(metagenome, array){
    var parent = this;
    this.diversity = randomIntFromInterval(2, 4);    // get number of layers
    this.colonies = randomIntFromInterval(2, 4);
    this.metagenome = metagenome;
    this.array = array;
    var initPositions = [];
    var initRadii = [];
    var initScales = [ 1, 0.75, 0.50, 0.25, 0.15];             
    for (var i = 0; i < colonies; i++) {    // set init positions and radii
        initPositions.push(genPos(-sizeMax, sizeMax));
        initRadii.push(randomIntFromInterval(50, 200));
    };
    var colors = [
    'red',
    'blue',
    'green',
    'pink',
    'putple'
    ];

    this.spawnCulture = function(culture, color, positions, radii, scale){
        for (var i = positions.length - 1; i >= 0; i--) {
            var neg = Math.round(Math.random()) * 2 - 1; //random negative
            var sin = Math.random()<.5; //true false
            culture.attribute(color);
            culture.spawn(i, positions[i], radii[i]*scale, color, sin, neg);
            culture.colonies.selected = true;
        };
    }
    this.killCulture = function(culture){
        culture.remove();
    }
    this.start = function(){
        for (var i = diversity-1; i >= 0; i--) {
            var culture = new Culture();
            this.spawnCulture(culture, colors[i], initPositions, initRadii, initScales[i]);      //randomize color order later
            array.push(culture);
            var env = new Environment(culture);
            environments.push(env);
            culture.connect();
        }
            parent.metagenome.addChildren[cultureArray];
            parent.metagenome.reverseChildren();
            array.reverse();
    }
    return this.start();
}

var Organism = Population(Metagenome, cultureArray);


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



function getVector(radians, length) {
    return new Point({
        // Convert radians to degrees:
        angle: radians * 180 / Math.PI,
        length: length
    });
}


//-----------------------------------------
// Loops


function onResize(event) {
    displayRatio = view.bounds.height/view.bounds.width;    //redraw grid lines
    gridHeight = 10;
    grid.removeChildren();
    drawGridLines(gridHeight/displayRatio, gridHeight, view.bounds, grid);
    grid.selected = false;
    center = view.center;

    sizeMax = Math.floor(view.bounds.height/4); //re-generate max-size based on screen height;
}

function onFrame(event) {
    animate(event, environments);
}




