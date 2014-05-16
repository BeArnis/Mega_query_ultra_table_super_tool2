function make_node(graph, x, y) {

    var table_name;

    // gets new name for node
    table_name = 't' + get_max_element_number(graph, 'node');


    // node template that will go into query_graph
    var temp = {
        'name': table_name,
        'query_var_name': table_name,
        'type': 'node',
        'incoming_lines': [],
        'query_param': {
            'type_arr': [],
            'current_type': null,
            'selection': []
        },
        'geometry': {
            'x': x,
            'y': y,
            'width': 1010,
            'height': 500
        },
        // must be one of keys in visualization_defs
        'active_visualization_type': 'TableView',
        'visualization_defs': {
            'TableView': {

            },
            'BarChartView': {
                'properties': {
                    'y_axis_column': '??'
                }
            }
        },
        'columns': [
        ]
    };
    // adds element to query_graph
    graph[table_name] = temp;

    // refreshes all views
    render_graph(graph);
    fill_tables(graph);
}








function destroy_node(graph, node) {
    //console.log(node.name, graph);

    var edges = _.filter(graph, function(obj) {
        if (obj['type'] == 'edge') {
            return obj;
        }
    });

    var hyper_edges = _.filter(graph, function(obj) {
        if (obj['type'] == 'hyper_edge') {
            return obj;
        }
    });

    delete graph[node.name];

    var need_to_delete_these_edges = [];
    _.each(edges, function(edge) {

        if (edge.start == node.name) {
            graph[edge.end]['incoming_lines'] = _.without(graph[edge.end]['incoming_lines'], edge.name);
            delete graph[edge.name];
            return;
        }
        if (edge.end == node.name) {
            //console.log(edge.start, node.name);
            graph[edge.start]['incoming_lines'] = _.without(graph[edge.start]['incoming_lines'], edge.name);
            delete graph[edge.name];
            return;
        }
    })

    _.each(hyper_edges, function(hyp) {

        if (graph[hyp.start] == undefined) {
            graph[hyp.end]['incoming_lines'] = _.without(graph[hyp.end]['incoming_lines'], hyp.name);
            delete graph[hyp.name];
        } else if (graph[hyp.end] == undefined) {
            graph[hyp.start]['incoming_lines'] = _.without(graph[hyp.start]['incoming_lines'], hyp.name);
            delete graph[hyp.name];
        }

    })


    render_graph(graph);
    fill_tables(graph);
}


function change_node_size(graph, node, dx, dy) {
    var new_width = node.geometry.width + dx;
    var new_height = node.geometry.height + dy;

    node.geometry.width = _.max([new_width, 350]);
    node.geometry.height = _.max([new_height, 400]);
}
