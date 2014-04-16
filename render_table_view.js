function make_it() {
    var conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
    conn.setReasoning('QL');


    var container = d3.select('#query-graph-container')
        .style('position', 'relative');


    var edge_canvas = container.append('svg')
        .attr('width', 7000)
        .attr('height', 7000)
        .call(make_marker)
        .on('click', function(d) {
            // mousemove
            //console.log(d3.mouse(this));
            var x = d3.mouse(this)[0];
            var y = d3.mouse(this)[1];
            if (this == d3.event.target) {
                make_node(example_graph, x, y);
            }

            //console.log('hi', this, d3.event.target);
        });

    init_column_make_container();

    function toggleWay(graph, edge) {
        var start_node = edge['start'];
        var end_node = edge['end'];

        //console.log('swap', edge.name, graph[start_node], graph[end_node]);

        if ((_.contains(graph[start_node]['incoming_lines'], edge.name)) && !(_.contains(graph[end_node]['incoming_lines'], edge.name))) {
            graph[start_node]['incoming_lines'] = _.without(graph[start_node]['incoming_lines'], edge.name);

            graph[end_node]['incoming_lines'].push(edge.name);


        } else if (!(_.contains(graph[start_node]['incoming_lines'], edge.name)) && (_.contains(graph[end_node]['incoming_lines'], edge.name))) {
            graph[start_node]['incoming_lines'].push(edge.name);


        } else if ((_.contains(graph[start_node]['incoming_lines'], edge.name)) && (_.contains(graph[end_node]['incoming_lines'], edge.name))) {
            graph[start_node]['incoming_lines'] = _.without(graph[start_node]['incoming_lines'], edge.name);
            graph[end_node]['incoming_lines'] = _.without(graph[end_node]['incoming_lines'], edge.name);



        } else if (!(_.contains(graph[start_node]['incoming_lines'], edge.name)) && !(_.contains(graph[end_node]['incoming_lines'], edge.name))) {
            graph[start_node]['incoming_lines'].push(edge.name);



        }
        render_graph(graph)
        fill_tables(graph);
    }

    function make_marker() {
        //console.log(this)
        var edge_canvas = this;
        edge_canvas.selectAll('marker')
            .remove();


        var end_marker = edge_canvas.append('marker')
        //.attr('style', ' markerWidth="6" markerHeight="6" orient="auto"')
        .attr('id', 'link_path_end')
            .attr('viewBox', '-10 -5 10 10')
            .attr('refX', -2)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M-10,-5L0,0L-10,5')
            .attr('fill', 'steelblue');

        var end_red_marker = edge_canvas.append('marker')
            .attr('id', 'link_path_end_red')
            .attr('viewBox', '-10 -5 10 10')
            .attr('refX', -2)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M-10,-5L0,0L-10,5')
            .attr('fill', 'red');

        var start_marker = edge_canvas.append('marker')
            .attr('id', 'link_path_start')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 2)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M10,-5L0,0L10,5')
            .attr('fill', 'red');


    }

    function get_max_element_number(graph, element) {
        var node_num = _.chain(graph)
            .filter(function(obj) {
                //console.log(obj)
                if (obj['type'] == element) {
                    return obj.name;
                }
            })
            .map(function(node_name) {
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

    function make_node(graph, x, y) {

        //guid()
        var table_name;
        console.log(graph)

        table_name = 't' + get_max_element_number(graph, 'node');


        //table_name
        var temp = {
            'name': table_name,
            'query_var_name': table_name,
            'type': 'node',
            'incoming_lines': [],
            'query_param': {
                'input': null,
                'selection': []
            },
            'geometry': {
                'x': x,
                'y': y,
                'width': 1010,
                'height': 500,
            },
            'active_visualization_type': 'TableView', // must be one of keys in visualization_defs
            'visualization_defs': {
                'TableView': {

                },
                'BarChartView': {
                    'properties': {
                        'y_axis_column': '??'
                    }
                }
            },
            'columns': [
                // {
                //     // data property
                //     'column_label' : 'label',
                //     'property_name' : 'rdfs:label'
                // }
            ]
        }
        graph[table_name] = temp;

        render_graph(graph);
        fill_tables(graph);

    }


    function destroy_node(graph, node) {
        //console.log(node.name, graph);
        // 
        var edges = _.filter(graph, function(obj) {
            if (obj['type'] == 'edge') {
                return obj;
            }
        });

        var hyper_edges = _.filter(graph, function(obj) {
            if (obj['type'] == 'hyper_edge') {
                return obj;
            }
        });

        delete graph[node.name];

        var need_to_delete_these_edges = [];
        _.each(edges, function(edge) {

            if (edge.start == node.name) {
                graph[edge.end]['incoming_lines'] = _.without(graph[edge.end]['incoming_lines'], edge.name);
                delete graph[edge.name];
                return;
            }
            if (edge.end == node.name) {
                //console.log(edge.start, node.name);
                graph[edge.start]['incoming_lines'] = _.without(graph[edge.start]['incoming_lines'], edge.name);
                delete graph[edge.name];
                return;
            }
        })

        _.each(hyper_edges, function(hyp) {

            if (graph[hyp.start] == undefined) {
                graph[hyp.end]['incoming_lines'] = _.without(graph[hyp.end]['incoming_lines'], hyp.name);
                delete graph[hyp.name];
            } else if (graph[hyp.end] == undefined) {
                graph[hyp.start]['incoming_lines'] = _.without(graph[hyp.start]['incoming_lines'], hyp.name);
                delete graph[hyp.name];
            }

        })

        //console.log(need_to_delete_these_edges);
        //delete_edges_after_nodes(graph, need_to_delete_these_edges);

        //console.log(need_to_delete_these_edges);
        //graph = _.omit(graph, node.name);
        //console.log(node.name, graph);
        render_graph(graph);
        fill_tables(graph);
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

    function updateEdgeCoordinates(graph, node1_geo, node2_goe, ah, link_name) { //????????
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

    // var drag = d3.behavior.drag()
    //       .origin(function(d) {
    //         //console.log(d);
    //         return d.geometry;
    //       })
    //       .on("drag", function(d) {
    //         // console.warn('move node', d.name)                 
    //         d.geometry.x = d3.event.x;
    //         d.geometry.y = d3.event.y;  
    //         render_graph(example_graph);
    //       });

    // counter = 1;
    // var resize = d3.behavior.drag()
    //       .origin(function(node) {
    //         console.log(node.geometry)
    //         // return node.geometry;
    //         return {
    //             x: node.geometry.width,
    //             y: node.geometry.height
    //         }
    //       })

    //       .on("drag", function(node) {
    //         counter = counter + 1;
    //         console.warn('resize node', counter)                
    //         new_width = d3.event.x;
    //         new_height = d3.event.y;

    //         node.geometry.width = Math.max(new_width, 350);
    //         node.geometry.height = Math.max(new_height, 350);

    //         render_graph(example_graph);
    //       });

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
            render_graph(example_graph);

        })
        .on('dragend', function(d) {
            drag_type = null;
        })


        function render_graph(graph) {



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
                .style('background-color', 'indianred')
                .attr('id', function(node) {
                    return node['name'];
                })
                .call(ultimate_drag)
            //.call(drag)

            .call(function(node) {
                var node_div = this;

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
                    .style('position', 'absolute')
                    .style('top', '-15px')
                    .on('click', function(node) {
                        destroy_node(graph, node);
                    })

                top_div.append('div')
                    .attr('class', 'input-window')
                    .classed('btn btn-primary', true)
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
                .attr('stroke', "steelblue")
                .attr('stroke-width', "2px")
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



        function are_equal_as_sets(obj_1, obj_2) {

            return _.isEqual(obj_1, obj_2);
            //return _.isEmpty(_.difference(array_1, array_2)) && _.isEmpty(_.difference(array_2, array_1));
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



                            //console.log(node.name, actual_results, node, node.current_visualization_view);
                            node.current_visualization_view.set_data(actual_results)

                        })
                });


        }

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
                        return '(' + column.aggregation_function + '(?' + get_edge_name_fom_hyper(graph, column.what_to_aggregate) + ') AS ?' + column_name_generator(node, column) + ')';
                    } else {

                        return '(' + column.aggregation_function + '(?' + column.what_to_aggregate + ') AS ?' + column_name_generator(node, column) + ')';
                    }

                } else {
                    return '?' + column_name_generator(node, column);
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
                    return 'ASC(?' + column_name_generator(node, column) + ')';
                } else {
                    return 'DESC(?' + column_name_generator(node, column) + ')';
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



    example_graph = {

        't1': {
            'name': 't1',
            'query_var_name': 't1',
            'type': 'node',
            'incoming_lines': ['l1'],
            'query_param': {
                'input': null,
                'selection': [{
                    value: 'http://example.com/ontology1#wife',
                    type: 'uri'
                }]
            },
            'geometry': {
                'x': 150,
                'y': 125,
                'width': 1010,
                'height': 500
            },
            'active_visualization_type': 'TableView', // must be one of keys in visualization_defs
            'visualization_defs': {
                'TableView': {

                },
                'BarChartView': {
                    'properties': {
                        'y_axis_column': '??'
                    }
                }
            },
            'columns': [{
                // data property
                'id': '86ee15e2-2415-4b01-93f9-1fd9b8656d6f',
                'type': 'direct',
                'column_label': 'label1',
                'property_name': 'rdfs:label',
                'sort': 'none'
            }, {
                // data property
                'id': 'aeac50f1-7173-4330-80d3-2afb0f991726',
                'type': 'direct',
                'column_label': 'label2',
                'property_name': '<http://example.com/ontology1#wife>',
                'sort': 'ascending'
            }]
        },
        't2': {
            'name': 't2',
            'query_var_name': 't2',
            'type': 'node',
            'incoming_lines': ['l1'],
            'query_param': {
                'input': null,
                'selection': []
            },
            'geometry': {
                'x': 1750,
                'y': 125,
                'width': 1010,
                'height': 500,
            },
            'active_visualization_type': 'TableView', // must be one of keys in visualization_defs
            'visualization_defs': {
                'TableView': {

                },
                'BarChartView': {
                    'properties': {
                        'y_axis_column': '01ca3ae0-b85c-409b-97a7-6dca85860f88'
                    }
                }
            },
            'columns': [{
                // data property
                'id': 'e11a9728-47a6-4e58-a9e8-5f897ab8223d',
                'type': 'direct',
                'column_label': 'label',
                'property_name': 'rdfs:label',
                'sort': 'ascending'
            }, {
                // data property
                'id': 'e8727bc7-1279-4fb0-897a-84c6f73abce8',
                'type': 'aggregate',
                'column_label': 'count_l1',
                'aggregation_function': 'count',
                'what_to_aggregate': 'l1',
                'sort': 'descending'
            }, {
                // data property
                'id': '01ca3ae0-b85c-409b-97a7-6dca85860f88',
                'type': 'aggregate',
                'column_label': 'count_t1',
                'aggregation_function': 'count',
                'what_to_aggregate': 't1',
                'sort': 'none'

            }]
        },
        't3': {
            'name': 't3',
            'query_var_name': 'l1',
            'type': 'node',
            'incoming_lines': ['hl1'],
            'query_param': {
                'input': null,
                'selection': []
            },
            'geometry': {
                'x': 950,
                'y': 885,
                'width': 1010,
                'height': 500,
            },
            'active_visualization_type': 'TableView', // must be one of keys in visualization_defs
            'visualization_defs': {
                'TableView': {

                },
                'BarChartView': {
                    'properties': {
                        'y_axis_column': '??'
                    }
                }
            },
            'columns': [{
                // data property
                'id': 'b67cd1b3-fce5-4461-9d4e-d798cda96c60',
                'type': 'direct',
                'column_label': 'label',
                'property_name': 'rdfs:label',
                'sort': 'ascending'
            }, {
                // data property
                'id': 'c3bb4b62-cd8b-4125-87d2-1409a01039e9',
                'type': 'aggregate',
                'column_label': 'count',
                'aggregation_function': 'count',
                'what_to_aggregate': 'hl1',
                'sort': 'none'
            }]
        },

        'l1': {
            'name': 'l1',
            'query_var_name': 'l1',
            'incoming_lines': ['hl1'],
            'geometry': {
                'x1': 1155,
                'y1': 375,
                'x2': 1755,
                'y2': 375
            },
            'start': 't1',
            'end': 't2',
            'type': 'edge'
        },
        'hl1': {
            'name': 'hl1',
            'query_var_name': 'hl1',
            'incoming_lines': [],
            'geometry': {
                'x1': 1440,
                'y1': 885,
                'x2': 1440,
                'y2': 375

            },
            'start': 't3',
            'end': 'l1',
            'type': 'hyper_edge'
        }
    }

    render_graph(example_graph);
    fill_tables(example_graph);


    // function highlight(node) {

    // }

    function constraint(graph, elem, from_elem, visited) {
        var patterns = [];
        switch (elem['type']) {
            case 'node':
                var node = elem;
                //console.log(elem.name);
                if (elem == from_elem) { // need to ignore local selection
                    patterns.push(local_filter(node));
                    patterns.push(local_column_queries(node));
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
                    patterns.push(local_filter(edge));
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



    function elem_var_str(elem) {
        return '?' + elem; // does not work with edges
    }

    function local_constraint(graph, elem) {
        var pattern = '';
        switch (elem['type']) {
            case 'node':
                var node = elem;
                //console.log('mm');

                pattern = local_filter(node) + '\n' + local_selection(graph, node);
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

    function get_type_filter_input(node) { // lot of change
        if (_.isString(node['query_param']) && node['query_param']['input'].lenght > 0) {
            return node['query_param']['input'];
        } else {
            return null;
        }
    }

    function local_filter(node) {
        var pattern = '';
        var type_filter_input = get_type_filter_input(node);
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

    d3.select("body") // why here?
    .on("keydown", function() {
        //console.log('edge', d3.event.keyCode);
        if (d3.event.keyCode == 16) {
            make_edge1(example_graph)
            return;
        };
    });


    function make_edge1(graph) {
        var container = d3.select('#query-graph-container');
        var nodes = container.selectAll('.query-node');
        var edges = edge_canvas.selectAll('.query-edges_red');

        edges.on('click', function(edge) {
            console.log('click_edge1');
            make_edge2(graph, edge, edge.type);

        });

        nodes.on('click', function(node) {
            console.log('click');
            make_edge2(graph, node, node.type);

        });
        console.log(nodes, edges);
    }

    function make_edge2(graph, elem, type) {
        //console.log(elem);
        var container = d3.select('#query-graph-container');
        var nodes = container.selectAll('.query-node');
        var edges = edge_canvas.selectAll('.query-edges_red');

        var finish_making_edge = function(node2) {
            console.log('click_edge2');
            if (elem.name == edge.name) {
                return;
            } else if (type == 'edge' || type == 'hyper_edge') {
                draw_edge(graph, elem, edge);
                d3.event.stopPropagation();
                return;
            }
        }

        var finish_making_edge = function(node2) {
            //console.log('click2', node2.name, d3.event.keyCode);
            if (elem.name == node2.name) {
                return;
            } else if (type == 'edge' || type == 'hyper_edge') {
                draw_edge(graph, elem, node2);
                d3.event.stopPropagation();
                nodes.on('click', null);
            } else {
                draw_edge(graph, elem, node2);
                d3.event.stopPropagation();
                nodes.on('click', null);

                return;
            }
        }

        nodes.on('click', finish_making_edge)

        edges.on('click', finish_making_edge)
    }

    function draw_edge(graph, elem1, elem2) {
        //console.log(node, node2);

        if (elem1.type == 'edge' || elem2.type == 'edge') {
            var edge_name = 'hl' + get_max_element_number(graph, 'edge')
        } else {
            var edge_name = 'l' + get_max_element_number(graph, 'edge') // needs better name giving XD
        }

        var edge = edge_name;
        if (elem1.type == 'node') {
            var x1 = elem1['geometry']['x'];
            var y1 = elem1['geometry']['y'];
        } else {
            var elem1_short = elem1['geometry'];
            var x1 = Math.min(elem1_short.x2, elem1_short.x1) + Math.abs((elem1_short.x2 - elem1_short.x1) / 2);
            var y1 = Math.min(elem1_short.y2, elem1_short.y1) + Math.abs((elem1_short.y2 - elem1_short.y1) / 2);
        }

        if (elem2.type == 'node') {
            var x2 = elem2['geometry']['x'];
            var y2 = elem2['geometry']['y'];
        } else {
            var elem2_short = elem2['geometry'];
            var x2 = Math.min(elem2_short.x2, elem2_short.x1) + Math.abs((elem2_short.x2 - elem2_short.x1) / 2);
            var y2 = Math.min(elem2_short.y2, elem2_short.y1) + Math.abs((elem2_short.y2 - elem2_short.y1) / 2);
        }


        if (elem1.type == 'edge' || elem2.type == 'edge') {
            edge_template = {
                'name': edge_name,
                'query_var_name': edge_name,
                'incoming_lines': [],
                'geometry': {
                    'x1': x1,
                    'y1': y1,
                    'x2': x2,
                    'y2': y2
                },
                'start': elem1.name,
                'end': elem2.name,
                'type': 'hyper_edge'
            }
        } else {
            edge_template = {
                'name': edge_name,
                'query_var_name': edge_name,
                'incoming_lines': [],

                'geometry': {
                    'x1': x1,
                    'y1': y1,
                    'x2': x2,
                    'y2': y2
                },
                'start': elem1.name,
                'end': elem2.name,
                'type': 'edge'
            }
        }



        graph[elem1.name]['incoming_lines'].push(edge_name);
        graph[elem2.name]['incoming_lines'].push(edge_name);
        //console.log(elem1, elem2)
        graph[edge_name] = edge_template;
        updateEdgeCoordinates(graph, elem1['geometry'], elem2['geometry'], 5, edge_name);

        render_graph(graph);
        fill_tables(graph);

    }

    function change_node_size(graph, node, dx, dy) {
        var new_width = node.geometry.width + dx;
        var new_height = node.geometry.height + dy;

        node.geometry.width = _.max([new_width, 350]);
        node.geometry.height = _.max([new_height, 400]);
    }



    function local_column_queries(node) {
        return _.map(node.columns, function(column) {
            if (column.property_name == undefined) {
                return;
            } else {

                return 'OPTIONAL { ?' + node.name + '  ' + column.property_name + '  ?' + column_name_generator(node, column) + ' . } .';
            }
        }).join('\n');
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

    function selection_to_obj(selection, obj_arr, node) {
        var return_value = [];

        return_value = _.filter(obj_arr, function(obj) {
            //console.log(selection, obj[node.name]['value']);
            if (_.contains(selection, obj[node.name]['value'])) {
                return;
            }

            if (return_value.length == 0) {
                return [];
            } else {
                return return_value; // need better neme
            }
        })
    }



    function input_info() {
        var name = prompt("Please enter your name", "")
        var Age = prompt("Please enter your Age", "")
        if (name != null && name != "") {
            if (Age != null && Age != "") {
                document.write("Hello " + name + "! Your age is " + Age);
            }
        }
    }


    $(document.body).on('click', '.dropdown-menu li', function(event) { // problem with scope?

        console.log('list');

        var li = d3.select(event.currentTarget);
        console.log(li.node(), li.datum().data.node, li.datum().data.update(li.datum().value)) // somehow this does not work


        render_columns(example_graph, li.datum().data.node); // need node of this collumn 
        render_graph(example_graph);
        fill_tables(example_graph); // this cuould not be good
        // this here



    });

}