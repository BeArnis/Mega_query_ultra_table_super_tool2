function get_edge_name_fom_hyper(graph, elem) {


    //console.log(graph, elem, graph[elem]);
    if (graph[elem]['start'].type == 'edge') { // one end of a hyper edge is always a an edge

        return graph[elem]['start'];
    } else {
        //console.log(graph[elem]['end'], elem);
        return graph[elem]['end'];
    }
}

function column_name_generator(graph, node, column) { // column.what_to_aggregate '(' + column.aggregation_function + '(?' + column.what_to_aggregate + ') AS ?' + xxx  +')'

    //console.log(node, column)
    var i = _.indexOf(node.columns, column);
    if (column.type == 'aggregate') {

        if (graph[column.what_to_aggregate].type == 'hyper_edge') { // cheks if what to aggr is a hyper edge, if so we need its connected edge name
            return node.name + '_' + get_edge_name_fom_hyper(graph, column.what_to_aggregate);

        }

        return node.name + '_' + column.what_to_aggregate; // needs groupp by at the end / how?
    }
    return node.name + '_col_' + (i + 1);
}

function get_selection_values(selection_obj, node) { // selection is an array
    if (!_.isArray(selection_obj)) {
        var arr = [selection_obj];
    } else {
        var arr = selection_obj;
    }
    var selection_value_array = _.pluck(arr, 'value'); // XXXXX
    //console.log(selection_obj, selection_value_array);
    if (selection_value_array.length == 0) {
        return [];
    }
    //console.log(selection_obj, selection_value_array);
    return selection_value_array;
}

function guid() { // taken from http://stackoverflow.com/a/2117523
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function obj_equal(obj_1, obj_2) { // nedarbojas pareizi
    var dif1_value_arr = get_selection_values(obj_1);
    var dif2_value_arr = get_selection_values(obj_2);

    //console.log(dif1_value_arr, dif2_value_arr, ' || ', obj_1, obj_2, _.isEmpty(_.difference(dif1_value_arr, dif2_value_arr)) && _.isEmpty(_.difference(dif2_value_arr, dif1_value_arr)));

    return _.isEmpty(_.difference(dif1_value_arr, dif2_value_arr)) && _.isEmpty(_.difference(dif2_value_arr, dif1_value_arr));
}







function selection_intersection(A, B) { // A is first selection obj and B is secong obj
    if (A.length == 0) {
        return [];
    }

    var intersect = _.reduce(A, function(intersection_so_far, a) {
        if (_.find(B, function(b) {
            return _.isEqual(a, b);
        })) {
            intersection_so_far.push(a);
            return intersection_so_far;
        } else {
            return intersection_so_far;
        }
    }, []);

    //console.log(intersect);

    return intersect;
}



function rayIntersection(graph, source, target, rect) {
    //console.log(graph, source, target, rect);
    var x1 = source.x;
    var y1 = source.y;
    var x2 = target.x;
    var y2 = target.y;
    //var rect =  graph[node2]['geometry'];
    var rectx = rect['x'];
    var rectX = rect['x'] + rect['width'];
    var recty = rect['y'];
    var rectY = rect['y'] + rect['height'];
    var sides = [
        [rectx, recty, rectX, recty],
        [rectX, recty, rectX, rectY],
        [rectX, rectY, rectx, rectY],
        [rectx, rectY, rectx, recty]
    ];

    for (var i = 0; i < 4; ++i) {
        var r = lineIntersection(x1, y1, x2, y2, sides[i][0], sides[i][1], sides[i][2], sides[i][3]);
        if (r !== null) return {
            x: r.x,
            y: r.y
        }; // ?
    }
    return null;
}

function updateEdgeCoordinates(graph, node1_geo, node2_goe, ah, link_name) { //????????
    //console.log(graph, node1_geo, node2_goe, ah);
    var source_center = get_middle_point(node1_geo);
    var target_center = get_middle_point(node2_goe);


    var si = rayIntersection(graph, source_center, target_center, node1_geo);
    if (!si)
        si = {
            x: source_center.x,
            y: source_center.y
        }; //?

    var ti = rayIntersection(graph, target_center, source_center, node2_goe);
    if (!ti)
        ti = {
            x: target_center.x,
            y: target_center.y
        }; // ?

    var dx = ti.x - si.x,
        dy = ti.y - si.y,
        l = Math.sqrt(dx * dx + dy * dy);
    var al = l - ah;

    var arrowstart = {
        x: si.x + al * dx / l,
        y: si.y + al * dy / l
    };
    graph[link_name]['geometry']['x1'] = si.x;
    graph[link_name]['geometry']['y1'] = si.y;
    graph[link_name]['geometry']['x2'] = ti.x;
    graph[link_name]['geometry']['y2'] = ti.y;
}

function get_middle_point(node1_geo) {

    //console.log(node1_geo);

    if (node1_geo.width != undefined) {
        var x = node1_geo.width / 2 + node1_geo.x;
        var y = node1_geo.height / 2 + node1_geo.y;
        var center = {
            x: x,
            y: y
        };
        return center;
    } else {
        //console.log(node1_geo);
        var x = Math.min(node1_geo.x2, node1_geo.x1) + Math.abs((node1_geo.x2 - node1_geo.x1) / 2);
        var y = Math.min(node1_geo.y2, node1_geo.y1) + Math.abs((node1_geo.y2 - node1_geo.y1) / 2);
        var center = {
            x: x,
            y: y
        };
        return center;
    }

}

function lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
    //console.log(x1, y1, x2, y2, x3, y3, x4, y4);
    var dx12 = x2 - x1,
        dx34 = x4 - x3,
        dy12 = y2 - y1,
        dy34 = y4 - y3,
        denominator = dy34 * dx12 - dx34 * dy12;
    if (denominator == 0) return null;
    var dx31 = x1 - x3,
        dy31 = y1 - y3,
        numa = dx34 * dy31 - dy34 * dx31,
        a = numa / denominator,
        numb = dx12 * dy31 - dy12 * dx31,
        b = numb / denominator;
    if (a >= 0 && a <= 1 && b >= 0 && b <= 1) {
        return {
            x: x1 + a * dx12,
            y: y1 + a * dy12
        };
    }
    return null;
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

    //console.log(need_to_delete_these_edges);
    //delete_edges_after_nodes(graph, need_to_delete_these_edges);

    //console.log(need_to_delete_these_edges);
    //graph = _.omit(graph, node.name);
    //console.log(node.name, graph);
    render_graph(graph);
    fill_tables(graph);
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