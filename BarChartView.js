BarChartView = function() {
    "use strict";

    var div,
        node,
        graph;

    // that???
    var that;

    var chart_obj;

    var svg;

    var x, y, xAxis, yAxis;

    var xAxis_g, yAxis_g;

    var height, width;
    var margin = {
        top: 40,
        right: 40,
        bottom: 40,
        left: 40
    };

    var brush, brush_g;

    var bar_start_and_end_coord_x;

    var data;

    var chart_container;


    function init(init_div, init_node, init_graph) {
        div = init_div;
        node = init_node;
        graph = init_graph;


        x = d3.scale.ordinal();


        y = d3.scale.linear();

        xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(10)




        chart_container = d3.select(div).append('div')
            .attr('class', 'chart-container')
            .style('position', 'relative')
            .style('left', '30px')
            .style('width', function(node) {
                return node.geometry.width - 60 + 'px';
            })
            .style('height', function(node) {
                return node.geometry.height - 80 + 'px';
            });


        svg = chart_container.append("svg")
        //.attr('transform', 'translate(50,50)')
        .attr('class', 'chart-canvas')
        // .style('background-color', 'white')
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

        xAxis_g = svg.append("g")
            .attr("class", "x axis")



        yAxis_g = svg.append("g")
            .attr("class", "y axis");


        brush = d3.svg.brush()
            .on("brushend", brushend)
            .on("brushstart", brushstart)
            .on("brush", brushmove);



        //create
        brush_g = svg.append("g")
            .attr("class", "brush");

        brush_g
            .append('rect');




        refresh_view_from_node();


        return that;
    }


    function brushstart() {}

    function brushmove() {

    }

    function brushend() {

        console.log(brush.extent());
        //svg.classed("selecting", !d3.event.target.empty());
        if (!d3.event.sourceEvent) return; // only transition after input
        var extent0 = brush.extent(),
            extent1 = [];

        // if empty when rounded, use floor & ceil instead

        var selected = x.domain().filter(function(d) {
            return (brush.extent()[0] - x.rangeBand() <= x(d)) && (x(d) <= (brush.extent()[1]))
        });

        var bar_obj_selection = _.chain(data)
            .filter(function(d) {
                return _.indexOf(selected, d[node.name].value) != -1;
            })
            .pluck(node.name)
            .value();

        console.log('d', bar_obj_selection);
        extent1[0] = x(selected[0]);
        extent1[1] = x(selected[selected.length - 1]) + x.rangeBand();

        //console.log(node.query_param.selected);
        //console.log(selected, node.query_param['selected']);

        d3.select(this).transition()
            .call(brush.extent(extent1))
            .call(brush.event)


        if (!obj_equal(bar_obj_selection, node.query_param['selection'])) {
            node.query_param['selection'] = bar_obj_selection; // add selected to node
            // rect.remove();
            fill_tables(graph);
        };
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


        if (data) {
            set_data(data);
        }
        chart_container
            .style('width', function(node) {
                return node.geometry.width - 60 + 'px';
            })
            .style('height', function(node) {
                return node.geometry.height - 80 + 'px';
            });

        //console.warn('refresh_view_from_node is not implemented');
    }

    function set_data(new_data) { // highlight_ids
        data = new_data;

        //console.log(data);

        var column = _.find(node.columns, function(column) {
            return column.id == node.visualization_defs.BarChartView.properties.y_axis_column;
        })
        var column_name = column_name_generator(graph, node, column);
        console.log(column_name, column);


        function get_x_value(d) {
            //console.log(d[node.name].value)
            var data_value = d[node.name].value;
            var matching_prefix_def = _(graph.prefixes).find(function(prefix_def) {
            //console.log(value, prefix_def.namespace.length)
            return data_value.substring(0, prefix_def.namespace.length) === prefix_def.namespace;
            });

            if (matching_prefix_def) {
                return data_value.replace(matching_prefix_def.namespace, '');
            } else {
                return data_value;
            }
            //return d[node.name].value;
        }

        function get_y_value(d) {

            return parseInt(d[column_name].value);
        }


        var xmap = x.domain(data.map(get_x_value));
        var ymap = y.domain([0, d3.max(data, get_y_value)]);

        xAxis_g
            .call(xAxis);
        yAxis_g
            .call(yAxis);

        // bind
        var bars = svg.selectAll(".bar")
            .data(data)

        //create
        bars.enter()
            .append("rect")
            .classed('bar', true)



        //update
        bars.attr("x", function(d) {
            return x(get_x_value(d));
        })
            .attr("width", x.rangeBand())
            .attr("y", function(d) {
                return y(get_y_value(d));
            })
            .attr("height", function(d) {
                return height - y(get_y_value(d));
            })
            .classed('selected_bar', function(bar) {
                //console.log(_.pluck(node.query_param.selection, 'value'), bar[node.name].value)
                return _.contains(_.pluck(node.query_param.selection, 'value'), bar[node.name].value)
            });

        //remove
        bars.exit().remove();


        //
        // BRUSH UPDATE


        var values = _.chain(data)
            .pluck(node.name)
            .pluck('value')
            .value();

        var selected = _.chain(node['query_param']['selection'])
            .pluck('value')
            .sortBy(function(val) {
                return _.indexOf(values, val);
            })
            .value();


        console.log('selected', selected, [
            x(selected[0]),
            x(selected[selected.length - 1])
        ]);

        var extent = [
            x(selected[0]),
            x(selected[selected.length - 1]) + x.rangeBand()
        ];


        brush.x(x)
            .extent(extent);

        brush_g
            .call(brush)
            .selectAll("rect")
            .attr("height", height);



    }

    function destroy() { // 
        var element = d3.select(div).select('.chart-container')
            .remove();
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


