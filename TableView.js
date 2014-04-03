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

function init(init_div, init_node, init_graph) {
    div = init_div;
    node = init_node;
    graph = init_graph;
    var data = [];
    var columns = [];
    console.log(div);
    var gridContainer = d3.select(div).append('div')   // make in table selection
        .classed('query-result-redering-container', true)
        .style('left', '30px')
        .style('background-color', 'white')
        .style('width', function(node) {
            return node.geometry.width - 60 + 'px';
        })
        .style('height', function(node) {
            return node.geometry.height - 80 + 'px';
        });

    table_grid = new Slick.Grid(gridContainer.node(), data, columns, options);

    table_grid.onHeaderClick.subscribe(function(e, args) {
        var columnID = args.column.name;
        
        var column_change_index = _.chain(node.columns)
            .map(function(column) {
                return column.column_label;
            })
            .indexOf(args.column.name)
            .value();


        if( node.columns[column_change_index].sort == 'ascending') {
            node.columns[column_change_index].sort = 'descending';
        } else if (node.columns[column_change_index].sort == 'descending') {
            node.columns[column_change_index].sort = 'none';
        } else {
            node.columns[column_change_index].sort = 'ascending';
        }

        //render_graph(graph);
        _.defer(function () {
            render_graph(graph);
            fill_tables(graph);
        });

        //console.log(node.columns[column_change_index]);
        console.log('sort');
        return;
    });

    table_grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: true}));

    table_grid.onSelectedRowsChanged.subscribe(function() { 
        var selected_row_indexes = table_grid.getSelectedRows();

        var all_table_row_values = _.map(table_grid.getData(), function(obj) {
            
            return obj;
        })
        
        var current_selected_values = _.map(selected_row_indexes, function(index) { // works, gets an object\
            
            return all_table_row_values[index][node.name];
        })
        var arr = [];


        var previous_selected_values = node['query_param']['selection']; 


        if(!obj_equal(current_selected_values, previous_selected_values)) {
            node['query_param']['selection'] = current_selected_values; // need to be an obj
            fill_tables(graph);
        }
    });
    
    refresh_view_from_node();
    return that;
}

    

function refresh_view_from_node() {
    var columns = _.map(node.columns, function(column) {
        return { 
            id: column_name_generator(node, column), 
            name : column.column_label, 
            field: column_name_generator(node, column), 
            formatter: render_cell_data,
            width: 330,
            sortable: column.sort == 'ascending' || column.sort == 'descending'
        };
    });

    
    columns.unshift({id:node.name, name: node.name, field: node.name, formatter: render_cell_data, width: 330})

    table_grid.setColumns(columns);

    var sort_columns = _.chain(node.columns)
        .filter(function(column) {
            return column.sort == 'ascending' || column.sort == 'descending';
        })
        .map(function(column) {
            return { 
                columnId: column_name_generator(node, column), 
                sortAsc: column.sort == 'ascending'
            }
        })
        .value();

    table_grid.setSortColumns(sort_columns);

    
}

function set_data(data) { // highlight_ids
    table_grid.setData(data);
    //table_grid.setSelectedRows(highligth_indexes);
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