var pageContentEl = document.querySelector("#page-content");
var formEl = document.querySelector('#task-form');
var tasksToDoEl = document.querySelector("#tasks-to-do");
var taskIdCounter = 0;
var tasksInProgressEl = document.querySelector("#tasks-in-progress");
var tasksCompletedEl = document.querySelector("#tasks-completed");
var tasks = [];

var taskFormHandler = function (event) {

    event.preventDefault();
    var taskNameInput = document.querySelector("input[name='task-name']").value;
    var taskTypeInput = document.querySelector("select[name='task-type']").value;

    //input validation
    if (!taskNameInput || !taskTypeInput){
        alert("you need to fill out the task form!");
        return false;
    }

    formEl.reset();

    var isEdit = formEl.hasAttribute("data-task-id");
    // has data attribute, so get task id and call function to complete edit process
    if (isEdit) {
        var taskId = formEl.getAttribute("data-task-id");
        completeEditTask(taskNameInput, taskTypeInput, taskId);
    }
    // no data attribute, so create object as normal and pass to createTaskEl function
    else {
        var taskDataObj = {
            name: taskNameInput,
            type: taskTypeInput,
            status: "to do"
        };

        createTaskEl(taskDataObj);
    }

}

var createTaskEl = function(taskDataObj){
    // create list item
    var listItemEl = document.createElement("li");
    listItemEl.className = "task-item";

    // add task id as custom attribute
    listItemEl.setAttribute("data-task-id",taskIdCounter);

    // create div to hold task info and add to list item
    var taskInfoEl = document.createElement("div");
    taskInfoEl.className = "task-info";
    taskInfoEl.innerHTML = "<h3 class='task-name'>" + taskDataObj.name + "</h3><span class='task-type'>" + taskDataObj.type + "</span>";

    listItemEl.appendChild(taskInfoEl);

    taskDataObj.id = taskIdCounter;

    tasks.push(taskDataObj);
    saveTasks();

    var taskActionsEl = createTaskActions(taskIdCounter);
    listItemEl.appendChild(taskActionsEl);

    // add entire list item to list
    tasksToDoEl.appendChild(listItemEl);

    //increase task counter for next id
    taskIdCounter++;
}

var createTaskActions = function(taskId){
    var actionContainerEl = document.createElement("div");
    actionContainerEl.className = "task-actions";

    //create edit button
    var editButtonEl = document.createElement("button");
    editButtonEl.textContent = "Edit";
    editButtonEl.className = "btn edit-btn";
    editButtonEl.setAttribute("data-task-id", taskId);

    actionContainerEl.appendChild(editButtonEl);

    //create delete button
    var deleteButtonEl = document.createElement("button");
    deleteButtonEl.textContent = "Delete";
    deleteButtonEl.className = "btn delete-btn";
    deleteButtonEl.setAttribute("data-task-id", taskId);

    actionContainerEl.appendChild(deleteButtonEl);

    //create select element
    var statusSelectEl = document.createElement("select");
    statusSelectEl.className = "select-status";
    statusSelectEl.setAttribute("name", "status-change");
    statusSelectEl.setAttribute("data-task-id", taskId);

    actionContainerEl.appendChild(statusSelectEl);

    var statusChoices = ["To Do", "In Progress", "Completed"];

    for (var i = 0; i < statusChoices.length; i++){
        //create option element
        var statusOptionEl = document.createElement("option");
        statusOptionEl.textContent = statusChoices[i];
        statusOptionEl.setAttribute("value", statusChoices[i]);

        //append to select
        statusSelectEl.appendChild(statusOptionEl);
    }

    return(actionContainerEl);
}

var taskButtonHandler = function(event){
    var targetEl = event.target;

    if( event.target.matches(".delete-btn")){
        var taskId = event.target.getAttribute("data-task-id");
        deleteTask(taskId);
    }

    else if (targetEl.matches(".edit-btn")){
        var taskId = targetEl.getAttribute("data-task-id");
        editTask(taskId);
    }
}

var deleteTask = function(taskId){
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");
    taskSelected.remove();

    var updatedTaskArr = [];

    for (var i=0; i<tasks.length; i++) {
        //if tasks[i].id doesn't match the value of taskId, keep that task and push it into the array
        if (tasks[i].id !== parseInt(taskId)){
            updatedTaskArr.push(tasks[i]);
        }
    }
    //reasign tasks array to be updatedTaskArr
    tasks = updatedTaskArr;
    saveTasks();
}

