//-----------------------------------------------------
// Draw grid lines

var center = view.center;

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

var grid = new Layer({
    strokeColor: 'black'
});


//-----------------------------------------------------
// Create metagenome

var Metagenome = function(){
    var Sequence = new Layer();
}


function onResize(event) {
    var displayRatio = view.bounds.height/view.bounds.width;    //redraw grid lines
    var gridHeight = 10;
    grid.removeChildren();
    var new_grid_lines = new drawGridLines(gridHeight/displayRatio, gridHeight, view.bounds);
    //grid.addChildren([new_grid_lines]);
}



