function generate_query(graph, node) {

    var query_template = _.template("" +
        "select distinct ?<%= name %>  <%= column_vars %> \n" +
        "where {\n" +
        "<%= query_body %>\n" +
        "} <%= group_by %> \n" +
        "<%= sort %>");



    var cons = constraint(graph, node, node, [])


    var needs_group_by = false;



    var query_column_names = _.map(node.columns, function(column) {
        if (column.type == 'aggregate') {
            needs_group_by = true;

            if (graph[column.what_to_aggregate].type == 'hyper_edge') { // cheks if what to aggr is a hyper edge, if so we need its connected edge name
                return '(' + column.aggregation_function + '(?' + get_edge_name_fom_hyper(graph, column.what_to_aggregate) + ') AS ?' + column_name_generator(graph, node, column) + ')';
            } else {

                return '(' + column.aggregation_function + '(?' + column.what_to_aggregate + ') AS ?' + column_name_generator(graph, node, column) + ')';
            }

        } else {
            return '?' + column_name_generator(graph, node, column);
        }
    })

    var group_names = _.map(query_column_names, function(col_names) {
        //console.log(col_names[0]);
        if (col_names[0] != '(') {
            return '' + col_names;
        } else return '';

    })


    var query_sort_array = _.chain(node.columns) // geting table name could be a problem
    .filter(function(column) {
        return column.sort == 'ascending' || column.sort == 'descending';
    }) // visus kam ir asc desc
    .map(function(column) {
        //console.log(column);
        if (column.sort == 'ascending' && column.type == 'aggregate') { // only if type == aggregate
            return 'ASC(?' + node.name + '_' + column.what_to_aggregate + ')';
        } else if (column.type == 'aggregate') {
            return 'DESC(?' + node.name + '_' + column.what_to_aggregate + ')';
        } else if (column.sort == 'ascending' && column.type == 'direct') {
            return 'ASC(?' + column_name_generator(graph, node, column) + ')';
        } else {
            return 'DESC(?' + column_name_generator(graph, node, column) + ')';
        }
    })
        .value();

    //console.log(query_sort_array);


    function add_order_by(query_sort_array) {
        if (query_sort_array.length == 0) {
            return '';
        } else {
            return 'order by ' + query_sort_array.join(' ');
        }
    }


    function add_group_by(needs_group_by) {
        if (needs_group_by) {
            return 'group by ?' + node.name + ' ' + group_names.join(' ');
        } else return '';
    }



    //console.log(query_column_names, group_names);
    // ?node.name + colum_vars(but not all)  hmmm???
    //  + 'group by ?' + node.name
    var query = query_template({
        name: node.name,
        column_vars: query_column_names.join(' '),
        query_body: cons,
        group_by: add_group_by(needs_group_by),
        sort: add_order_by(query_sort_array)
    })

    return query;
}

function constraint(graph, elem, from_elem, visited) {

    var patterns = [];
    switch (elem['type']) {
        case 'node':
            var node = elem;
            //console.log(elem.name);
            if (elem == from_elem) { // need to ignore local selection
                patterns.push(local_filter(graph, node));
                patterns.push(local_column_queries(graph, node));
            } else {
                patterns.push(local_constraint(graph, node));
            }

            visited.push(node.name);
            _.each(node['incoming_lines'], function(line_id) {
                //console.log('mm', visited);
                if (!_.include(visited, line_id)) {
                    patterns.push(constraint(graph, graph[line_id], node, visited));
                }
            });
            break;
        case 'edge':
            var edge = elem;
            //console.log(elem.name);
            if (elem == from_elem) {
                //console.log('ee', elem.name);
                patterns.push(local_filter(graph, edge));
            } else {
                patterns.push(local_constraint(graph, edge));
            }

            visited.push(edge.name);
            if (!_.include(visited, edge.start)) {
                //console.log('ee', elem.name);
                patterns.push(constraint(graph, graph[edge.start], edge, visited));
            }
            if (!_.include(visited, edge.end)) {
                patterns.push(constraint(graph, graph[edge.end], edge, visited));
            }

            _.each(edge['incoming_lines'], function(line_id) {
                //console.log('hh');
                if (!_.include(visited, line_id)) {
                    patterns.push(constraint(graph, graph[line_id], edge, visited));
                }
            });
            break;
        case 'hyper_edge':
            var hyper_edge = elem;
            //console.log(elem.name);
            visited.push(hyper_edge.name);

            if (!_.include(visited, hyper_edge.start)) {
                patterns.push(constraint(graph, graph[hyper_edge.start], hyper_edge, visited));
            }
            if (!_.include(visited, hyper_edge.end)) {
                patterns.push(constraint(graph, graph[hyper_edge.end], hyper_edge, visited));
            }

            // from dirrection add filter
            var hyp = _.difference([hyper_edge.start, hyper_edge.end], [from_elem.name])[0]



            patterns.push('FILTER (' + elem_var_str(from_elem.name) + ' = ' + elem_var_str(hyp) + ') .');

            break;
        default:
            console.error("unknown elem type!");
    }
    return patterns.join('\n');
}



function local_filter(graph, node) {
    console.log(graph, node)
    var pattern = '';
    var type_filter_input = get_type_filter_input(graph, node);
    //console.log(type_filter_input);
    if (type_filter_input) {

        pattern = '?' + node.name + ' a <' + type_filter_input + '> .\n';

    } else {
        patter_template = _.template('{ ?<%= name %> ?p ?o } UNION { ?s' + ' ?<%= name %>  ?o } UNION {?s ?p ?<%= name %> } .');

        pattern = patter_template({
            name: node.name
        });
    }

    return pattern;
}



function get_type_filter_input(graph, node) { // lot of change
    if (_.isString(node['query_param']) && node['query_param']['input'].lenght > 0) {
        return node['query_param']['input'];
    } else {
        return null;
    }
}

function local_column_queries(graph, node) {
    return _.map(node.columns, function(column) {
        if (column.property_name == undefined) {
            return;
        } else {

            return 'OPTIONAL { ?' + node.name + '  ' + column.property_name + '  ?' + column_name_generator(graph, node, column) + ' . } .';
        }
    }).join('\n');
}

function local_constraint(graph, elem) {

    var pattern = '';
    switch (elem['type']) {
        case 'node':
            var node = elem;
            //console.log('mm');

            pattern = local_filter(graph, node) + '\n' + local_selection(graph, node);
            break;
        case 'edge':
            var edge = elem;
            pattern = elem_var_str(edge.start) + ' ' + elem_var_str(edge.name) + ' ' + elem_var_str(edge.end) + ' .'; // undef problem
            break;
        case 'hyper_edge':
            // nothing for hyper edge
            break;
        default:
            console.error("unknown elem type!");
    }
    return pattern;
}

function elem_var_str(elem) {
    return '?' + elem; // does not work with edges
}


function local_selection(graph, node) {


    var selection_obj_arr = node['query_param']['selection'];

    var new_selection = _.map(selection_obj_arr, function(item) {
        if (item.type == 'uri') {
            return '<' + item.value + '>';
        } else {
            return '"' + item.value + '"';
        }

    })

    var selection = new_selection.join('');

    //console.log(new_selection, selection);
    if (node['query_param']['selection'].length == 0) { // change
        var patern = ''
    } else {
        var patern = 'values ?' + node.name + ' { ' + selection + ' } .\n';
    }

    return patern;
}