// query that will exicute max 3 connections while otheres wait
//
throttled_query = (function() {
    waiting_tasks = [];
    var active_task_counter = 0;
    var max_active_tasks = 4;

    function run_waiting_tasks() {
        while (!_.isEmpty(waiting_tasks) && active_task_counter <= max_active_tasks) {
            active_task_counter++;
            var task_to_run = waiting_tasks.pop();


            conn.query(task_to_run[0],
                function(data) {
                    active_task_counter--;
                    run_waiting_tasks();
                    task_to_run[1](data);
                });
        }
    };

    return function(query_param, fn_when_finished) {

        waiting_tasks.push([query_param, fn_when_finished]);

        run_waiting_tasks();
    };
})();
