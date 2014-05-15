TableView = function() {

    var div,
        node,
        graph;

    var options = {
        enableCellNavigation: true,
        enableColumnReorder: false
    };

    var that;

    var table_grid;

    var gridContainer;

    var columns;

    function init(init_div, init_node, init_graph) {
        div = init_div;
        node = init_node;
        graph = init_graph;
        var data = [];
        var columns = [];

        // make the container where slickgrid will go inot
        gridContainer = d3.select(div).append('div') // make in table selection
        .classed('query-result-redering-container', true)
            .style('left', '30px')
            .style('background-color', 'white');

        // make slickgrid
        table_grid = new Slick.Grid(gridContainer.node(), data, columns, options);

        // // asigns menu to a value
        // var headerMenuPlugin = new Slick.Plugins.HeaderMenu({});

        // headerMenuPlugin.onBeforeMenuShow.subscribe(function(e, args) {
        //   var menu = args;
        //   console.log(e, args)
        //   // We can add or modify the menu here, or cancel it by returning false.
        //   var i = menu.items.length;
        //   menu.items.push({
        //     title: "Menu item " + i,
        //     command: "item" + i
        //   });
        // });

        // headerMenuPlugin.onCommand.subscribe(function(e, args) {
        //   alert("Command: " + args.command);
        // });

        // table_grid.registerPlugin(headerMenuPlugin);


        // change the sort of a column
        table_grid.onHeaderClick.subscribe(function(e, args) {
            var columnID = args.column.name;
            console.log(args.column.name);

            console.log(e.srcElement);
            $(e.srcElement).popover({
                placement: 'bottom', //placement of the popover. also can use top, bottom, left or     right
                html: 'false', //needed to show html of course
                content: 'abc'// hope this should b
            })

            $(e.srcElement).popover('show');
            // if click is on the make column header we make a column and dont change the sort
            if (args.column.name == 'ss') {
                console.log(args, e.srcElement, this)

                d3.select(e.srcElement)
                    .attr('data-toggle', 'popover')
                    .attr('data-placement', 'top')
                    .attr('data-content', 'Vivamus sagittis lacus')



            } else if (args.column.name == 'add_column') {
                console.log('make col')

                node.columns.push({
                    // data property
                    'id': guid(),
                    'type': 'aggregate',
                    'column_label': 'ss',
                    'aggregation_function': 'count',
                    'what_to_aggregate': 'l1',
                    'sort': 'descending',
                    'id': '123',
                    'width': 330
                });

                _.defer(function() {
                    render_graph(graph);
                    fill_tables(graph);
                });

            } else {
                // gets all column lables
                var column_change_index = _.chain(node.columns)
                    .map(function(column) {
                        return column.column_label;
                    })
                    .indexOf(args.column.name)
                    .value();

                // toggles sort
                if (node.columns[column_change_index].sort == 'ascending') {
                    node.columns[column_change_index].sort = 'descending';
                } else if (node.columns[column_change_index].sort == 'descending') {
                    node.columns[column_change_index].sort = 'none';
                } else {
                    node.columns[column_change_index].sort = 'ascending';
                }

                //render_graph(graph);
                _.defer(function() {
                    render_graph(graph);
                    fill_tables(graph);
                });

                console.log('sort');
                return;                
            }

        });

        table_grid.setSelectionModel(new Slick.RowSelectionModel({
            selectActiveRow: true
        }));

        // selection handler
        table_grid.onSelectedRowsChanged.subscribe(function() {
            var selected_row_indexes = table_grid.getSelectedRows();

            var all_table_row_values = _.map(table_grid.getData(), function(obj) {
                return obj;
            })

            var current_selected_values = _.map(selected_row_indexes, function(index) { 
                return all_table_row_values[index][node.name];
            })
            var arr = [];


            var previous_selected_values = node['query_param']['selection'];


            if (!obj_equal(current_selected_values, previous_selected_values)) {
                node['query_param']['selection'] = current_selected_values;
                fill_tables(graph);
            }
        });

        // resize column function
        table_grid.onColumnsResized.subscribe(function(e, args)
        { 
            var cols = table_grid.getColumns(); // get all grid columns 
            _.each(node.columns, function(column, i) {
                column.width = cols[i + 1].width;
            })
            console.log(cols, node.columns[0])
        }) 


        refresh_view_from_node();
        return that;
    }


    // puts rigth data into cells
    function render_cell_data(row, cell, value, columnDef, dataContext) { 


        var data_value = value && value.value || '';
        var matching_prefix_def = _(graph.prefixes).find(function(prefix_def) {
            //console.log(value, prefix_def.namespace.length)
            return data_value.substring(0, prefix_def.namespace.length) === prefix_def.namespace;
        });

        if (matching_prefix_def) {
            return '<i>' + matching_prefix_def.prefix + ': </i>' + data_value.replace(matching_prefix_def.namespace, '');
        } else {
            return data_value;
        }
  
    }

    function get_column_width(column) {
        return column.width;
    }

    function refresh_view_from_node() {
        gridContainer
            .style('width', function(node) {
                return node.geometry.width - 60 + 'px';
            })
            .style('height', function(node) {
                return node.geometry.height - 80 + 'px';
            });

        columns = _.map(node.columns, function(column) {
            return {
                id: column_name_generator(graph, node, column),
                name: column.column_label,
                field: column_name_generator(graph, node, column),
                formatter: render_cell_data,
                width: get_column_width(column),
                sortable: column.sort == 'ascending' || column.sort == 'descending'
            };
        });

        // adds first column
        columns.unshift({
            id: node.name,
            name: node.name,
            field: node.name,
            formatter: render_cell_data,
            width: 330
        })

        columns.push({
            id: 'add_column',
            name: 'add_column',
            field: 'add_column',
            formatter: render_cell_data,
            sortable: 'none',
            width: 330
        })

        d3.selectAll('#add_column')
            .on('click', function(d) {
                console.log('make_column', d);
            })


        table_grid.setColumns(columns);

        var sort_columns = _.chain(node.columns)
            .filter(function(column) {
                return column.sort == 'ascending' || column.sort == 'descending';
            })
            .map(function(column) {
                return {
                    columnId: column_name_generator(graph, node, column),
                    sortAsc: column.sort == 'ascending'
                }
            })
            .value();

        table_grid.setSortColumns(sort_columns);


    }

    function set_data(data) { // highlight_ids
        table_grid.setData(data);

        var selec_arr = get_selection_values(node['query_param']['selection']); // change 

        var first_collum_obj = _.pluck(data, node.name);
        var table_values = get_selection_values(first_collum_obj);

        var highligth_indexes = _.reduce(selec_arr, function(highligth_indexes_so_far, selected_value) {
            var index = _.indexOf(table_values, selected_value)
            if (index != -1) {
                highligth_indexes_so_far.push(index);
            }
            return highligth_indexes_so_far;
        }, []);
        table_grid.setSelectedRows(highligth_indexes);
        // unified coloring
        // ja kaut kas ir selekteets, tad...
        // selekciju atziimeet baltu
        // paareejam uzlikt setCellCssStyle uz peleeku
        table_grid.invalidate();
    }

    function destroy() {
        var element = d3.select(div).select('.query-result-redering-container')
            .remove();
        // console.log(element);


        // element.removeChild(element);
        //console.warn('destroy grid is not implemented');
    }


    that = {
        init: init, // div and graph_node
        destroy: destroy, // nothing, releases 
        refresh_view_from_node: refresh_view_from_node, // refresh 
        set_data: set_data, // load new data
        type: 'TableView'
    };

    return that;
};