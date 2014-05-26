

function init_column_make_container() {
    var body = d3.select('body');
    var table_view_column_container = body.select('#preferences_container');


    // create container for columns
    var view_def_container = table_view_column_container.append('div')
        .classed('input-group', true)
        .attr('id', 'view_def_container')
        .style('height', 700 + 'px')
        .style('width', '100%');

}

function render_columns(graph, node) {

    //
    var column_rows = d3.select('#view_def_container').selectAll('.column_row')
        .data(node.columns, function(column, i) {
            return column.id;
        });

    var create = d3.select('#view_def_container').selectAll('.first_create')
        .data([null]);
        // need this only once


    create.enter()
        .append('div')
        .classed('create-button', true) // default create button
        .classed('delete-button', true) // adds the glyph for it
        .classed('first_create', true) // original class
        .classed('col-lg-12', true)
        
        .on('click', function(d) {
            //create, needs access to graph
            create_new_column(graph, node)
            render_columns(graph, node)
        })


    create.on('click', function(d) {
        create_new_column(graph, node)
        render_columns(graph, node)
    });


    //create rows
    column_rows
    // .each( function(column) { }
    .enter()
        .append('div') // div collums
    .classed('column_row', true)
        .classed('row', true)
        .style('height', 60 + 'px')
        .style('width', '100%')
        .each(function(column) {
            row = d3.select(this); // each column seperate



            var main_container = row.append('div')
                .classed('col-lg-10', true)
                .classed('main_container', true);


            var button_container = row.append('div')
                .classed('col-lg-2', true)
                .classed('del_cea_container', true);


            //create delete button
            button_container
                .append('div')
                .classed('delete-button', true)
                .classed('col-lg-6', true)
                .on('click', function(d) {

                    delete_column(graph, node, d)
                    render_columns(graph, node)

                    //refresh_window(graph)
                })


            //create create button
            button_container
                .append('div')
                .classed('create-button', true)
                .classed('delete-button', true)
                .classed('col-lg-6', true)
                
                .on('click', function(d) {
                    //create, needs access to graph
                    create_new_column(graph, node)
                    render_columns(graph, node)
                })

        })

    //update



    column_rows
        .each(function(column) {


            var main_container = d3.select(this).select('.main_container');

            var obj_arr;
            if (column.type == 'direct') {
                obj_arr = [{
                    id: 'column_type_name',
                    value: column.type,
                    column_def: column,
                    node: node,
                    field: 'type',
                    field_data: ['direct', 'count', 'sum', 'max'],
                    container_type: 'input_dropdown',
                    yes: 'a',
                    update: function(new_value) {
                        if (new_value == 'direct') {
                            console.log(new_value, this.column_def);
                            this.column_def.type = new_value;
                            this.column_def.property_name = 'rdfs:label';
                        } else {


                            this.column_def.type = 'aggregate';
                            this.column_def.aggregation_function = new_value;
                            this.column_def.what_to_aggregate = node.incoming_lines[0]; 
                            delete this.column_def.property_name;

                        }

                    },
                    create_view: function(div) {


                        //create
                        div
                            .append('button') // type div dropdown seeable part
                        .attr('type', 'button')
                            .classed('btn btn-default dropdown-toggle', true)
                            .classed('column_type_name', true)
                            .attr('data-toggle', 'dropdown')

                        var list = div
                            .append('ul') // drop down table
                        .classed('dropdown-menu pull-right column_ul', true)

                        list.selectAll('.li')
                            .data(_.map(div.datum().field_data, function(field_data) {
                                return {
                                    value: field_data,
                                    data: div.datum()
                                }
                            }))
                            .enter()
                            .append('li')
                            .append('a')
                            .text(function(d) {
                                return d.value;
                            });
                    },
                    update_view: function(div) {
                        div.selectAll('.column_type_name') // type div dropdown seeable part
                        .text(function(d) {
                            // console.warn(d.column_def.type)
                            if (d.column_def.type == 'direct') {
                                return d.column_def.type;
                            } else if (d.column_def.type == 'aggregate') {
                                return d.column_def.type;
                            }
                            // return obj_element.value;
                        })
                    }
                }, {
                    id: 'sort_type_value',
                    value: column.sort,
                    column_def: column,
                    field: 'sort',
                    node: node,
                    field_data: ['none', 'ascending', 'descending'],
                    container_type: 'input_dropdown',
                    update: function(new_value) {
                        console.log('sort', this.column_def.sort, new_value)
                        this.column_def.sort = new_value;
                    },
                    create_view: function(div) {



                        div
                            .append('button') // type div dropdown seeable part
                        .attr('type', 'button')
                            .classed('btn btn-default dropdown-toggle', true)
                            .classed('sort_type_value', true)
                            .attr('data-toggle', 'dropdown')


                        var list = div
                            .append('ul') // drop down table
                        .classed('dropdown-menu pull-right column_ul', true)

                        list.selectAll('.li')
                            .data(_.map(div.datum().field_data, function(field_data) {
                                console.log(div.datum())
                                return {
                                    value: field_data,
                                    data: div.datum()
                                }
                            }))
                            .enter()
                            .append('li')
                            .append('a')
                            .text(function(d) {

                                return d.value;
                            });
                    },
                    update_view: function(div) {
                        div.selectAll('.sort_type_value') // type div dropdown seeable part
                        .text(function(d) {

                            return d.column_def.sort;
                        })
                    }
                }, {
                    id: 'column_lable_value',
                    value: column.column_label,
                    column_def: column,
                    field: 'lable',
                    update: function(new_value) {
                        this.column_def.column_label = new_value;
                    },
                    create_view: function(div) {



                        div.append('input') // type div dropdown seeable part
                        .attr('type', 'text')
                            .classed('form-control', true)
                        // .classed('btn btn-default dropdown-toggle', true)
                        .on('change', function(d) {
                            //console.warn(this, d, this.value);
                            d.update(this.value);
                            render_columns(graph, node)
                            render_graph(graph);
                            fill_tables(graph);
                        })

                    },
                    update_view: function(div) {
                        div.select('input')
                            .attr('value', function(d) {

                                return d.value;
                            })
                    }
                }, {
                    id: 'property_value',
                    value: column.property_name,
                    column_def: column,
                    field: 'property',
                    update: function(new_value) {

                        this.column_def.property_name = new_value;
                    },
                    create_view: function(div) {



                        div.append('input') // type div dropdown seeable part
                        .attr('type', 'text')
                            .classed('form-control', true)
                            .on('change', function(d) {
                                //console.warn(this, d, this.value);
                                d.update(this.value);
                                render_columns(graph, node)
                            })
                        // .classed('btn btn-default dropdown-toggle', true)

                    },
                    update_view: function(div) {
                        div.select('input')
                            .attr('value', function(d) {

                                return d.value;
                            })
                    }
                }];
            } else {
                obj_arr = [{
                    id: 'column_type_name',
                    value: column.type,
                    column_def: column,
                    field: 'type',
                    node: node,
                    field_data: ['direct', 'count', 'sum', 'max'],
                    container_type: 'input_dropdown',
                    yes: 'a',
                    update: function(new_value) {
                        if (new_value == 'direct') {
                            //console.log(new_value, this.column_def);
                            this.column_def.type = new_value;
                            this.column_def.property_name = 'rdfs:label';
                        } else {


                            this.column_def.type = 'aggregate';
                            this.column_def.aggregation_function = new_value;
                            this.column_def.what_to_aggregate = node.incoming_lines[0];
                            delete this.column_def.property_name;

                        }

                    },
                    create_view: function(div) {

                        //div.classed('input-group-btn', true)
                        //var data = [obj_element];

                        //bind
                        // var bind = div.selectAll('.type')
                        // .data([obj_element])

                        //create
                        div
                            .append('button') // type div dropdown seeable part
                        .attr('type', 'button')
                            .classed('btn btn-default dropdown-toggle', true)
                            .classed('column_type_name', true)
                            .attr('data-toggle', 'dropdown')

                        var list = div
                            .append('ul') // drop down table
                        .classed('dropdown-menu pull-right column_ul', true)

                        list.selectAll('.li')
                            .data(_.map(div.datum().field_data, function(field_data) {
                                return {
                                    value: field_data,
                                    data: div.datum()
                                }
                            }))
                            .enter()
                            .append('li')
                            .append('a')
                            .text(function(d) {
                                //console.warn(d.data.column_def.aggregation_function);
                                return d.value;
                            });
                    },
                    update_view: function(div) {
                        div.selectAll('.column_type_name') // type div dropdown seeable part
                        .text(function(d) {

                            if (d.column_def.type == 'direct') {
                                return d.column_def.type;
                            } else if (d.column_def.type == 'aggregate') {
                                return d.column_def.aggregation_function;
                            }

                        })
                    }
                }, {
                    id: 'sort_type_value',
                    value: column.sort,
                    column_def: column,
                    field: 'sort',
                    node: node,
                    field_data: ['none', 'ascending', 'descending'],
                    container_type: 'input_dropdown',
                    update: function(new_value) {

                        this.column_def.sort = new_value;
                    },
                    create_view: function(div) {


                        // var bind = div.selectAll('.sort')
                        // .data([obj_element]);

                        div
                            .append('button') // type div dropdown seeable part
                        .attr('type', 'button')
                            .classed('btn btn-default dropdown-toggle', true)
                            .classed('sort_type_value', true)
                            .attr('data-toggle', 'dropdown')


                        var list = div
                            .append('ul') // drop down table
                        .classed('dropdown-menu pull-right column_ul', true)

                        list.selectAll('.li')
                            .data(_.map(div.datum().field_data, function(field_data) {
                                return {
                                    value: field_data,
                                    data: div.datum()
                                }
                            }))
                            .enter()
                            .append('li')
                            .append('a')
                            .text(function(d) {
                                //console.log(d)
                                return d.value;
                            });
                    },
                    update_view: function(div) {
                        div.selectAll('.sort_type_value') // type div dropdown seeable part
                        .text(function(d) {
                            // console.log(d, obj_element)
                            return d.column_def.sort;
                        })
                    }
                }, {
                    id: 'column_lable_value',
                    value: column.column_label,
                    column_def: column,
                    field: 'lable',
                    update: function(new_value) {
                        this.column_def.column_label = new_value;
                    },
                    create_view: function(div) {


                        div.append('input') // type div dropdown seeable part
                        .attr('type', 'text')
                            .classed('form-control', true)
                        // .classed('btn btn-default dropdown-toggle', true)
                        .attr('data-toggle', 'dropdown')
                            .on('change', function(d) {
                                console.warn('input change');
                                d.update(this.value);
                                render_columns(graph, node);
                                render_graph(graph);
                                fill_tables(graph);
                            })

                    },
                    update_view: function(div) {
                        div.select('input')
                            .attr('value', function(d) {

                                return d.value;
                            })
                    }
                }, {
                    id: 'what_to_aggregate',
                    value: column.what_to_aggregate,
                    column_def: column,
                    field: 'what_to_aggregate',
                    update: function(new_value) {
                        this.column_def.what_to_aggregate = new_value;
                    },
                    create_view: function(div) {
                        div.append('input') // type div dropdown seeable part
                        .attr('type', 'text')
                            .classed('form-control', true)
                        // .classed('btn btn-default dropdown-toggle', true)
                        .classed('what_to_aggregate', true)

                            .attr('data-toggle', 'dropdown')
                            .on('change', function(d) {
                                console.warn('input change');
                                d.update(this.value);
                                render_columns(graph, node);
                                render_graph(graph);
                                fill_tables(graph);
                            });
                    },
                    update_view: function(div) {
                        console.log(div.datum())
                        div.classed('has-error', div.datum().value == undefined || div.datum().value == '');

                        div.selectAll('.what_to_aggregate')
                            .attr('value', function(d) {
                                console.warn('value', div.datum().value, d.value)

                                return d.value; // maybe need to  
                            })
                    }
                }];
            }


            //bind?
            var sub_containers = main_container.selectAll('div')
                .data(obj_arr, function(obj) {
                    return obj.id;
                });


            //create subdivs
            sub_containers
                .enter()
                .append('div')
                .each(function(obj_element) {
                    //console.log(obj_element, this);
                    var div = d3.select(this);

                    var input_div = div.attr('class', obj_element.field)
                        .classed('col-lg-3', true)
                        .append('div') // subdiv
                    .classed('input-group', true)
                        .classed('div_element.id', true);



                    //update 
                    obj_element.create_view(div, obj_element);

                    //remove
                    console.log(obj_element)
                })


            // update
            sub_containers
                .each(function(obj_element) {
                    //create? XD
                    var div = d3.select(this);


                    obj_element.update_view(div, obj_element);

                    if (obj_element.id == 'column_type_name') {
                        //div.classed('input-group-btn', true)
                        //var data = [obj_element];


                        //update 


                        //remove

                    } else if (obj_element.id == 'sort_type_value') {

                    } else if (obj_element.id == 'aggregate_function_value') {


                    }

                })

            //exit
            sub_containers.exit().remove();

            console.log('end')
        })



    //remove
    column_rows.exit().remove();



}

function column_name_generator(graph, node, column) { 

    
    var i = _.indexOf(node.columns, column);
    if (column.type == 'aggregate') {
        if (graph[column.what_to_aggregate] == undefined) {
            return;
        } else if (graph[column.what_to_aggregate].type == 'hyper_edge') { // cheks if what to aggr is a hyper edge, if so we need its connected edge name
            return node.name + '_' + get_edge_name_fom_hyper(graph, column.what_to_aggregate);

        }

        return node.name + '_' + column.what_to_aggregate; // needs groupp by at the end / how?
    }
    return node.name + '_col_' + (i + 1);
}   

function create_new_column(graph, node) {
    var column = {
        // data property
        'id': guid(),
        'type': 'direct',
        'column_label': 'label1',
        'property_name': 'rdfs:label',
        'sort': 'none',
        'width': 330
    };
    graph[node.name].columns.push(column);
    render_graph(graph);

}

function delete_column(graph, node, column) { // could be problems with indexes
    var delete_index = _.chain(graph[node.name].columns)
        .pluck('id')
        .indexOf(column.id)
        .value();

    delete graph[node.name].columns[delete_index];
    graph[node.name].columns = _.compact(graph[node.name].columns);

    render_graph(graph);

}
