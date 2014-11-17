//----------------------------------------------------
//Culture.js version 2.0

var init = true;


window.globals = {};
paper.globals = window.globals;

window.server =  {};
paper.server = window.server;

window.state_change =  {};
paper.state_change = window.server;

var center = view.center;
var view_size = view.bounds.height;
if (view.bounds.width < view.bounds.height) view_size = view.bounds.width;

var view_ratio = (view_size/1000)/3;     // generate object ratio based on screen height;
var object_ratio = (view_size/1000);


var handle_len_rate = 2.4;
var displayRatio = view.bounds.height/view.bounds.width;    // redraw grid lines
var gridHeight = 10;

var grid = new Layer({
    strokeColor: 'black'
});
var hex = [
{hue: 0.59, saturation:0.8788, brightness:0.9059 },
{hue: 231, saturation:0.6667, brightness:0.5882 },   
{hue: 128.03, saturation:0.756, brightness:0.6588 },   
{hue: 329.54, saturation:0.8603, brightness:0.898 },   
{hue: 198.82, saturation:0.7824, brightness:0.8771 },   
{hue:55.29 , saturation:0.8095, brightness:0.9882 }
];

colorArray = shuffleArray(hex);
var colorIndex = 0;
if (colorIndex == hex.length-1) colorIndex = 0;     //reset


//----------------------------------------------------
// helpers


//generate random int;
var randomIntFromInterval = function(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

/**
 * Randomize array element order in-place.
 * Using Fisher-Yates shuffle algorithm.
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}


/* http://bit.ly/1yLr05L */

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
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

//-----------------------------------------
// Generate biome

var Create  = function(obj){
    layer = new Layer();
    var object = obj;

    this.genome = layer;
    //define object setter and getter
    this.__defineGetter__("object", function(){
        return object;
    });
   
    this.__defineSetter__("object", function(val){
        object = val;
    });

    this.newCulture = function(obj){
        var cult = obj;
        var culture = new Group();
        var colonies = cult.colonies;
        // add colonies/children
        for (var i = cult.index.colonies_length - 1; i >= 0; i--) {
            culture.addChild(this.newColony(cult.colonies[i]));
        };
        // set values
        culture.name = cult.uid;
        culture.style = {
            fillColor: cult.color
        };

        return culture;
    }

    this.newColony = function(obj){
        var coln = obj;
        var colony = new Path.Circle({
            name: coln.uid,
            center: (new Point(coln.point)*view_ratio)+center,  //scale for screen position relative to center
            radius: coln.radius*object_ratio
        });
        return colony;
    }

    this.connect = function(array,culture) {
        var colonies = culture.colonies;
        for (var i = 0, l = colonies.length; i < l; i++) {
            for (var j = i - 1; j >= 0; j--) {
                //call metaball through paper scope
                var path = paper.metaball(colonies[i], colonies[j], 0.5, handle_len_rate, 300);
                if (path) {
                    connections.appendTop(path);
                    connections.moveAbove(colonies[i]);
                    path.removeOnMove();
                }
            }
        }
    }

    this.start = function(){
        var genome = layer;
        var cultures = object.cultures;
        for (var i = 0; i < object.index.cultures_length; i++) {
            genome.addChild(this.newCulture(cultures[i]));
        };
    }
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

    view_size = view.bounds.height;
    if (view.bounds.width < view.bounds.height) view_size = view.bounds.width;
    view_ratio = (view_size/1000)/3;     // re-generate object ratio based on screen height;
    object_ratio = (view_size/1000);
}

//init create
var create = new Create();

function onFrame(event) {
    if (init && isEmpty(server) == false){
        create.object = server;
        create.start();
        init = false;
    }
    if (state_change && isEmpty(server) == false){
        create.genome.remove();
        console.log('remove');
        create = new Create();
        create.object = server;
        create.start();
        state_change = false;
    }
}




