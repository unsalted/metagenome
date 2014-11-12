//----------------------------------------------------
//Culture.js version 1.0

window.globals = {};


paper.globals = window.globals;

console.log(paper.globals);






var center = view.center;
var handle_len_rate = 2.4;
var displayRatio = view.bounds.height/view.bounds.width;    // redraw grid lines
var gridHeight = 10;
var spread = Math.floor(view.bounds.height/3);      // generate max-spread based on screen height;
var minSize = Math.floor(view.bounds.height/10);     // genreate min colony size
var maxSize = Math.floor(view.bounds.height/4);    // genreate max colony size
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

for (var i = hex.length - 1; i >= 0; i--) {
    console.log(new Color(hex[i]).hue);
};

colorArray = shuffleArray(hex);
var colorIndex = 0;
if (colorIndex == hex.length-1) colorIndex = 0;     //reset

var guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();

//----------------------------------------------------
// reuseable

//generate random point within range;
var genPos = function(min, max) {      
    var pos = [center.x + randomIntFromInterval(min, max), center.y + randomIntFromInterval(min, max)];
    return pos;
}

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

var Culture = function() {
    this.colonies = [];
    this.group = new Group();
    this.data = {
        spawn: { bool:false, point: genPos(-spread, spread), radius: 100, neg: -1, sin: true },  //set default
        kill: { bool:false, colony: {} },
        color: { bool: false, color: null, newColor: null},
        breath: {speed: 1, depth: 0.3},
        scale: 1,
        layer: 0
    }
    this.connections = new Group();
    this.attribute = function(color) {       // sets culture styles
        this.colonies.style = {
            fillColor: color
        }
    }
    this.spawn = function(index, point, radius, color, sin, neg, uuid, layer) {
        var colony = new Path.Circle({
                name: color+'-'+[index],
                center: point,
                fillColor: color,
                radius: radius,
                data: {'sin': sin, 'neg': neg, 'uuid': uuid, 'layer': layer, 'color': color}
        });
        var length = this.colonies.length;
        if (length > 1){
            colony.moveBelow(this.colonies[length-1]);
        }
        this.colonies.push(colony);
        this.group.addChild(colony);
    }
    this.scale = function(n) {
        var colonies = this.colonies;   //not used
    }
    this.color = function (hex) {
        this.group.style.fillColor = hex;
    }
    this.kill = function(colony) {
        console.log(colony);
        var index = colony.index;
        this.colonies.splice(index, 1);
        colony.remove();
        this.connect();
    }
    this.connect = function() {
        this.connections.children = [];
        for (var i = 0, l = this.colonies.length; i < l; i++) {
            for (var j = i - 1; j >= 0; j--) {
                //call metaball through paper scope
                var path = paper.metaball(this.colonies[i], this.colonies[j], 0.5, handle_len_rate, 300);
                if (path) {
                    this.connections.appendTop(path);
                    this.connections.moveAbove(this.colonies[i]);
                    path.removeOnMove();
                }
            }
        }
    }
    this.color();
}

//-----------------------------------------
// Environment listener

var Environment = function(cult) {
    this.culture = cult;
    this.spawnColony = function() {
        var data = this.culture.data.spawn
        var bool = data.bool;
        if (bool) {
            this.culture.data.spawn.bool = false;
            var scale = this.culture.data.scale;
            var color = this.culture.data.color.color;
            var index = this.culture.colonies.length - 1;
            var base = cultureArray[0];      //dont like this solution
            var baseData = base.data;
            var baseIndex = base.colonies.length - 1;
            var baseColor = base.data.color.color;
            var uuid = guid();
   


            this.culture.spawn(index, data.point, data.radius*scale, color, data.sin, data.neg, uuid, this.culture.data.layer);
            base.spawn(baseIndex, data.point, data.radius*(scale+0.25), baseColor, data.sin, data.neg, uuid, baseData.layer);   //fix

            this.culture.data.spawn.order = false;
            this.culture.connect();
        }
    }

    this.killColony = function() {
        var data = this.culture.data;
        var bool = data.kill.bool;
        var colony = data.kill.colony;

        if (bool) {
            this.culture.data.kill.bool = false;    //reset
            this.culture.data.kill.colony = {};
            var length = this.culture.colonies.length;
            if (length > 1) {
                var id = colony.data.uuid;
                console.log(id);
                var base = cultureArray[0];
                var items = Metagenome.getItems({data:{uuid: id}});
                console.log(items);

                if (items.length !== 0){
                    if (items.length <= 2){
                        console.log(base.data.color.color);
                        var item = Metagenome.getItems({data:{uuid: id, layer: base.data.layer}});
                        console.log(item[0]);
                        if (item) base.kill(item[0]);
                    }
                this.culture.kill(colony);
                }
                this.culture.connect();

            } else {
                 //Organism.killCulture(this.culture);
            }
        }
    }

    this.shareCulture = function(culture1, culture2) {
        //coming
    }
    this.morphCulture = function(){
        if (this.culture.data.color.bool){
            var children = this.culture.group.children;
            var target = this.culture.data.color.newColor ;
            for (var i = children.length - 1; i >= 0; i--) {
                if (children[i].style.fillColor != target){
                        children[i].style.fillColor = target;
                } else {
                    this.culture.data.color.color = target;
                    this.culture.data.color.bool = false;
                    this.culture.group.style.fillColor = target;
                }
            }
            
        }
    }
    this.breath = function(event) {
        var colonies = this.culture.colonies;
        for (var i = colonies.length - 1; i >= 0; i--) {
            var colony = colonies[i];
            var sin = colony.data.sin;
            var neg = colony.data.neg;
            var speed = this.culture.data.breath.speed;
            var depth = this.culture.data.breath.depth;
            var bounds = [colony.bounds.height, colony.bounds.width];
            var amount;


            if (sin) {
                amount = 1+((Math.sin(event.time*1.5)*0.001)*neg);
            } else {
                amount = 1+((Math.cos(event.time*1.5)*0.001)*neg);
            }

            colony.scale(amount);
        }    
            this.culture.connect();
    }
}

