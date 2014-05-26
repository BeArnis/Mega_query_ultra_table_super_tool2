// makes markers at the end of all edges
function make_marker() {

        var edge_container = this;
        edge_container.selectAll('marker')
            .remove();

        // marker for normal edges
        var end_marker = edge_container.append('marker')
        .attr('id', 'link_path_end')
            .classed('edge_marker', true)
            .attr('viewBox', '-10 -5 10 10')
            .attr('refX', -2)
            .attr('refY', 0)
            .attr('markerWidth', 4)
            .attr('markerHeight', 3)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M-10,-5L0,0L-10,5');

        // end marker for what_to_aggregate edges who can be toggled
        var end_red_marker = edge_container.append('marker')
            .attr('id', 'link_path_end_red')
            .classed('edge_marker_end', true)
            .attr('viewBox', '-10 -5 10 10')
            .attr('refX', -2)
            .attr('refY', 0)
            .attr('markerWidth', 4)
            .attr('markerHeight', 4)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M-10,-5L0,0L-10,5');

        // end marker for what_to_aggregate edges
        var start_marker = edge_container.append('marker')
            .attr('id', 'link_path_start')
            .classed('edge_marker_start', true)
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 2)
            .attr('refY', 0)
            .attr('markerWidth', 4)
            .attr('markerHeight', 4)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M10,-5L0,0L10,5');


}


function event_for_making_edge1(graph) {

    // gets containers and elements
    var container = d3.select('#query-graph-container');
    var nodes = container.selectAll('.query-node');

    var edges = d3.select('.edge_canvas').selectAll('.query-edge');

    edges.on('click', function(edge) {
        console.log('click_edge1');
        event_for_making_edge2(graph, edge, edge.type);

    });


    nodes.on('click', function(node) {
        console.log('click_node1');
        event_for_making_edge2(graph, node, node.type);

    });
    console.log(nodes, edges);
}

function event_for_making_edge2(graph, elem, type) {


    var container = d3.select('#query-graph-container');
    var nodes = container.selectAll('.query-node');
    var edges = d3.select('.edge_canvas').selectAll('.query-edge');

    // needs some adjustments
    var finish_making_edge = function(node2) {
        if (elem.name == node2.name) {
            return;
        } else if (type == 'edge' || type == 'hyper_edge') {
            draw_edge(graph, elem, node2);
            d3.event.stopPropagation();
            nodes.on('click', null);
            edges.on('click', null);
        } else {
            draw_edge(graph, elem, node2);
            d3.event.stopPropagation();
            nodes.on('click', null);
            edges.on('click', null);

            return;
        }
    }

    

    if (type == 'edge' || type == 'hyper_edge') {
        console.log('not this');
        nodes.on('click', finish_making_edge)
    } else {
        console.log('yes this');
        edges.on('click', finish_making_edge);
        nodes.on('click', finish_making_edge);
    }

    
}

function draw_edge(graph, elem1, elem2) {

    //console.log(node, node2);
    if (_.intersection(elem1.incoming_lines, elem2.incoming_lines).length != 0) {
        console.log('del');
        return;
    }

    if (elem1.type == 'edge' || elem2.type == 'edge') {
        var edge_name = 'hl' + get_max_element_number(graph, 'edge')
    } else {
        var edge_name = 'l' + get_max_element_number(graph, 'edge') 
    }

    var edge = edge_name;
    if (elem1.type == 'node') {
        var x1 = elem1['geometry']['x'];
        var y1 = elem1['geometry']['y'];
    } else {
        var elem1_short = elem1['geometry'];
        var x1 = Math.min(elem1_short.x2, elem1_short.x1) + Math.abs((elem1_short.x2 - elem1_short.x1) / 2);
        var y1 = Math.min(elem1_short.y2, elem1_short.y1) + Math.abs((elem1_short.y2 - elem1_short.y1) / 2);
    }

    if (elem2.type == 'node') {
        var x2 = elem2['geometry']['x'];
        var y2 = elem2['geometry']['y'];
    } else {
        var elem2_short = elem2['geometry'];
        var x2 = Math.min(elem2_short.x2, elem2_short.x1) + Math.abs((elem2_short.x2 - elem2_short.x1) / 2);
        var y2 = Math.min(elem2_short.y2, elem2_short.y1) + Math.abs((elem2_short.y2 - elem2_short.y1) / 2);
    }


    if (elem1.type == 'edge' || elem2.type == 'edge') {
        edge_template = {
            'name': edge_name,
            'query_var_name': edge_name,
            'incoming_lines': [],
            'geometry': {
                'x1': x1,
                'y1': y1,
                'x2': x2,
                'y2': y2
            },
            'start': elem1.name,
            'end': elem2.name,
            'type': 'hyper_edge'
        }
    } else {
        edge_template = {
            'name': edge_name,
            'query_var_name': edge_name,
            'incoming_lines': [],

            'geometry': {
                'x1': x1,
                'y1': y1,
                'x2': x2,
                'y2': y2
            },
            'start': elem1.name,
            'end': elem2.name,
            'type': 'edge'
        };
    }



    graph[elem1.name]['incoming_lines'].push(edge_name);
    graph[elem2.name]['incoming_lines'].push(edge_name);

    graph[edge_name] = edge_template;
    updateEdgeCoordinates(graph, elem1['geometry'], elem2['geometry'], 5, edge_name);

    render_graph(graph);
    fill_tables(graph);

}

function get_edge_name_fom_hyper(graph, elem) {


    if (graph[elem]['start'].type == 'edge') { // one end of a hyper edge is always a an edge

        return graph[elem]['start'];
    } else {

        return graph[elem]['end'];
    }
}

function toggleWay(graph, edge) {

        var start_node = edge['start'];
        var end_node = edge['end'];

        //console.log('swap', edge.name, graph[start_node], graph[end_node]);

        if ((_.contains(graph[start_node]['incoming_lines'], edge.name)) && !(_.contains(graph[end_node]['incoming_lines'], edge.name))) {
            graph[start_node]['incoming_lines'] = _.without(graph[start_node]['incoming_lines'], edge.name);

            graph[end_node]['incoming_lines'].push(edge.name);


        } else if (!(_.contains(graph[start_node]['incoming_lines'], edge.name)) && (_.contains(graph[end_node]['incoming_lines'], edge.name))) {
            graph[start_node]['incoming_lines'].push(edge.name);


        } else if ((_.contains(graph[start_node]['incoming_lines'], edge.name)) && (_.contains(graph[end_node]['incoming_lines'], edge.name))) {
            graph[start_node]['incoming_lines'] = _.without(graph[start_node]['incoming_lines'], edge.name);
            graph[end_node]['incoming_lines'] = _.without(graph[end_node]['incoming_lines'], edge.name);



        } else if (!(_.contains(graph[start_node]['incoming_lines'], edge.name)) && !(_.contains(graph[end_node]['incoming_lines'], edge.name))) {
            graph[start_node]['incoming_lines'].push(edge.name);



        }
        render_graph(graph)
        fill_tables(graph);
}


function delete_edge(graph, prime_edge) {


        graph[prime_edge.start]['incoming_lines'] = _.without(graph[prime_edge.start]['incoming_lines'], prime_edge.name);
        graph[prime_edge.end]['incoming_lines'] = _.without(graph[prime_edge.end]['incoming_lines'], prime_edge.name);
        
        if (prime_edge.incoming_lines.length != 0) {

            _.each(prime_edge.incoming_lines, function(hyp) {
                delete_edge(graph, graph[hyp]);
            })

        }

        delete graph[prime_edge.name];



    render_graph(graph);
    fill_tables(graph);
}



