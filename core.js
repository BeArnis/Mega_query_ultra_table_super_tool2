var conn = new Stardog.Connection();
conn.setEndpoint('http://localhost:5820/');
conn.setCredentials('admin', 'admin');
conn.setReasoning('QL');

function show_loading_indicator(node) {
    console.assert(node.node_div);
    var node_div = node.node_div;
    if (!node.tmp) {
        node.tmp = {};
    }
    if (!node.tmp.loadingIndicator) {
        var loadingIndicator = $('<span class="loading-indicator"><label>Buffering...</label></span>').appendTo(node_div.node());
        var $g = $(node_div.node());

        node.tmp.loadingIndicator = loadingIndicator;

        loadingIndicator
            .css('position', 'relative')
            .css('top', node.geometry.height / 2 - loadingIndicator.height() / 2)
            .css('left', node.geometry.width / 2 - loadingIndicator.width() / 2);
    }

    // console.log('SHOW loading indicator for', node.id);
    node.tmp.loadingIndicator.show();
}

function hide_loading_indicator(node) {
    node.tmp.loadingIndicator.hide();
}

function render_graph(graph) {


    var drag_type;
    var ultimate_drag = d3.behavior.drag()
        .origin(function(d) {
            // console.log("ultimate_drag start", d3.event)
            var srcElement = d3.select(d3.event.srcElement)
            if (srcElement.classed('resize-sprite')) {
                drag_type = 'resize';
                console.log(drag_type);
                return {
                    x: d.geometry.width,
                    y: d.geometry.height
                };
            } else if (srcElement.classed('top-container')) {
                drag_type = 'move';
                //console.log(drag_type, d);
                return d.geometry;
            } else {

                return {
                    x: 0,
                    y: 0
                };
            }
        })
        .on("drag", function(d) {
            // console.log("ultimate_drag", this, d3.event)
            if (drag_type == 'resize') {

                d.geometry.width = Math.max(d3.event.x, 500);
                d.geometry.height = Math.max(d3.event.y, 300);
            } else if (drag_type == 'move') {
                console.log(d.geometry, d3.event);
                d.geometry.x = d3.event.x;
                d.geometry.y = d3.event.y;
            } else {
                //console.error("unknown src class")
                return; // we end to avoide render_graph
            }
            // sleep(100)
            render_graph(graph);

        })
        .on('dragend', function(d) {
            drag_type = null;
        })

    console.log(graph)

    var container = d3.select('#query-graph-container')
        .style('position', 'relative');

    var node_arr = _.filter(graph, function(obj) {
        return obj['type'] == 'node';
    });

    var edge_arr = _.filter(graph, function(obj) {
        return obj['type'] == 'edge' || obj['type'] == 'hyper_edge';
    });

    var graph_elements = graph;


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
        .classed('query-node', true) // if type node than node is needed
    .style('position', 'absolute')
        
        .attr('id', function(node) {
            return node['name'];
        })
        .call(ultimate_drag)
    //.call(drag)

    .each(function(node) {
        var node_div = d3.select(this);

        node.node_div = node_div;

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
            .attr('class', 'bottom-container') // wtf why does this lag???
        .style('position', 'absolute')
            .style('height', 40 + 'px')



        top_div.append('div')
            .attr('class', 'name-container')
            .classed('button', true)
            .style('position', 'absolute')
            .style('height', 40 + 'px')
            .style('width', 40 + 'px')
            .style('background-color', 'white')
            .text(function(node) {
                return node.name;
            })
            .style("font-family", "sans-serif")
            .style("font-size", '30px');


        // top_div.append('div')
        //     .attr('class', 'table-button')
        //     .style('position', 'absolute')
        //     .style('height', 40 + 'px')
        //     .style('width', 40 + 'px')
        //     .style('background-color', 'pink')


        top_div.append('div')
            .attr('class', 'chart-button')
            .classed('button', true)
            .style('position', 'absolute')
            .style('height', 40 + 'px')
            .style('width', 40 + 'px')
            .style('background-color', 'green')
            .on('click', function(node) {
                if (node['active_visualization_type'] == 'TableView') {
                    node['active_visualization_type'] = 'BarChartView';
                } else {
                    node['active_visualization_type'] = 'TableView';
                }
                console.log(node['active_visualization_type']);
                render_graph(graph);
                fill_tables(graph);
            });



        top_div.append('div')
            .attr('class', 'button-sprite')
            .classed('button', true)
            .style('position', 'absolute')
            .style('top', '-15px')
            .on('click', function(node) {
                destroy_node(graph, node);
            })

        top_div.append('div')
            .attr('class', 'input-window')
            .classed('btn btn-primary', true)
            .classed('button', true)
            .attr('data-toggle', 'modal')
            .attr('data-target', '.bs-example-modal-lg')
            .style('position', 'absolute')
            .style('height', 40 + 'px')
            .style('width', 40 + 'px')
            .style('background-color', 'blue')
            .on('click', function(node) {
                render_columns(graph, node);

                // input_info();
                // <button class="btn btn-primary" data-toggle="modal" data-target=".bs-example-modal-lg">Large modal</button>

            })

        bottom_div.append('div')
            .attr('class', 'resize-sprite')
            .classed('button', true)
            .attr('id', node.name)
            .style('position', 'absolute')
            .style('height', 40 + 'px')
            .style('width', 40 + 'px')
            .style('background-color', 'blue')
        // .on('mousedown', function(node) {
        //     d3.event.stopPropagation();
        // })
        .call(ultimate_drag);

        bottom_div.append('div')
            .attr('class', 'query-button')
            .classed('button', true)
            .attr('id', node.name)
            .style('position', 'absolute')
            .style('height', 40 + 'px')
            .style('width', 40 + 'px')
            .style('background-color', 'yellow')
            .on('click', function(node) {
                var query = generate_query(graph, node);
                console.log('query: \n', query, '\n', node.query_param);
            });


        bottom_div.append('div')
            .attr('class', 'refresh-button')
            .classed('button', true)
            .attr('id', node.name)
            .style('position', 'absolute')
            .style('height', 40 + 'px')
            .style('width', 40 + 'px')
            .style('background-color', 'white')
            .on('click', function(node) {
                fill_tables(graph);
            });



        bottom_div.append('div')
            .attr('class', 'delete-selection')
            .classed('button', true)
            .attr('id', node.name)
            .style('position', 'absolute')
            .style('height', 40 + 'px')
            .style('width', 40 + 'px')
            .style('background-color', 'red')
            .on('click', function(node) {
                // delete selections
                node['query_param']['selection'] = [];
                fill_tables(graph);
            });

    });



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
                    return node.geometry.height - 80 + 'px';
                });

            var bottom_div = node_div.select('.bottom-container')
                .style('top', function(node) {
                    return node.geometry.height - 40 + 'px';
                })
                .style('width', function(node) {
                    return node.geometry.width + 'px';
                });



            top_div.select('.table-button')
                .style('left', function(node) {
                    return node.geometry.width - 150 + 'px';
                });

            top_div.select('.chart-button')
                .style('left', function(node) {
                    return node.geometry.width - 100 + 'px';
                });



            top_div.select('.button-sprite')
                .style('left', function(node) {
                    return node.geometry.width - 15 + 'px';
                });

            top_div.select('.input-window')
                .style('left', function(node) {
                    return node.geometry.width - 50 + 'px';
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


        })
        .each(function(node) { // updating container visualization

            var view_construct_for_view_type = {
                'TableView': TableView,
                'BarChartView': BarChartView
            }


            var node_div = d3.select(this);

            var gridContainer = node_div.select('.middle-container');
            // te vajag if kur paskatamies kāds ir aktīvais tips
            if (!node.current_visualization_view) { // ja vispār nav, ta jāizveido un jārefrešo  
                //onsole.log(node.name, 'nav view string');
                var view_constructor = view_construct_for_view_type[node.active_visualization_type];

                node.current_visualization_view = view_constructor().init(gridContainer.node(), node, graph);


            } else if (node.current_visualization_view.type == node.active_visualization_type) {
                //console.log(node.name, 'refrešo eksistējošu');
                // jau eksistē pareizais, vajag tikai refreshot
                node.current_visualization_view.refresh_view_from_node();

            } else { // eksistē cits tips, to vajag aizvākt, izveidot jaunu un refreshot
                //console.log(node.name, 'maina vizualiz');
                node.current_visualization_view.destroy();


                var view_constructor = view_construct_for_view_type[node.active_visualization_type];
                node.current_visualization_view = view_constructor().init(gridContainer.node(), node, graph);

            }

            console.assert(node.current_visualization_view)

        });


    // remove
    nodes.exit()
        .remove();


    //
    // DRAW EDGES
    //

    // bind
    var edges = edge_canvas.selectAll('.query-edge')
        .data(edge_arr, function(d) {
            return d.name;
        });

    //create added
    edges.enter()
        .append('path')
        .classed('query-edge', true)

        .attr('marker-end', "url(#link_path_end)")
        .attr('id', function(node) {
            return node['name'];
        })

    // update all
    edges
    edges.each(function(edge) {

        updateEdgeCoordinates(graph, graph[edge.start]['geometry'], graph[edge.end]['geometry'], 5, edge.name);
    })
        .attr('d', function(d) {
            var path = 'M' + d.geometry.x1 + ',' + d.geometry.y1 + 'L' + d.geometry.x2 + ',' + d.geometry.y2;

            return path;
        })

    // delete removed
    edges.exit().remove()

    // NOW the same for red
    // bind data
    var red_edges = edge_canvas.selectAll('.query-edges_red')
        .data(edge_arr, function(d) {
            return d.name;
        })

    // create new
    red_edges.enter()
        .append('path')
        .classed('query-edges_red', true)
        .attr('stroke', "red")
        .attr('stroke-width', "9px")
        .attr('id', function(node) {
            return node['name'];
        })
        .on('click', function(d) {
            toggleWay(graph, d);
            return;
        });

    // update all
    red_edges
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
    red_edges.exit().remove();


    // bind lable 
    var lables = edge_canvas.selectAll('.text')
        .data(edge_arr, function(d) {
            return d.name;
        });

    //create new labels
    lables.enter() // no need for changing values
    .append('text')
        .attr('class', 'text')
        .text(function(d) {
            return d.name;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "20px")
        .attr("fill", "balck");

    // update labels
    lables // only changing values, dont append a secong time what is in the create section
    .attr('x', function(d) {
        return d.geometry['x'] || (d.geometry['x2'] - 20);
    })
        .attr('y', function(d) {
            return (d.geometry['y'] - 0) || (d.geometry['y2'] + 10);
        })

    // remove lables

    lables.exit().remove();
}

function fill_tables(graph) {

    _.chain(graph)
        .filter(function(elem) {
            return elem['type'] == 'node';
        })
        .each(function(node) {
            //var query = get_table_query(graph, node.name);
            //var query_template = _.template("select distinct ?<%= name %> where {{?<%= name %> ?p ?o} UNION {?s ?<%= name %> ?o} UNION {?s ?p ?<%= name %>}}");
            //console.log(node.name);
            console.log(node)
            show_loading_indicator(node);

            var query = generate_query(graph, node);
            conn.query({
                    database: 'myDB4',
                    query: query,
                    limit: 30,
                    offset: 0
                },
                function(data) {
                    // console.log(node['query_param']['selection']);
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


                    node['query_param']['selection'] = selection_intersection(node['query_param']['selection'], first_collum_obj); // gets those values that were in the graph selection before  need change 


                    console.assert(node.current_visualization_view)
                    //console.log(node.name, actual_results, node, node.current_visualization_view);
                    node.current_visualization_view.set_data(actual_results)

                    hide_loading_indicator(node);

                })
        });


}