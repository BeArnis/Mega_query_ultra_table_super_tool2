// main container where graph elements will be stored
    var example_graph = {
        'prefixes': [{
                'prefix': 'rdf',
                'namespace': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
            }, 
            {
                'prefix': 'rdfs',
                'namespace': 'http://www.w3.org/2000/01/rdf-schema#'
            }, 
            {
                'prefix': 'xsd',
                'namespace': 'http://www.w3.org/2001/XMLSchema#'
            }, 
            {
                'prefix': 'owl',
                'namespace': 'http://www.w3.org/2002/07/owl#'
            },

            //specific need interface
            {
                'prefix': 'project1',
                'namespace': 'http://example.com/ontology1#'
        }],
        'database': 'nodeDB',
        'endpoint': 'http://localhost:5820/',
        'credentials': {
            'user': 'admin',
            'pass': 'admin'
        },
        'reasoning': 'QL',
        't1': {
            'name': 't1',
            'query_var_name': 't1',
            'type': 'node',
            'incoming_lines': ['l1'],
            'table_values': null, // need better word
            'query_param': {
                'type_query': '',
                'current_type': null,
                'type_arr': [],
                'selection': [{
                    value: 'http://example.com/ontology1#wife',
                    type: 'uri'
                }]  
            },
            'geometry': {
                'x': 150,
                'y': 125,
                'width': 1010,
                'height': 550
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
                'sort': 'none',
                'width': 330
            }, {
                // data property
                'id': 'aeac50f1-7173-4330-80d3-2afb0f991726',
                'type': 'direct',
                'column_label': 'label2',
                'property_name': '<http://example.com/ontology1#wife>',
                'sort': 'ascending',
                'width': 330
            }]
        },
        't2': {
            'name': 't2',
            'query_var_name': 't2',
            'type': 'node',
            'incoming_lines': ['l1'],
            'table_values': null, // need better word
            'query_param': {
                'type_query': '',
                'type_arr': [],
                'current_type': null,
                'selection': []
            },
            'geometry': {
                'x': 1750,
                'y': 125,
                'width': 1010,
                'height': 550
            },
            // must be one of keys in visualization_defs
            'active_visualization_type': 'TableView',
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
                //problem with lable columns, crashes barchart view

                // // data property
                // 'id': 'e11a9728-47a6-4e58-a9e8-5f897ab8223d',
                // 'type': 'direct',
                // 'column_label': 'label',
                // 'property_name': 'rdfs:label',
                // 'sort': 'ascending',
                // 'width': 330
            // }, {
                // data property
                'id': 'e8727bc7-1279-4fb0-897a-84c6f73abce8',
                'type': 'aggregate',
                'column_label': 'count_l1',
                'aggregation_function': 'count',
                'what_to_aggregate': 'l1',
                'sort': 'descending',
                'width': 330
            }, {
                // data property
                'id': '01ca3ae0-b85c-409b-97a7-6dca85860f88',
                'type': 'aggregate',
                'column_label': 'count_t1',
                'aggregation_function': 'count',
                'what_to_aggregate': 't1',
                'sort': 'none',
                'width': 330

            }]
        },
        't3': {
            'name': 't3',
            'query_var_name': 'l1',
            'type': 'node',
            'incoming_lines': ['hl1'],
            'table_values': null, // need better word
            'query_param': {
                'type_query': '',
                'type_arr': [],
                'current_type': null,
                'selection': []
            },
            'geometry': {
                'x': 950,
                'y': 885,
                'width': 1010,
                'height': 550
            },
            // must be one of keys in visualization_defs
            'active_visualization_type': 'TableView',
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
                'sort': 'ascending',
                'width': 330
            }, {
                // data property
                'id': 'c3bb4b62-cd8b-4125-87d2-1409a01039e9',
                'type': 'aggregate',
                'column_label': 'count',
                'aggregation_function': 'count',
                'what_to_aggregate': 'hl1',
                'sort': 'none',
                'width': 330
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
    };