var conn = new Stardog.Connection();

function render_graph(graph) {

    // handles node draging
    var drag_type;
    var node_drag = d3.behavior.drag()
        .origin(function(d) {

            var srcElement = d3.select(d3.event.srcElement);
            if (srcElement.classed('resize-sprite')) {
                drag_type = 'resize';
                console.log(drag_type);
                return {
                    x: d.geometry.width,
                    y: d.geometry.height
                };
            } else if (srcElement.classed('top-container')) {
                drag_type = 'move';
                return d.geometry;
            } else {

                return {
                    x: 0,
                    y: 0
                };
            }
        })
        .on('drag', function(d) {
            if (drag_type == 'resize') {

                d.geometry.width = Math.max(d3.event.x, 600);
                d.geometry.height = Math.max(d3.event.y, 300);
                d.geometry.width = Math.min(d.geometry.width, 1500);
                d.geometry.height = Math.min(d.geometry.height, 1000);
            } else if (drag_type == 'move') {
                d.geometry.x = d3.event.x;
                d.geometry.y = d3.event.y;
            } else {

                return;
            }
            render_graph(graph);

        })
        .on('dragend', function(d) {
            drag_type = null;
        });



    var container = d3.select('#query-graph-container')
        .style('position', 'relative');

    // make arrays of different elements
    var node_arr = _.filter(graph, function(obj) {
        return obj['type'] == 'node';
    });

    var edge_arr = _.filter(graph, function(obj) {
        return obj['type'] == 'edge' || obj['type'] == 'hyper_edge';
    });


    // adds database connection values to the inputfields, so
    // the user can see to what database is the connection is enstablished
    var db_name = d3.select('#db_name_input')
        .attr('value', function(d) {
            return graph.database;
        })

    db_name.node().value = graph.database;

    db_endpoint = d3.select('#endpoint_input')
        .attr('value', function(d) {
            return graph.endpoint;
        })

    db_endpoint.node().value = graph.endpoint;

    db_reasoning = d3.select('#reasoning_input')
        .attr('value', function(d) {
            return graph.reasoning;
        })

    db_reasoning.node().value = graph.reasoning;


    db_user = d3.select('#user_input')
        .attr('value', function(d) {
            return graph.credentials.user;
        })

    db_user.node().value = graph.credentials.user;
        
    db_pass = d3.select('#pass_input')
        .attr('value', function(d) {
            return graph.credentials.pass;
        })

    db_pass.node().value = graph.credentials.pass;


    //
    // DRAW NODES
    //
    var edge_canvas = container.select('.edge_canvas');
    // bind
    var nodes = container.selectAll('.query-node')
        .data(node_arr, function(d) {
            return d.name;
        });

    // create
    nodes.enter()
        .append('div')
        .classed('query-node', true) 
        .style('position', 'absolute')
        .attr('id', function(node) {
            return node['name'];
        })
        .call(node_drag)
        .each(function(node) {


            var node_div = d3.select(this);

            node.node_div = node_div;


            // at start greate the three major node sections
            var top_div = node_div.append('div')
                .attr('class', 'top-container')
                .style('position', 'absolute')
                .style('height', 40 + 'px')


            var middle_node_div = node_div
                .append('div')
                .attr('class', 'middle-container')
                .attr('id', node.name + '1')
                .style('position', 'absolute')
                .style('top', '40px')


            var bottom_div = node_div.append('div')
                .attr('class', 'bottom-container')
                .style('position', 'absolute')
                .style('height', 40 + 'px')





            // after the major sections are created the buttons and actions 
            // are put in into these sections
            var type_field = top_div.append('div')
                .style('position', 'absolute')
                .style('left', 50 + 'px')
                .style("font-family", "sans-serif")
                .style("font-size", '30px')
                


            var type_selection_container = type_field.append('div')
                .append('select')
                    .style('width', 400 + 'px')
                    .classed('input-group', true)
                    .classed('form-control', true)
                    .classed('type_combobox', true)
                    .classed('type_ul', true)
                    .on('change', function(node) {

                        select = d3.select(this);
                        options = select.selectAll('option');

                        var selectedIndex = select.property('selectedIndex');
                        
                        var data = d3.select(options[0][selectedIndex]).datum();
                        node.query_param.current_type = data;

                        render_graph(graph);
                        fill_node_view(graph);                    
                    });

            var barchart_container = top_div.append('div')
                .style('position', 'absolute')
                .style('left', 450 + 'px')
                .style("font-family", "sans-serif")
                .style("font-size", '30px')


            var barchart_selection_container = barchart_container.append('div')
                    .append('select')
                        .style('width', 400 + 'px')
                        .classed('input-group', true)
                        .classed('form-control', true)
                        .classed('barchart_combobox', true)
                        .classed('type_ul', true)
                        .on('change', function(node) {

                            select = d3.select(this);
                            options = select.selectAll('option');

                            console.log('bar')
                            get_all_barchart_columns(graph, node);
                            var selectedIndex = select.property('selectedIndex');

                            var data = d3.select(options[0][selectedIndex]).datum();
                            node.query_param.current_type = data;
                            console.log(node, data, graph)

                            if (data != undefined) {
                                column_id = _.chain(node.columns)
                                    .map(function(column) {
                                    if (column.column_label == data) {
                                        return column.id
                                    }
                                    })
                                    .compact()
                                    .value();

                                node.visualization_defs.BarChartView.properties.y_axis_column = column_id[0];
                            } else {
                                node.visualization_defs.BarChartView.properties.y_axis_column = null;
                            }

                            fill_node_view(graph);
                            render_graph(graph);                  
                        });




            top_div.append('div')
                .classed('button', true)
                .classed('glyphicon glyphicon-info-sign type_query', true)
                .style('height', 40 + 'px')
                .style('width', 40 + 'px')
                .on('click', function(node) {
                    console.log('type query\n', node.query_param.type_query);
                });

            top_div.append('div')
                .classed('glyphicon glyphicon-signal', true)
                .classed('button', true)
                .style('position', 'absolute')
                .style('height', 40 + 'px')
                .style('width', 40 + 'px')
                .style('top', 9 + 'px')
                .style('left', 5 + 'px')
                .on('click', function(node) {
                    if (node['active_visualization_type'] == 'TableView') {
                        node['active_visualization_type'] = 'BarChartView';
                    } else {
                        node['active_visualization_type'] = 'TableView';
                    }
                    console.log(node['active_visualization_type']);
                    render_graph(graph);
                    fill_node_view(graph);
                });



            top_div.append('div')
                .attr('class', 'delete-node')           
                .style('position', 'absolute')
                .style('top', '-11px')
                .on('click', function(node) {
                    delete_node(graph, node);
                })

            top_div.append('div')
                .attr('class', 'input-window')
                .classed('glyphicon glyphicon-align-justify', true)
                .classed('button', true)
                .attr('data-toggle', 'modal')
                .attr('data-target', '.bs-example-modal-lg')
                .style('position', 'absolute')
                .style('top', 9 + 'px')
                .style('left', 5 + 'px')
                .style('height', 40 + 'px')
                .style('width', 40 + 'px')
                .on('click', function(node) {
                    render_columns(graph, node);
                })

            bottom_div.append('div')
                .classed('button', true)
                .attr('id', node.name)
                .style('position', 'absolute')
                .style('height', 40 + 'px')
                .style('width', 40 + 'px')
                .call(node_drag)
                .append('div')
                    .style('position', 'absolute')
                    .classed('glyphicon glyphicon-resize-full resize-sprite', true)
                    .style('top', 5 + 'px')
                    .style('left', 5 + 'px')
                    .call(node_drag);

            bottom_div.append('div')
                .attr('class', 'query-button')
                .classed('glyphicon glyphicon-info-sign', true)
                .classed('button', true)
                .attr('id', node.name)
                .style('position', 'absolute')
                .style('top', 5 + 'px')
                .style('left', 5 + 'px')
                .style('height', 40 + 'px')
                .style('width', 40 + 'px')
                .on('click', function(node) {
                    var query = generate_query(graph, node);
                    console.log('query: \n', query, '\n', node.query_param);
                });


            bottom_div.append('div')
                .attr('class', 'refresh-button')
                .classed('glyphicon glyphicon-refresh', true)
                .classed('button', true)
                .attr('id', node.name)
                .style('position', 'absolute')
                .style('top', 5 + 'px')
                .style('left', 5 + 'px')            
                .style('height', 40 + 'px')
                .style('width', 40 + 'px')
              
                .on('click', function(node) {
                    fill_node_view(graph);
                });



            bottom_div.append('div')
                .attr('class', 'delete-selection')
                .classed('glyphicon glyphicon glyphicon-repeat', true)
                .classed('button', true)
                .attr('id', node.name)
                .style('position', 'absolute')
                .style('top', 5 + 'px')
                .style('left', 5 + 'px')
                .style('height', 40 + 'px')
                .style('width', 40 + 'px')
      
                .on('click', function(node) {
                    // delete selections
                    node['query_param']['selection'] = [];
                    fill_node_view(graph);
                });

        });


    // at changes the element properties are just updated with d3, not deleted
    // update
    nodes
        .style('left', function(node) {
            return node.geometry.x + 'px';
        })
        .style('top', function(node) {
            return node.geometry.y + 'px';
        })
        .style('width', function(node) {
            return node.geometry.width + 'px';
        })
        .style('height', function(node) {
            return node.geometry.height + 'px';
        })
        .call(function(node) { // updating sizes and positions

            var node_div = this;



            var top_div = node_div.select('.top-container')
                .style('width', function(node) {
                    return node.geometry.width + 'px';
                });

            var middle_node_div = node_div.select('.middle-container')
                .style('width', function(node) {
                    return node.geometry.width + 'px';
                })
                .style('height', function(node) {
                    return node.geometry.height - 100 + 'px';
                });

            var bottom_div = node_div.select('.bottom-container')
                .style('top', function(node) {
                    return node.geometry.height - 40 + 'px';
                })
                .style('width', function(node) {
                    return node.geometry.width + 'px';
                });




            //bind
            var type_options = top_div.select('.type_ul').selectAll('option')
                .data(function(d) {
                    return d.query_param.type_arr;
                })
               
            //create
            type_options.enter()
                .append('option')
                .classed('option', true)

              
            //update    
            type_options.text(function(d) {

                    return d;
                });
            

            //exit
            type_options.exit().remove();


            // bind
            var bar_options = top_div.select('.barchart_combobox').selectAll('option')
                .data(function(node) {
                    get_all_barchart_columns(graph, node);
                    return get_all_barchart_columns(graph, node);
                })

            //create
            bar_options.enter()
                .append('option')
                .classed('option', true)

              
            //update    
            bar_options.text(function(d) {
                    return d;
                });
            

            //exit
            bar_options.exit().remove();


            top_div.select('.glyphicon-signal')
                .style('left', function(node) {
                    return node.geometry.width - 100 + 'px';
                });



            top_div.select('.delete-node')
                .style('left', function(node) {
                    return node.geometry.width - 25 + 'px';
                });

            top_div.select('.input-window')
                .style('left', function(node) {
                    return node.geometry.width - 150 + 'px';
                });


            bottom_div.select('.resize-sprite')
                .style('left', function(node) {
                    return node.geometry.width - 40 + 'px';
                });


            bottom_div.select('query-button')
                .style('left', function(node) {
                    return node.geometry.width - 280 + 'px';
                });


            bottom_div.select('.refresh-button')
                .style('left', function(node) {
                    return node.geometry.width - 320 + 'px';
                });


            bottom_div.select('.delete-selection')
                .style('left', function(node) {
                    return node.geometry.width - 390 + 'px';
                });
                
            bottom_div.select('.make-something')
                .style('left', function(node) {
                    return node.geometry.width - 490 + 'px';
                })
        })
        .each(function(node) { // updating container visualization

            var view_construct_for_view_type = {
                'TableView': TableView,
                'BarChartView': BarChartView
            }


            var node_div = d3.select(this);

            var gridContainer = node_div.select('.middle-container');
            // check what visualization type is set
            if (!node.current_visualization_view) { // if it is not defined then it is made and the view are refreshed 
                
                var view_constructor = view_construct_for_view_type[node.active_visualization_type];

                node.current_visualization_view = view_constructor().init(gridContainer.node(), node, graph);


            } else if (node.current_visualization_view.type == node.active_visualization_type) {
                
                // if the rigth type is set, then only view refreshing is needed
                node.current_visualization_view.refresh_view_from_node();

            } else { // if a undefined type is defined then it is deleted and there is a good one made

                node.current_visualization_view.destroy();


                var view_constructor = view_construct_for_view_type[node.active_visualization_type];
                node.current_visualization_view = view_constructor().init(gridContainer.node(), node, graph);

            }

            console.assert(node.current_visualization_view)

        });

    //deleting nodes that are no more in the graph
    // remove
    nodes.exit()
        .remove();


    // start making edge elements and their properties
    //
    // DRAW EDGES
    //

    var edge_delete_field = edge_canvas.selectAll('.delete_edge')
        .data(edge_arr, function(d) {
            return d.name;
        });
    // create
    edge_delete_field.enter()
        .append('rect')
            .classed('delete_edge', true)
            .attr('height', 40 + 'px')
            .attr('width', 40 + 'px')
            .on('click', function(edge) {
                delete_edge(graph, edge);
                render_graph(graph);
                fill_node_view(graph);
            })

    //update
    edge_delete_field
        .attr('x', function(d) {
            return (d.geometry.x1 + d.geometry.x2 - 100) / 2;
        })
        .attr('y', function(d) {
            return (d.geometry.y1 + d.geometry.y2 - 100) / 2;
        })



    edge_delete_field.exit().remove();

    // bind
    var edges = edge_canvas.selectAll('.query-edge')
        .data(edge_arr, function(d) {
            return d.name;
        });

    //create 
    edges.enter()
        .append('path')
        .classed('query-edge', true)
        .attr('marker-end', "url(#link_path_end)")
        .attr('id', function(node) {
            return node['name'];
        });


    // update
    
    edges.each(function(edge) {

        updateEdgeCoordinates(graph, graph[edge.start]['geometry'], graph[edge.end]['geometry'], 5, edge.name);
    })
        .attr('d', function(d) {
            var path = 'M' + d.geometry.x1 + ',' + d.geometry.y1 + 'L' + d.geometry.x2 + ',' + d.geometry.y2;

            return path;
        })

    // delete removed
    edges.exit().remove()


    // create paths for flow lines that show the flow of the edge
    // bind data
    var flow_edges = edge_canvas.selectAll('.query-edges_red')
        .data(edge_arr, function(d) {
            return d.name;
        })

    // create new
    flow_edges.enter()
        .append('path')
        .classed('query-edges_red', true)
        .attr('stroke', "red")
        .attr('stroke-width', "9px")
        .attr('id', function(node) {
            return node['name'];
        })
        .on('click', function(d) {
            toggle_edge_flow(graph, d);
            return;
        });

    // update all
    flow_edges
        .attr('d', function(d) {

            if (d.geometry.x1 == d.geometry.x2) {
                var path = 'M' + (d.geometry.x1 + 20) + ',' + d.geometry.y1 + 'L' + (d.geometry.x2 + 20) + ',' + d.geometry.y2;
            } else {
                var path = 'M' + d.geometry.x1 + ',' + (d.geometry.y1 - 20) + 'L' + d.geometry.x2 + ',' + (d.geometry.y2 - 20);
            }


            return path;
        })
        .attr('marker-end', function(edge) {

            if (_.contains(graph[edge.end]['incoming_lines'], edge.name)) {
                return 'url(#link_path_end_red)';
            } else return '';
        })
        .attr('marker-start', function(edge) {
            if (_.contains(graph[edge.start]['incoming_lines'], edge.name)) {
                return 'url(#link_path_start)';
            } else return '';
        });

    // remove deleted
    flow_edges.exit().remove();


    // bind lable 
    var lables = edge_canvas.selectAll('.text')
        .data(edge_arr, function(d) {
            return d.name;
        });

    //create new labels
    lables.enter()
    .append('text')
        .attr('class', 'text')
        .text(function(d) {
            return d.name;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "20px")
        .attr("fill", "balck");

    // update labels
    lables
    .attr('x', function(d) {
        return d.geometry['x'] || (d.geometry['x2'] - 20);
    })
        .attr('y', function(d) {
            return (d.geometry['y'] - 0) || (d.geometry['y2'] + 10);
        })

    // remove lables

    lables.exit().remove();
}

function fill_node_view(graph) {


conn.setEndpoint(graph.endpoint);
conn.setCredentials(graph.credentials.user, graph.credentials.pass);
conn.setReasoning(graph.reasoning);



    _.chain(graph)
        .filter(function(elem) {
            return elem['type'] == 'node';
        })
        .each(function(node) {

            show_indicator(node, 'warning', 'Buffering....');

            var query = generate_query(graph, node);
            // node.current_visualization_view.set_data([])
            throttled_query({
                    database: graph.database,
                    query: query,
                    limit: 30,
                    offset: 0
                },
                function(data) {
                    console.log(data);
                    if (data.results == undefined) {
                        hide_loading_indicator(node);
                        show_indicator(node, 'error', 'Error....');
                    } else { 
                        var actual_results = data.results.bindings;
                        if (actual_results.length == 1) {
                            // jo ja ir agregaacijs, tad pat ja ir tuksh rezultaats,
                            // tad buus viens ieraksts kur agregaacijas kolonaas ir 0es
                            actual_results = _.filter(actual_results, function(obj) {
                                return obj[node.name]
                            });
                        }

                        var first_collum_obj = _.pluck(actual_results, node.name);
                        var table_values = get_selection_values(first_collum_obj);
                        // var table_values = _.chain(data.results.bindings).pluck(node.name).pluck('value').value();

                        current = node['query_param']['selection'];
                        node['query_param']['selection'] = selection_intersection(node['query_param']['selection'], first_collum_obj); // gets those values that were in the graph selection before  need change 

                        if (!_.isEqual(node['query_param']['selection'], current)) {
                            fill_node_view(graph);
                        } else {
                            //console.log(node['table_values'], table_values);
                            node['table_values'] = table_values;




                            console.assert(node.current_visualization_view)
                            
                            node.current_visualization_view.set_data(actual_results)

                            hide_loading_indicator(node);
                        }
                        


                    }
                });

            select_type(graph, node);

        });
    

}


function init_query_graph(graph) {

    
    // makes container for all elements that will be handled
    var query_graph_container = d3.select('#query-graph-container')
        .style('position', 'relative');

    // makes container for all edges
    var edge_container = query_graph_container.append('svg')
        //.style('position', 'absolute')
        .attr('width', 4000)
        .attr('height', 2000)
        .style('top', 30 + 'px')
        .classed('edge_canvas', true)
        .call(make_marker)
        .on('click', function(d) {

            var x = d3.mouse(this)[0];
            var y = d3.mouse(this)[1];
            if (this == d3.event.target) {
                make_node(graph, x, y);
            }

        });

    // starts making form for rendering columns
    init_column_make_container();

    
    // assign function to connection to database input fields
    d3.select('#db_name_input')
        .data(graph.database)
        .on('change', function(d) {

            graph.database = this.value;
            
            fill_node_view(graph);
        })

        
    d3.select('#endpoint_input')
        .on('change', function(d) {

            graph.endpoint = this.value;
            
            fill_node_view(graph);
        })


    d3.select('#reasoning_input')
        .on('change', function(d) {

            graph.reasoning = this.value;
            
            fill_node_view(graph);
        })

    d3.select('#user_input')
        .on('change', function(d) {

            graph.credentials.user = this.value;
            
            fill_node_view(graph);
        })

    d3.select('#pass_input')
        .on('change', function(d) {

            graph.credentials.pass = this.value;
            
            fill_node_view(graph);
        })



    // catches some of the column value changes
    $(document.body).on('click', '.column_ul', function(event) { 


        console.log(event.srcElement.text)
        var li = d3.select(event.currentTarget);
        console.log('a', li.data(), 
            li.datum().update(event.srcElement.text))

        render_columns(graph, li.datum().node); 
        render_graph(graph);
        fill_node_view(graph); 

    });


    // catches the event that will make an edge
    d3.select('body')
    .on('keydown', function() {
        // event will happen when 'shift' is pressed    
        if (d3.event.keyCode == 16) {
            event_for_making_edge1(graph);
            return;
        }
    });



    // calls functions that will show graph in the browser
    render_graph(graph);
    fill_node_view(graph);
}
