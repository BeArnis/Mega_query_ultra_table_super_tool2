function init_query_graph(graph) {

    
    // makes container for all elements that will be handled
    var query_graph_container = d3.select('#query-graph-container')
        .style('position', 'relative');

    // makes container for all edges
    var edge_container = query_graph_container.append('svg')
        .attr('width', 4000)
        .attr('height', 2000)
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


    // catches the event that will make an edge
    d3.select('body')
    .on('keydown', function() {
        // event will happen when 'shift' is pressed    
        if (d3.event.keyCode == 16) {
            event_for_making_edge1(graph);
            return;
        }
    });

    





    // this will be deleted in the future
    $(document.body).on('click', '.column_ul', function(event) { // problem with scope?

        console.log('list');

        var li = d3.select(event.currentTarget);
        console.log(li.node(), li.datum().data.node, li.datum().data.update(li.datum().value)) // somehow this does works


        render_columns(graph, li.datum().data.node); // need node of this collumn 
        render_graph(graph);
        fill_tables(graph); 

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
    

    // for testing this is here
    //console.assert(graph);

    // calls functions that will show graph in the browser
    render_graph(graph);
    fill_tables(graph);
}
