function get_edge_name_fom_hyper(graph, elem) {
    //console.log(graph, elem, graph[elem]);
    if (graph[elem]['start'].type == 'edge') { // one end of a hyper edge is always a an edge

        return graph[elem]['start'];
    } else {
        //console.log(graph[elem]['end'], elem);
        return graph[elem]['end'];
    }
}

function column_name_generator(node, column) { // column.what_to_aggregate '(' + column.aggregation_function + '(?' + column.what_to_aggregate + ') AS ?' + xxx  +')'

    var i = _.indexOf(node.columns, column);
    if (column.type == 'aggregate') {

        if (example_graph[column.what_to_aggregate].type == 'hyper_edge') { // cheks if what to aggr is a hyper edge, if so we need its connected edge name
            return node.name + '_' + get_edge_name_fom_hyper(example_graph, column.what_to_aggregate);

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