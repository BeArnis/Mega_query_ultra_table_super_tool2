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


    // make chart here 


    refresh_view_from_node();
    return that;
}



function refresh_view_from_node() {
    console.warn('refresh_view_from_node is not implemented');
}

function set_data(data) { // highlight_ids
   console.warn('set_data is not implemented');
}

function destroy() {
    console.warn('destroy grid is not implemented');
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
