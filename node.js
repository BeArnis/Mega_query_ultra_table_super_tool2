var stardog = require("stardog");

var conn = new stardog.Connection();

conn.setEndpoint("http://localhost:5820/");
conn.setCredentials("username", "password");

conn.query({ 
        database: "myDB", 
        query: "select distinct ?s where { ?s ?p ?o }",  
        limit: 10, 
        offset: 0 
    },
    function (data) {
        console.log(data.results.bindings);
});