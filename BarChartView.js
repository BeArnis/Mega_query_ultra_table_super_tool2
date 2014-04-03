BarChartView = function() {
"use strict";


var div,
    node,
    graph;

var that;

var chart_obj;

var svg;

var x, y, xAxis, yAxis;

var xAxis_g, yAxis_g;

var height, width;
var margin = {top: 40, right: 40, bottom: 40, left: 40}

function init(init_div, init_node, init_graph) {
    div = init_div;
    node = init_node;
    graph = init_graph;

    //console.log(node.name, 'BarChartView', 'init')

	x = d3.scale.ordinal();

	
	y = d3.scale.linear();

	xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");

	yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left")
	    .ticks(10, "%");




	var chart_container = d3.select(div).append('div')
		.attr('class', 'chart-container')
		.style('position', 'relative') 
		.style('left', '30px')
		.style('background-color', 'white')
        .style('width', function(node) {
            return node.geometry.width - 60 + 'px';
        })
        .style('height', function(node) {
            return node.geometry.height - 80 + 'px';
        });


	svg = chart_container.append("svg")
		//.attr('transform', 'translate(50,50)')
		.attr('class', 'chart-canvas')
	    .style('background-color', 'white')
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	    .style('background-color', 'white')

    xAxis_g = svg.append("g")
      .attr("class", "x axis")
      

	yAxis_g = svg.append("g")
	  .attr("class", "y axis");




	  


    refresh_view_from_node();
    return that;
}



function refresh_view_from_node() {

	height = node.geometry.height - 180; // in node.geometry also change every margins
	width = node.geometry.width - 160;

	svg.attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom);

	x.rangeRoundBands([0, width], .1);
	y.range([height, 0]);


	xAxis_g
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);
	yAxis_g
		.call(yAxis);

	
    //console.warn('refresh_view_from_node is not implemented');
}

function set_data(data) { // highlight_ids

	var data = [{name: 'A', value: .10 },
	{name: 'B', value: .30 },
	{name: 'C', value: .60 },
	{name: 'D', value: .90 },
	{name: 'E', value: .39 },
	{name: 'F', value: .15 }];


    x.domain(data.map(function(d) { return d.name; }));
    y.domain([0, d3.max(data, function(d) { return d.value;})]);

	xAxis_g
		.call(xAxis);
	yAxis_g
		.call(yAxis);


	svg.selectAll(".bar")
	      .data(data)
	    .enter().append("rect")
	      .attr("class", "bar")
	      .attr("x", function(d) { return x(d.name); })
	      .attr("width", x.rangeBand())
	      .attr("y", function(d) { return y(d.value); })
	      .attr("height", function(d) { return height - y(d.value); });
}

function destroy() { // 
	var element = d3.select(div).select('.chart-container')
    .remove();
    //console.warn('destroy grid is not implemented');
}


that = {
    init: init, // div and graph_node
    destroy: destroy, // nothing, releases 
    refresh_view_from_node: refresh_view_from_node, // refresh 
    set_data: set_data, // load new data
    type: 'BarChartView'
};

return that;
};
