<!DOCTYPE HTML>
<html>
    <head>
    <meta charset='utf-8'>
        <meta http-equiv='X-UA-Compatible' content='IE=edge'>
        <title></title>
        <meta name='description' content=''>
        <meta name='viewport' content='width=device-width, initial-scale=1'>

        <script src='bower_components/jquery/jquery.min.js' type='text/javascript'></script>
        <script src='bower_components/jquery-migrate/jquery-migrate.js' type='text/javascript'></script>  <!-- needed for slick grid, because uses features removed from jquery 1.9 -->
        <script src='bower_components/underscore/underscore.js' type='text/javascript'></script>
        <script src='bower_components/stardog/js/stardog.js' type='text/javascript'></script>
        <script src='bower_components/d3/d3.js' type='text/javascript'></script>
        <script src='bower_components/vega/vega.js' type='text/javascript'></script>

        <!-- bootstrap -->
        <link rel='stylesheet' href='bower_components/bootstrap/dist/css/bootstrap.min.css' type='text/css'/>
        <script src='bower_components/bootstrap/dist/js/bootstrap.min.js'></script>
        

        <!-- SlickGrid -->
        <script src='bower_components/slickgrid/lib/jquery.event.drag-2.0.min.js'></script>
        <script src='bower_components/slickgrid/slick.core.js'></script>
        <script src='bower_components/slickgrid/slick.grid.js'></script>
        <script src="bower_components/slickgrid/plugins/slick.rowselectionmodel.js"></script>


        <link rel='stylesheet' href='bower_components/slickgrid/slick.grid.css' type='text/css'/>
        <link rel='stylesheet' href='bower_components/slickgrid/css/smoothness/jquery-ui-1.8.16.custom.css' type='text/css'/>
        <link rel='stylesheet' href='bower_components/slickgrid/examples/examples.css' type='text/css'/>


        <script src="./lib/firebugx.js"></script>

        <script src="./lib/jquery-1.7.min.js"></script>
        <script src="./lib/jquery-ui-1.8.16.custom.min.js"></script>
        <script src="./lib/jquery.event.drag-2.2.js"></script>





        <script src="./slick.core.js"></script>
        <script src="./slick.formatters.js"></script>
        <script src="./slick.grid.js"></script>

        <script src="./plugins/slick.checkboxselectcolumn.js"></script>
        <script src="./plugins/slick.autotooltips.js"></script>
        <script src="./plugins/slick.cellrangedecorator.js"></script>
        <script src="./plugins/slick.cellrangeselector.js"></script>
        <script src="./plugins/slick.cellcopymanager.js"></script>
        <script src="./plugins/slick.cellselectionmodel.js"></script>
        <script src="./plugins/slick.rowselectionmodel.js"></script>
        <script src="./controls/slick.columnpicker.js"></script>

        <script src="./slick.editors.js"></script>

          <style>
            .cell-title {
              font-weight: bold;
            }

            .cell-effort-driven {
              text-align: center;
            }
          </style>

    </head>


</head>
<body>


<select id='box'>
  <option value="first">first</option>
  <option value="second">second</option>
  <option value="both">both</option>
  <option value="none">none</option>
</select>

  <tr>
    <div  style = 'position: absolute; left: 150px; top: 125px; width: 1010px; height: 500px; color: black; background-color: rgb(205, 92, 92);'>
    <input id='val1' type=text>
      <div id="myGrid" style="width:1010px;height:500px;"></div>
    </div>
  <td>


