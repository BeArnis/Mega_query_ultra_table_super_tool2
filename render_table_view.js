function make_it(graph) {


    var container = d3.select('#query-graph-container')
        .style('position', 'relative');


    var edge_canvas = container.append('svg')
        .attr('width', 7000)
        .attr('height', 7000)
        .classed('edge_canvas', true)
        .call(make_marker)
        .on('click', function(d) {
            // mousemove
            //console.log(d3.mouse(this));
            var x = d3.mouse(this)[0];
            var y = d3.mouse(this)[1];
            if (this == d3.event.target) {
                make_node(graph, x, y);
            }

            //console.log('hi', this, d3.event.target);
        });

    init_column_make_container();

    

    function make_marker() {
        //console.log(this)
        var edge_canvas = this;
        edge_canvas.selectAll('marker')
            .remove();


        var end_marker = edge_canvas.append('marker')
        //.attr('style', ' markerWidth="6" markerHeight="6" orient="auto"')
        .attr('id', 'link_path_end')
            .classed('edge_marker', true)
            .attr('viewBox', '-10 -5 10 10')
            .attr('refX', -2)
            .attr('refY', 0)
            .attr('markerWidth', 4)
            .attr('markerHeight', 3)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M-10,-5L0,0L-10,5');

        var end_red_marker = edge_canvas.append('marker')
            .attr('id', 'link_path_end_red')
            .classed('edge_marker_end', true)
            .attr('viewBox', '-10 -5 10 10')
            .attr('refX', -2)
            .attr('refY', 0)
            .attr('markerWidth', 4)
            .attr('markerHeight', 4)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M-10,-5L0,0L-10,5');

        var start_marker = edge_canvas.append('marker')
            .attr('id', 'link_path_start')
            .classed('edge_marker_start', true)
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 2)
            .attr('refY', 0)
            .attr('markerWidth', 4)
            .attr('markerHeight', 4)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M10,-5L0,0L10,5');


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
                'type_arr': [],
                'current_type': null,
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



    function are_equal_as_sets(obj_1, obj_2) {

        return _.isEqual(obj_1, obj_2);
        //return _.isEmpty(_.difference(array_1, array_2)) && _.isEmpty(_.difference(array_2, array_1));
    }



    d3.select("body") // why here?
    .on("keydown", function() {
        //console.log('edge', d3.event.keyCode);
        if (d3.event.keyCode == 16) {
            make_edge1(graph)
            return;
        };
    });


    function make_edge1(graph) {
        var container = d3.select('#query-graph-container');
        var nodes = container.selectAll('.query-node');
        var edges = edge_canvas.selectAll('.query-edge');

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
        var edges = edge_canvas.selectAll('.query-edge');

        // var finish_making_edge = function(node2) {
        //     console.log('click_edge2');
        //     if (elem.name == edge.name) {
        //         return;
        //     } else if (type == 'edge' || type == 'hyper_edge') {
        //         draw_edge(graph, elem, edge);
        //         d3.event.stopPropagation();
        //         return;
        //     }
        // }

        var finish_making_edge = function(node2) {
            //console.log('click2', node2.name, d3.event.keyCode);
            if (elem.name == node2.name) {
                return;
            } else if (type == 'edge' || type == 'hyper_edge') {
                draw_edge(graph, elem, node2);
                d3.event.stopPropagation();
                nodes.on('click', null);
                edges.on('click', null);
            } else {
                draw_edge(graph, elem, node2);
                d3.event.stopPropagation();
                nodes.on('click', null);
                edges.on('click', null);

                return;
            }
        }

        

        if (type == 'edge' || type == 'hyper_edge') {
            console.log('not this');
            nodes.on('click', finish_making_edge)
        } else {
            console.log('yes this');
            edges.on('click', finish_making_edge);
            nodes.on('click', finish_making_edge);
        }

        
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




    $(document.body).on('click', '.column_ul', function(event) { // problem with scope?

        console.log('list');

        var li = d3.select(event.currentTarget);
        console.log(li.node(), li.datum().data.node, li.datum().data.update(li.datum().value)) // somehow this does works


        render_columns(graph, li.datum().data.node); // need node of this collumn 
        render_graph(graph);
        fill_tables(graph); // this cuould not be good
        // this here

    });

    // $(document.body).on('click', '.type_ul', function(event) { // problem with scope? worst word


    //     var li = d3.select(event.currentTarget);
    //     console.log(graph, this.options[this.selectedIndex].text) // wtf how to get the value?????
    //     d3.select(this)
    //         .attr('value', function(d) {
    //             d.query_param.current_type = this.options[this.selectedIndex].text;
    //             console.log(this)
    //         })
        
    //     render_graph(graph);
    //     fill_tables(graph); // on fill tables the index of combox is lost
    //     // this here
    //     // d3.select(this)
    //     //     .attr('value', function(d) {
    //     //         console.log(d.query_param['type_arr']); // need to wait to get the set
    //     //         // if (_.indexOf(d.query_param.type_arr, d.query_param.current_type) != -1) {
    //     //         //     this.selectedIndex = _.indexOf(d.query_param.type_arr, d.query_param.current_type);
    //     //         // }
                
    //     //     })


    // });

    $("#resize").click(function() {
        console.log('yes');
        var cols = grid.getColumns();
        cols[0].width = 120;
        grid.setColumns(cols);
    });


    console.assert(graph);

    render_graph(graph);
    fill_tables(graph);
}
