function generate_query(graph, node) {

    var query_template = _.template("" +
        "select distinct ?<%= name %>  <%= column_vars %> \n" +
        "where {\n" +
        "\t<%= query_body %>\n" +
        "\n\n\tFILTER (!isBlank(?<%= name %>)) .\n" +
        "\t<%= column_queries %>\n" +
        "}\t<%= group_by %> \n" +
        "\t<%= sort %>");



    var equivalent_map = {};

    var cons = constraint(graph, node, node, [], equivalent_map);


    var needs_group_by = false;



    var query_column_names = _.map(node.columns, function(column) {
        if (column.type == 'aggregate') {
            needs_group_by = true;

            //what if aggregation is not on edge????

            // cheks if what to aggr is a hyper edge, if so we need its connected edge name
            if (graph[column.what_to_aggregate].type == 'hyper_edge') { 
                return '(' + column.aggregation_function + '(' + elem_var_str(get_edge_name_fom_hyper(graph, column.what_to_aggregate), equivalent_map) + ') AS ?' + column_name_generator(graph, node, column) + ')';
            } else {

                return '(' + column.aggregation_function + '(' + elem_var_str(column.what_to_aggregate, equivalent_map) + ') AS ?' + column_name_generator(graph, node, column) + ')';
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
        if (column.sort == 'ascending') { // only if type == aggregate
            return 'ASC(?' + column_name_generator(graph, node, column) + ')';
        } else if (column.sort == 'descending') {
            return 'DESC(?' + column_name_generator(graph, node, column) + ')';
        } else {
            console.error("unknown column sort type")
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

    function selected_type_in_query(graph, node) {
        if (node.query_param.current_type == null || node.query_param.current_type == 'all') {
            return;
        } else {
            return '?' + node.name + ' a <' + node.query_param.current_type + '>';
        }
    }

    //console.log(query_column_names, group_names);
    // ?node.name + colum_vars(but not all)  hmmm???
    //  + 'group by ?' + node.name
    var query = query_template({
        name: node.name,
        column_vars: query_column_names.join(' '),
        query_body: cons,
        column_queries: local_column_queries(graph, node, {}),
        group_by: add_group_by(needs_group_by),
        sort: add_order_by(query_sort_array)
    })

    return query;
}

function constraint(graph, elem, from_elem, visited, equivalent_map, is_type_constraint) {
    var patterns = ['\n# ' + elem.name + ' ->'];
    if (!equivalent_map[elem.name]) {
        equivalent_map[elem.name] = elem.name;
    }
    switch (elem['type']) {
        case 'node':
            var node = elem;
            if (elem == from_elem) { // need to ignore local selection
                patterns.push(local_filter(node, equivalent_map));
            } else {
                patterns.push(local_constraint(graph, node, equivalent_map));
                patterns.push('FILTER (!isBlank(' + elem_var_str(node.name, equivalent_map) + '))')
            }

            visited.push(node.name);
            _.each(node['incoming_lines'], function(line_id) {
                //console.log('mm', visited);
                if (!_.include(visited, line_id)) {
                    patterns.push(constraint(graph, graph[line_id], node, visited, equivalent_map));
                }
            });
            break;
        case 'edge':
            var edge = elem;
            //console.log(elem.name);
            if (elem == from_elem) {
                //console.log('ee', elem.name);
                patterns.push(local_filter(edge, equivalent_map));
            } else {
                patterns.push(local_constraint(graph, edge, equivalent_map));
            }

            visited.push(edge.name);
            if (!_.include(visited, edge.start)) {
                //console.log('ee', elem.name);
                patterns.push(constraint(graph, graph[edge.start], edge, visited, equivalent_map));
            }
            if (!_.include(visited, edge.end)) {
                patterns.push(constraint(graph, graph[edge.end], edge, visited, equivalent_map));
            }

            _.each(edge['incoming_lines'], function(line_id) {
                //console.log('hh');
                if (!_.include(visited, line_id)) {
                    patterns.push(constraint(graph, graph[line_id], edge, visited, equivalent_map));
                }
            });
            break;
        case 'hyper_edge':
            var hyper_edge = elem;
            //console.log(elem.name);
            visited.push(hyper_edge.name);

            var to_elem_name = _.difference([hyper_edge.start, hyper_edge.end], [from_elem.name])[0];

            // mark that hyper_edge target end should be considered as 
            // if its the same as src
            equivalent_map[to_elem_name] = from_elem.name;

            if (!_.include(visited, hyper_edge.start)) {
                patterns.push(constraint(graph, graph[hyper_edge.start], hyper_edge, visited, equivalent_map));
            }
            if (!_.include(visited, hyper_edge.end)) {
                patterns.push(constraint(graph, graph[hyper_edge.end], hyper_edge, visited, equivalent_map));
            }

            // patterns.push('FILTER (' + elem_var_str(from_elem.name, equivalent_map) + ' = ' + elem_var_str(to_elem_name, equivalent_map) + ') .');

            break;
        default:
            console.error("unknown elem type!");
    }
    return patterns.join('\n\t');
}



function local_filter(node, equivalent_map) {
    var pattern = '';
    var type_filter_input = get_type_filter_input(node);
    //console.log(type_filter_input);
    if (type_filter_input) {
        
        pattern = elem_var_str(node.name, equivalent_map) + ' a <' + type_filter_input + '> .\n';

    } else if (_.isEmpty(node.incoming_lines)) {
        // TODO FIXME : should we use equivalent_map here also?
        patter_template = _.template('{ ?<%= name %> ?p ?o } UNION { ?s' + ' ?<%= name %>  ?o } UNION {?s ?p ?<%= name %> } .');

        pattern = patter_template({
            name: node.name
        });
    } else {
        pattern = '# ' + node.name + ' - no local constraint needed';
    }

    return pattern;
}



function get_type_filter_input(node, equivalent_map) { // lot of change
    if (node['query_param']['current_type']) {
        return node['query_param']['current_type'];
    } else {
        return null;
    }
}

function local_column_queries(graph, node, equivalent_map) {
    return _.map(node.columns, function(column) {
        if (column.property_name == undefined) {
            return;
        } else {
            return 'OPTIONAL { ' + elem_var_str(node.name, equivalent_map) + '  ' + column.property_name + '  ?' + column_name_generator(graph, node, column) + ' . } .';
        }
    }).join('\n\t');
}

function local_constraint(graph, elem, equivalent_map) {
    var pattern = '';
    switch (elem['type']) {
        case 'node':
            var node = elem;
            //console.log('mm');

            pattern = local_filter(node, equivalent_map) + '\n' + local_selection(graph, node, equivalent_map);
            break;
        case 'edge':
            var edge = elem;
            pattern = elem_var_str(edge.start, equivalent_map) + ' ' + elem_var_str(edge.name, equivalent_map) + ' ' + elem_var_str(edge.end, equivalent_map) + ' .'; // undef problem
            break;
        case 'hyper_edge':
            // nothing for hyper edge
            break;
        default:
            console.error("unknown elem type!");
    }
    return pattern;
}

function elem_var_str(elem_name, equivalent_map) {
    return '?' + (equivalent_map[elem_name] || elem_name); // does not work with edges
}

function local_selection(graph, node, equivalent_map) {

    var selection_obj_arr = node['query_param']['selection'];

    var new_selection = _.map(selection_obj_arr, function(item) {
        if (item.type == 'uri') {
            return '<' + item.value + '>';
        } else {
            var value = '"' + item.value + '"';
            // because when language is specified, then need to add it
            // e.g. "value"@en
            if (item['xml:lang']) {
                return value + '@' + item['xml:lang'];
            } else {
                return value;
            }
        }

    })



    
    if (node['query_param']['selection'].length == 0) { // change
        var patern = '\t# no ' + node.name + ' local selection';
    } else {
        // var selection = new_selection.join('');
        // var patern = '\tvalues ' + elem_var_str(node.name, equivalent_map) + ' { ' + selection + ' } .\n';
        var elem_var = elem_var_str(node.name, equivalent_map);
        var conditions = _.map(new_selection, function(value) {
            return elem_var + ' = ' + value;
        }).join(' || ');
        var patern = '\tFILTER( ' + conditions + ' ) .\n';
    }

    return patern;
}






function show_indicator(node, indicator_class, indicator_label) {
    console.assert(node.node_div);
    var node_div = node.node_div;
    if (!node.tmp) {
        node.tmp = {};
    }
    if (!node.tmp.indicator) {
        var indicator = $('<span class="indicator"><label></label></span>').appendTo(node_div.node());


        node.tmp.indicator = indicator;

        indicator
            .css('position', 'relative')
            .css('top', node.geometry.height / 2 - indicator.height() / 2)
            .css('left', node.geometry.width / 2 - indicator.width() / 2);

    }

    
    node.tmp.indicator.addClass(indicator_class);
    node.tmp.indicator.find('label').text(indicator_label);
   
   


    // console.log('SHOW loading indicator for', node.id);
    node.tmp.indicator.show();
}

function hide_loading_indicator(node) {
    node.tmp.indicator.hide(); // what
    node.tmp.indicator.removeClass();
    node.tmp.indicator.addClass('indicator');
    node.tmp.indicator.find('label').empty();
}



// query that will exicute max 3 connections while others wait
// this is sick
throttled_query = (function() {
    var waiting_tasks = [];
    var active_task_counter = 0;
    var max_active_tasks = 4;

    function run_waiting_tasks() {
        while (!_.isEmpty(waiting_tasks) && active_task_counter <= max_active_tasks) {
            active_task_counter++;
            var task_to_run = waiting_tasks.pop();


            conn.query(task_to_run[0],
                function(data) {
                    active_task_counter--;
                    run_waiting_tasks();
                    task_to_run[1](data);
                });
        }
    };

    return function(query_param, fn_when_finished) {

        waiting_tasks.push([query_param, fn_when_finished]);

        run_waiting_tasks();
    };
})();

function get_types(graph, node) {

    // delete old values not valid while new ones are comming
    node.query_param.type_arr = {};


    var query = 'select distinct ?X where {' + constraint(graph, node, node, [], {}) +  // need to make this better
        '\n ?' + node.name + ' a ?X\n}';

    var value;
    throttled_query({
        database: 'myDB4',
        query: query,
        limit: 30,
        offset: 0
    },
    function(data) {
        console.log(data);
        if (data.results == undefined) {
            console.log('typeq');
            hide_loading_indicator(node);
            show_indicator(node, 'error', 'Error....');
        } else { 
            var data_arr = data.results.bindings; // error message

            var types = _.chain(data_arr)
                .pluck('X')
                .pluck('value')
                .value();
            //console.log(data_arr, types);
            
            types.unshift(null);

            node.query_param.type_arr = types;

            node.query_param.type_query = query;
            
            render_graph(graph);

            if (_.indexOf(node.query_param.type_arr, node.query_param.current_type) != -1) {
                // this.selectedIndex = _.indexOf(d.query_param.type_arr, d.query_param.current_type);
                //d3.select('#' + node.name).select('.type_ul').selectedIndex = _.indexOf(node.query_param.type_arr, node.query_param.current_type);
                var s = $('#' + node.name);
                s.find('select')[0].selectedIndex = _.indexOf(node.query_param.type_arr, node.query_param.current_type);
                //console.log('YESSSSSSSSSSSSS', s.find('select')[0].selectedIndex);
            } else {
                node.query_param.current_type = types[0]; // there is a problem here what I dont know how to solve
            }
        }
    })
}