<input id='val3' type=text style='position: absolute; left: 1565px; top: 460px;'>

  <tr>

    <div style = 'position: absolute; left: 1750px; top: 125px; width: 1010px; height: 500px; color: black; background-color: rgb(205, 92, 92);'>
    <input id='val2'type=text>
      <div id="myGrid2" style="width:1010px;height:500px;"></div>
    </div>

    <td>
    <svg>
        <marker id="link_path_end" viewBox="0 -5 10 10" refX="0" refY="0" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,-5L10,0L0,5" fill="steelblue"></path></marker>
        <path d="M1160,500L1740,500" stroke="steelblue" stroke-width="2px" fill="none" marker-end="url(#link_path_end)"></path>



        <marker id="link_path_end" viewBox="0 -5 10 10" refX="0" refY="0" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,-5L10,0L0,5" fill="steelblue"></path></marker>
        <path d="M1440,900L1440,510" stroke="steelblue" stroke-width="2px" fill="none" marker-end="url(#link_path_end)"></path>
    </svg>


    <div style = 'position: absolute; left: 950px; top: 885px; width: 1010px; height: 500px; color: black; background-color: rgb(205, 92, 92);'>
      <div id="myGrid3" style="width:1010px;height:500px;"></div>
    </div>


        <script type='text/javascript'>

        example_graph = {
                't1': {
                    'type' : 'node',
                    'incoming_lines': ['l1'],
                    'query_param': {
                        'input': null,
                        'selection': []
                    }
                    'geometry' : {
                        'x' : 5,
                        'y' : 25,
                        'width' : 450,
                        'height' : 250,
                    },
                't2': {
                    'type' : 'node',
                    'incoming_lines': null,
                    'query_param': {
                        'input': null,
                        'selection': []
                    }
                    'geometry' : {
                        'x' : 505,
                        'y' : 25,
                        'width' : 450,
                        'height' : 250,
                    }
                },
                't3': {
                    'type' : 'node',
                    'incoming_lines': ['l2'],
                    'query_param': {
                        'input': null,
                        'selection': []
                    }
                    'geometry' : {
                        'x' : 5,
                        'y' : 325,
                        'width' : 450,
                        'height' : 250,
                    }
                },
                'l1': {
                    'start': 't1',
                    'end': 't2',
                    'type': 
                }
                'l2': {
                    'start': 'l1',
                    'end': 't3',
                    'type': 'eage'
                }
            }
        };

        function get_constaint(val1, table_name, selection) { // val1 is global for its inputfield

            var link = get_link(table_name); // link could not bee
            var selection_bool;

            if(selection == undefined) {
                selection_bool = false
            } else {
                selection_bool = true;
            }

            var selection = get_selection(table_name);

            if(selection_bool == true) {
                var query = 'select distinct ?table1 where { value ?table1 {' + selection + '} . ' + link + '}';
            }

            var query = 'select distinct ?table1 where { ?table1 a ' + val + ' . ' + link + '}';

            return query;
        }

        function get_link(table_name, selection_bool, selection) { // some are optional
            var link_name = example_graph[table_name]['incoming_lines'][0];// will need a filter because of the array

            var from = example_graph[link_name]['start'];
            var to = example_graph[link_name]['end'];

            var link_query = from + ' ' + link_name + ' ' + to + ' .'; // need some checking if this exists

            //link_query = ''; is a posibility

            return link_queryl;
        }

        function get_selection(bool, selection) {
            // get the array
            

        }

        function check() {
            var e = document.getElementById('box');
            var str = e.options[e.selectedIndex].text;

            console.log(str);

            return str;

            //if (str === "first") { 
            //alert('Hi');
            //}

        }


            function formatter(row, cell, value, columnDef, dataContext) {
                return value;
            }

        var text1, text2, text3, text4;
        var table1_grid;

        var table1, table2;
        $(document).ready(function(){
              $("#val1").keyup(function(){
                    if(event.keyCode == 13) {
                        text1 = this.value;
                        if(check() == 'first' || check() == 'both') {
                            render_first_table();
                            render_second_table();
                            render_third_table();
                        }    
                    }
                
              });
        });


        $(document).ready(function(){
              $("#val2").keyup(function(){
                    if(event.keyCode == 13) {

                        text2 = this.value;
                        if(check() == 'second' || check() == 'both') {
                            render_first_table();
                            render_second_table();
                            render_third_table();
                        }
                    }
                
              });
        });
        $(document).ready(function(){
              $("#val3").keyup(function(){
                    if(event.keyCode == 13) {
                        text3 = this.value;
                        render_first_table();
                        render_second_table();
                        render_third_table();

                    }
                
              });
        });

        function dirty_hack2(value) {
            var query = 'PREFIX : <http://myvehicledata.com/> SELECT ?table2 WHERE { { SELECT ?table1 ?link ?table2  WHERE { ' 
                            + value
                            + '} } }';
            return query;   
        }

        function dirty_hack1(value) {
            var query = 'PREFIX : <http://myvehicledata.com/> SELECT ?table1 WHERE { { SELECT ?table1 ?link ?table2  WHERE { ' 
                            + value
                            + '} } }';
            return query;   
        }

        function table_value_render(t1_value, value_name) {
            //var konst = '?xyz';
            if(typeof(t1_value) == 'undefined') {
                return '?' + value_name;
            }else if(t1_value.length == 0) {
                return '?' + value_name;
            } else if(t1_value[0] == '<' || t1_value[0] == '?'){
                return t1_value;
            }else {
                console.log(t1_value[0]);
                return '<' + t1_value + '>';
            }
            
        }
        
        function make_query(val1, val2) {
            var query = 'select distinct ?table1 where { ?table1 a ' + val1 + ' . ?table2 a ' + val2 + '}';

            return query;
        }
        function make_complex_selection_with_selected_values(data_bundle, val2, link) {
            var selection = ' ?table2 a ' + val2 + ' .  ?table1 ' + link + ' ?table2 . values ?table1 {' + data_bundle + '}. ';

            var query = dirty_hack2(selection);

            return query;
        }

        function make_complex_selection_with_selected_values_for_table3(data_bundle, val2, link) {
            var selection = 'select distinct ?link where { ?table2 a ' + val2 + ' .  ?table1 ' + link + ' ?table2 . values ?table1 {' + data_bundle + '}. }';

            return selection;
        }

        function make_complex_selection_with_selected_values_for_table3_from_table2(data_bundle, val1, link) {
            var selection = 'select distinct ?link where { ?table1 a ' + val1 + ' .  ?table1 ' + link + ' ?table2 . values ?table2 {' + data_bundle + '}. }';

            return selection;            
        }

        function make_complex_selection_with_selected_values_from_table2_to_table1(val1, data_bundle, link) {
            var selection = '?table1 a ' + val1 + ' .  ?table1 ' + link + ' ?table2 . values ?table2 {' + data_bundle + '} ';

            var query = dirty_hack1(selection);

            return query;
        }





        function make_selection_from_table2_to_table_one(val1, val2, link) {
            var selection = 'select distinct ?table2 where { ?table1 a ' + val2 + ' .  ?table1 ' + link + ' ?table2 . ?table2 a ' + val1 + '  .}';

            return selection;
        }

        function make_complex_selection(val1, val2, link) {
            var selection = 'select distinct ?table2 where { ?table2 a ' + val2 + ' . ?table2 a ' + link + ' . }';

            return selection;
        }


        function render_first_table(query) {

            console.log('ss');

            check();
            console.log(text1);
            text1 = table_value_render(text1, 't1');
            text2 = table_value_render(text2, 't2');
            text3 = table_value_render(text3, 'link');


            console.log(text1);
            if(query == undefined || query.length == 0) {
                query = make_query(text1, text2);
            }

            console.log(query);
            var ret;
            conn.query({
                    database: 'myDB3',
                    query: query,
                    limit: 30,
                    offset: 0
                },
                function(data) {
                    console.log(data);
                    var arr = [];
                   $(function () {
                        for (var i = 0; i < data.results.bindings.length; i++) {
                          var d = (arr[i] = {});

                          //d["p"] = data.results.bindings[i]['p']['value'];
                          d["table"] = data.results.bindings[i]['table1']['value'];
                          //d["o"] = data.results.bindings[i]['o']['value'];  
                        }
                    //dataView = new Slick.Data.Data.View;
                    table1_grid = new Slick.Grid("#myGrid", arr, columns, options);

                    table1_grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: true}));

                    table1_grid.onSelectedRowsChanged.subscribe(function() { 
                            row_ids = table1_grid.getSelectedRows();

                            var map = _.map(row_ids, function(values) {
                                return data.results.bindings[values];
                            });

                            get_first_data = _.map(map, function(obj) {
                                //console.log(obj);
                                return obj['table1']['value'];
                            });
                            //console.log(row_ids, map, get_first_data);

                            /*var string = '';
                            _.map(get_first_data, function(elem) {
                                string = string + '<' + elem + '>';
                            })*/
                            //console.log(string);
                            var cell_arr = _.chain(get_first_data)
                                .map(function(cell) {
                                    return '<' + cell + '>';
                                })
                                .value();

                            var query_value_data = cell_arr.join('');


                            

                            var query = make_complex_selection_with_selected_values(query_value_data, text2, text3);
                            var link_query = make_complex_selection_with_selected_values_for_table3(query_value_data, text2, text3);

                            check();

                            if(check() == 'first' || check() == 'both') {

                                console.log(query_value_data, query, link_query);
                                render_second_table(query);
                                render_third_table(link_query);

                            }




                    });

                    //var columnpicker = new Slick.Controls.ColumnPicker(columns, grid, options);
                    });
                });
        }

        function render_second_table(query) {

            //console.log('ss');

            text1 = table_value_render(text1, 't1');
            text2 = table_value_render(text2, 't2');
            text3 = table_value_render(text3, 'link');

            console.log(text1, text2, text3);


            if(query == undefined || query.length == 0) {
                query = make_complex_selection(text1, text2, text3);
            }
            

            

            //var value = table_value_render(inp1_value);
            //var query = make_query(complex_selec);

            console.log(query);
            conn.query({
                    database: 'myDB3',
                    query: query,
                    limit: 30,
                    offset: 0
                },
                function(data) {
                    console.log(data);
                    var arr = [];
                   $(function () {
                        for (var i = 0; i < data.results.bindings.length; i++) {
                          var d = (arr[i] = {});

                          //d["p"] = data.results.bindings[i]['p']['value'];
                          d["table"] = data.results.bindings[i]['table2']['value'];
                          //d["o"] = data.results.bindings[i]['o']['value'];  
                        }
                    //dataView = new Slick.Data.Data.View;
                    table2_grid = new Slick.Grid("#myGrid2", arr, columns, options);

                    table2_grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: true}));

                    table2_grid.onSelectedRowsChanged.subscribe(function() { 
                            row_ids = table2_grid.getSelectedRows();

                            var map = _.map(row_ids, function(values) {
                                return data.results.bindings[values];
                            });

                            get_first_data = _.map(map, function(obj) {
                                //console.log(obj);
                                return obj['table2']['value'];
                            });
                            //console.log(row_ids, map, get_first_data);


                            var cell_arr = _.chain(get_first_data)
                                .map(function(cell) {
                                    return '<' + cell + '>';
                                })
                                .value();

                            var query_value_data = cell_arr.join('');

                            if(check() == 'second' || check() == 'both') {

                                

                                var query = make_complex_selection_with_selected_values_from_table2_to_table1(text1, query_value_data, text3);
                                console.log(query_value_data, query );
                                render_first_table(query);

                                var link_query = make_complex_selection_with_selected_values_for_table3_from_table2(query_value_data, text1, text3)

                                render_third_table(link_query);
                            }

                    });

                    });
                });
        }


        function render_third_table(query) {

            text1 = table_value_render(text1, 't1');
            text2 = table_value_render(text2, 't2');
            text3 = table_value_render(text3, 'link');

            if(query == undefined || query.length == 0) {
                query = 'select distinct ?link where { ?table2 a ' + text2 + ' .  ?table1 ' + text3 + ' ?table2 . ?table1 a ' + text1 + ' .}';
            }

        
            console.log(query);
            conn.query({
                    database: 'myDB3',
                    query: query,
                    limit: 30,
                    offset: 0
                },
                function(data) {
                    console.log(data);
                    var arr = [];
                   $(function () {
                        for (var i = 0; i < data.results.bindings.length; i++) {
                          var d = (arr[i] = {});

                          //d["p"] = data.results.bindings[i]['p']['value'];
                          d["table"] = data.results.bindings[i]['link']['value'];
                          //d["o"] = data.results.bindings[i]['o']['value'];  
                        }
                    //dataView = new Slick.Data.Data.View;
                    table3_grid = new Slick.Grid("#myGrid3", arr, columns, options);

                    table3_grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: true}));

                });
            });

        };

        /*function shit_hits_the_fan(link, first, second) {
            

            var select1 = 'select distinct ?s ?x where { ?s a <' + second + '> . ?p <' + link + '> ?s . ?p a <' + first + '>  . }'


                //var select1 = 'select distinct ?s where { ?s a <' + type_value + '> . }';

            var ret;
            conn.query({
                    database: 'myDB2',
                    query: select1,
                    limit: 30,
                    offset: 0
                },
                function(data) {
                    console.log(data);
                    var arr = [];
                   $(function () {
                        for (var i = 0; i < data.results.bindings.length; i++) {
                          var d = (arr[i] = {});

                          //d["p"] = data.results.bindings[i]['p']['value'];
                          d["s"] = data.results.bindings[i]['s']['value'];
                          //d["o"] = data.results.bindings[i]['o']['value'];  
                        }
                    //dataView = new Slick.Data.Data.View;
                    //grid = new Slick.Grid("#myGrid2", arr, columns, options);
                    });
                    ret = arr;

                });
        }*/

        //console.log(text1);
          var grid;
          var data = [];
          var columns = [
            //{id: "p", name: "P", field: "p", width: 280, cssClass: "cell-title"},
            {id: "table", name: "Table", field: "table", width: 330},
            //{id: "o", name: "O", field: "o", width: 400},
          ];

          var options = {
            editable: true,
            enableCellNavigation: true,
            asyncEditorLoading: true,
            autoEdit: false
          };

            var conn = new Stardog.Connection();
            conn.setEndpoint('http://localhost:5820/'); 
            conn.setCredentials('admin', 'admin');
            conn.setReasoning('QL');
            
            render_first_table();
            render_second_table();
            render_third_table()
            /*conn.query({
                    database: 'myDB2',
                    query: select1,
                    limit: 30,
                    offset: 0
                },
                function(data) {
                    console.log(data);
                    var arr = [];
                   $(function () {
                        for (var i = 0; i < 30; i++) {
                          var d = (arr[i] = {});

                          d["p"] = data.results.bindings[i]['p']['value'];
                          d["s"] = data.results.bindings[i]['s']['value'];
                          d["o"] = data.results.bindings[i]['o']['value'];  
                        }
                    //dataView = new Slick.Data.Data.View;
                    grid = new Slick.Grid("#myGrid", arr, columns, options);
                    grid1 = new Slick.Grid("#myGrid2", arr, columns, options);                    

                        grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: true}));
                        grid1.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: true}));

                        //grid.setSelectionModel(new Slick.RowSelectionModel());
                        grid.onSelectedRowsChanged.subscribe(function() { 
                            row_ids = grid.getSelectedRows();

                            var map = _.map(row_ids, function(values) {
                                return data.results.bindings[values];
                            });

                            get_first_data = _.map(map, function(obj) {
                                //console.log(obj);
                                return obj['s']['value'];
                            });
                            //console.log(row_ids, map, get_first_data);

                            var string = '';
                            _.map(get_first_data, function(elem) {
                                string = string + '<' + elem + '>';
                            })
                            //console.log(string);

                            var select = 'select distinct ?s ?p ?o  where { ?s ?p ?o .  values ?s {' + string + '} }';
                            console.log(select);

                            var query = {
                                database: "myDB2",
                                query: select,
                                limit: 30,
                                offset: 0
                            };


                                conn.query(query,


                                function(mimi) {
                                    console.log(mimi);
                                    $(function () {
                                        var arr = [];
                                        for (var i = 0; i < mimi.results.bindings.length; i++) {
                                          var d = (arr[i] = {});
                                          
                                          d["p"] = mimi.results.bindings[i]['p']['value'];
                                          d["s"] = mimi.results.bindings[i]['s']['value'];
                                          d["o"] = mimi.results.bindings[i]['o']['value']; 
                                        }
                                    //grid1 = new Slick.Grid("#myGrid2", arr, columns, options);
                                    
                        
                                    grid1 = new Slick.Grid("#myGrid2", arr, columns, options);

                                    console.log(arr);

                                    });
                                });
                            });



                         var columnpicker = new Slick.Controls.ColumnPicker(columns, grid, options);
                         var columnpickers = new Slick.Controls.ColumnPicker(columns, grid1, options);

                    });
               });*/



            //console.log(data);
        </script>
    
    </body>
</html>