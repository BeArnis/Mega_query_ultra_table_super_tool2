BarChartView = function() {
"use strict";


var div,
    node,
    graph;

var that;

var chart_obj;

function init(init_div, init_node, init_graph) {
    div = init_div;
    node = init_node;
    graph = init_graph;

    console.log(node.name, 'BarChartView', 'init')

    var data = [{name: 'A', value: .10 },
	{name: 'B', value: .30 },
	{name: 'C', value: .60 },
	{name: 'D', value: .90 },
	{name: 'E', value: .39 },
	{name: 'F', value: .15 }];


	var margin = {top: 40, right: 40, bottom: 40, left: 40},
	    width = 950 - margin.left - margin.right,
	    height = 420 - margin.top - margin.bottom;

	var x = d3.scale.ordinal()
	    .rangeRoundBands([0, width], .1);

	
	var y = d3.scale.linear()
	    .range([height, 0]);

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left")
	    .ticks(10, "%");


	    x.domain(data.map(function(d) { return d.name; }));
	    y.domain([0, d3.max(data, function(d) { return d.value;})]);

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


	var svg = chart_container.append("svg")
		//.attr('transform', 'translate(50,50)')
		.attr('class', 'chart-canvas')
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	    
	    .style('background-color', 'white')
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	    .style('background-color', 'white')


	  svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);

	  svg.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)
	    .append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end");

	  svg.selectAll(".bar")
	      .data(data)
	    .enter().append("rect")
	      .attr("class", "bar")
	      .attr("x", function(d) { return x(d.name); })
	      .attr("width", x.rangeBand())
	      .attr("y", function(d) { return y(d.value); })
	      .attr("height", function(d) { return height - y(d.value); });


    refresh_view_from_node();
    return that;
}



function refresh_view_from_node() {


    console.warn('refresh_view_from_node is not implemented');
}

function set_data(data) { // highlight_ids
   console.warn('set_data is not implemented');
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