var editTask = function(taskId){
    console.log("editing task #" + taskId);

    //get list item element
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

    //get content from task name and type
    var taskName = taskSelected.querySelector("h3.task-name").textContent;
    var taskType = taskSelected.querySelector("span.task-type").textContent;

    //update form fields with task details
    document.querySelector("input[name='task-name']").value = taskName;
    document.querySelector("select[name='task-type']").value = taskType;

    //change button to reflect save action
    document.querySelector("#save-task").textContent = "Save Task";

    //include taskid attribute in form
    formEl.setAttribute("data-task-id", taskId);


}

var completeEditTask = function(taskName, taskType, taskId){
    //find matching task list item
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

    //set new values
    taskSelected.querySelector("h3.task-name").textContent = taskName;
    taskSelected.querySelector("span.task-type").textContent = taskType;

    //loop through tasks array and task object with new content
    for (var i=0; i<tasks.length; i++){
        if (tasks[i].id === parseInt(taskId)){
            tasks[i].name = taskName;
            tasks[i].type = taskType;
        }
    }

    saveTasks();
    alert("Task Updated");

    formEl.removeAttribute("data-task-id");
    document.querySelector("#save-task").textContent = "Add Task";
}

var taskStatusChangeHandler = function(event){
    //get task item id
    var taskId = event.target.getAttribute("data-task-id");

    //get currently selected option's value and convert to lowercase
    var statusValue = event.target.value.toLowerCase();

    //find parent taks item element based on id
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

    if(statusValue === "to do"){
        tasksToDoEl.appendChild(taskSelected);
    }
    else if (statusValue === "in progress"){
        tasksInProgressEl.appendChild(taskSelected);
    }
    else if (statusValue === "completed"){
        tasksCompletedEl.appendChild(taskSelected);
    }

    //update task in task array
    for (var i=0; i<tasks.length; i++)  {
        if (tasks[i].id ===parseInt(taskId)){
            tasks[i].status = statusValue;
        }
    }
    saveTasks();
}

var saveTasks = function(){
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

var loadTasks = function (){
    //retrieve from local storage (comes back as JSON string)
    tasks = localStorage.getItem("tasks");
    console.log(tasks);

    //check if null (no tasks saved)
    if(!tasks){
        tasks = [];
        return(false);
    };

    //parse into object array
    tasks = JSON.parse(tasks);
    console.log(tasks);

    //print items to page
    for(var i=0; i < tasks.length; i++){
        tasks[i].id = taskIdCounter;
        console.log(tasks[i]);

        //create list item and add task id attribute
        var listItemEl = document.createElement("li");
        listItemEl.className = "task-item";
        listItemEl.setAttribute("data-task-id", tasks[i].id);
        console.log(listItemEl);

        //create div to store info
        var taskInfoEl = document.createElement("div");
        taskInfoEl.className = "task-info";
        taskInfoEl.innerHTML = "<h3 class='task-name'>" + tasks[i].name + "</h3><span class='task-type'>" + tasks[i].type + "</span>";

        //append info div and task actions to list item
        listItemEl.appendChild(taskInfoEl);
        var taskActionsEl = createTaskActions(tasks[i].id);
        listItemEl.appendChild(taskActionsEl);
        console.log(listItemEl);

        //append list item to correct column based on status
        if(tasks[i].status === "to do"){
            listItemEl.querySelector("select[name='status-change']").selectedIndex = 0;
            tasksToDoEl.appendChild(listItemEl);
        }else if(tasks[i].status === "in progress"){
            listItemEl.querySelector("select[name='status-change']").selectedIndex = 1;
            tasksInProgressEl.appendChild(listItemEl);
        }else if (tasks[i].status === "completed") {
            listItemEl.querySelector("select[name='status-change']").selectedIndex = 2;
            tasksCompletedEl.appendChild(listItemEl);
        }

        taskIdCounter++;

        console.log(listItemEl);
    }
}

pageContentEl.addEventListener("click", taskButtonHandler);
formEl.addEventListener("submit", taskFormHandler);
pageContentEl.addEventListener("change", taskStatusChangeHandler);