var animate = function(event, array) {
    for (var i = array.length - 1; i >= 0; i--) {
        var env = array[i];
            env.breath(event);
            env.morphCulture(event);
            env.killColony(event);
            env.spawnColony(event);
    };
}

//-----------------------------------------
// Initialize function / Population control


var Population = function(metagenome, array) {
    var diversity = randomIntFromInterval(3, 4);    // get number of layers
    var colonies = randomIntFromInterval(2, 4);
    var metagenome = metagenome;
    var array = array;
    var modules= [];
    var initPositions = [];
    var initRadii = [];
    var initScales = [ 1, 0.75, 0.50, 0.25, 0.15];

    for (var i = 0; i < colonies; i++) {    // set init positions and radii
        initPositions.push(genPos(-spread, spread));
        initRadii.push(randomIntFromInterval(minSize, maxSize));
    };
    var colors = colorArray;
    colorIndex = diversity;

    for (var i = colonies - 1; i >= 0; i--) {
       modules.push(guid());
    };

    this.spawnCulture = function(culture, color, positions, radii, scale, layer) {
        for (var i = positions.length - 1; i >= 0; i--) {

            var neg = Math.round(Math.random()) * 2 - 1; //random negative
            var sin = Math.random()<.5; //bool

            culture.attribute(color);
            culture.data.color.color = color;
            culture.group.style.fillColor = color;
            culture.data.scale = scale;
            culture.data.layer = layer;
            culture.spawn(i, positions[i], radii[i]*scale, color, sin, neg, modules[i], layer);
        };
    }
    this.killCulture = function(c) {
        array = [];
    }
    this.start = function() {
        for (var i = diversity-1; i >= 0; i--) {
            var culture = new Culture();
            this.spawnCulture(culture, colors[i], initPositions, initRadii, initScales[i], i);      //randomize color order later
            array.unshift(culture);
            var env = new Environment(culture);
            environments.unshift(env);
            culture.connect();
        }
            metagenome.reverseChildren();
            //array.reverse();
    }
    return this.start();
}

var Organism = new Population(Metagenome, cultureArray);

var God = function (cultures) {
    this.time = 0;
    this.delta = 0;
    this.count = function(n) {
         // .02 because of margin of error w/modulo
        if (this.time%n < .02) {
            if (this.time >= n) return true;
        }
    }
    this.roll = function(odds) {
        var n = Math.floor(Math.random() * odds) + 1;
        if (n == odds) return true;
    }
    this.selectCulture = function() {
        //set lowest to 1 to avoid changing base layer
        var length = cultures.length;
        var n = randomIntFromInterval(1, length-1);
        var culture = cultures[n];
        return culture;
    }
    this.selectColony = function(culture) {
        //set lowest to 1 to avoid changing base layer
        var colonies = culture.colonies;
        var length = colonies.length;
        var colony = colonies[randomIntFromInterval(0, length-1)];
        return colony;
    }
    this.setColony = function(){
        //build new colony parameters
        var p = genPos(-spread, spread);
        var r = randomIntFromInterval(minSize, maxSize);
        var n = Math.round(Math.random()) * 2 - 1; // random negative
        var s = Math.random()<.5; // true false
        var spawn = {bool: true, point: p, radius: r, neg: n, sin: s, order: true};
        return spawn;
    }
    this.populationControl = function(culture) {
        /** add and remove colonies **/
        // check every five seconds
        if(this.count(5)){
            if (Math.random()<.5){
                // create colony
                if (this.roll(1)) {
                    console.log('count');
                    var membrane = cultures[0];
                    var culture = this.selectCulture()
                    var data = this.setColony();
                    //membrane.data.spawn = data;
                    culture.data.spawn = data;
                    globals.value = guid();
                    var element = paper.view.element;
                }
            } else if(this.roll(5)) {
                // kill colony
                    var culture = this.selectCulture();
                    var colony = this.selectColony(culture);
                    culture.data.kill.colony = colony;
                    culture.data.kill.bool = true;
                    globals.value = guid();
            } else if(this.roll(20)){
                    var culture = this.selectCulture();
                    var index = colorIndex;
                    culture.data.color.newColor = colorArray[index];
                    culture.data.color.bool = true;
                    colorIndex = index+1;
                    globals.value = guid();
            } else {

            }
        }
    }
    this.run = function(event){
        this.time = event.time;
        this.delta = event.delta;
        this.populationControl();
    }
}

var controller = new God(cultureArray);





//-----------------------------------------
// Loops


function onResize(event) {
    displayRatio = view.bounds.height/view.bounds.width;    //redraw grid lines
    gridHeight = 10;
    grid.removeChildren();
    drawGridLines(gridHeight/displayRatio, gridHeight, view.bounds, grid);
    grid.selected = false;
    center = view.center;

    spread = Math.floor(view.bounds.height/4); //re-generate max-size based on screen height;
}

function onFrame(event) {
    animate(event, environments);
    controller.run(event);
}




