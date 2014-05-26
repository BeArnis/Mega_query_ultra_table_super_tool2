
// selection functions
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



function selection_to_obj(selection, obj_arr, node) {
    var return_value = [];

    return_value = _.filter(obj_arr, function(obj) {

        if (_.contains(selection, obj[node.name]['value'])) {
            return;
        }

        if (return_value.length == 0) {
            return [];
        } else {
            return return_value; // need better neme
        }
    });
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

function obj_equal(obj_1, obj_2) {
    var dif1_value_arr = get_selection_values(obj_1);
    var dif2_value_arr = get_selection_values(obj_2);

    return _.isEmpty(_.difference(dif1_value_arr, dif2_value_arr)) && _.isEmpty(_.difference(dif2_value_arr, dif1_value_arr));
}
//***//


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


function updateEdgeCoordinates(graph, node1_geo, node2_goe, ah, link_name) {
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

 


    // gets max element value from graph elements
    // works with nodes and edge type elements
function get_max_element_number(graph, element) {

    var node_num = _.chain(graph)
        .filter(function(obj) {
            // gets all elements of the specified type
            if (obj['type'] == element) {
                return obj.name;
            }
        })
        .map(function(node_name) {
            // gets all element numbers
            var patt = /(\d)+/g;
            var s = patt.exec(node_name.name)[0];
            s = parseInt(s);
            return s;
        })
        .max() 
        .value();
    node_num = parseInt(node_num);
    node_num = node_num + 1;
    if (node_num) {
        return node_num;
    } else {
        return '0';
    }

}

function guid() { // taken from http://stackoverflow.com/a/2117523
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function delete_column_on_elem_deletion(graph, elem_name) {

    var nodes = _.map(graph, function(obj)  {
        if (obj.type == 'node') {
            return obj;
        }
    });

    _.each(nodes, function(node) {
        if (node == undefined) {
            return;
        }
        // all nodes
        _.each(node.columns, function(column) {
            // all columns
            
            console.log(node.columns, column)
            if (column.what_to_aggregate == elem_name) {
                delete_column(graph, node, column)

            }
            
        })
    })

}
