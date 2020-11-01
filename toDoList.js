const addForm = document.forms.addForm;
const filters = document.querySelectorAll('.filter-checkbox');
const list = document.querySelector('.todolist');

const tasks = [];

function updateList(){
	list.innerHTML = '';
	for(let i = 0; i < tasks.length; i++){
		renderTask(tasks[i]);
	}
}

function updateListHeight() {
	let listItems = list.querySelectorAll('.task');
	
	// Отображаем по 3 элемента
	if (listItems.length > 3) {
		let height = 0;
		for (i = 0; i < 3; i++) {
			height = height + listItems[i].offsetHeight;
		}
		list.style.maxHeight = height+'px';
	}
}

function findTaskIndexById(taskId){
	let foundIndex = tasks.findIndex(item => item.id == taskId);
	
	return foundIndex;
}

async function getTasks(){
	let response = await fetch('http://127.0.0.1:3000/items');
	
	if (response.ok){
		let content = await response.json();
		
		for(let key in content){
			let task = content[key];
			tasks.push(task);
			renderTask(task);
		}
	}else{
		alert('Ошибка при загрузке данных с сервера!');
	}
}

async function addTask(task){
	let response = await fetch('http://127.0.0.1:3000/items', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json;charset=utf-8'
		},
		body: JSON.stringify(task)
	});
	

	if (response.ok){
		let result = await response.json();
		let id = parseInt(result.id);
		
		task.id = id;
		tasks.push(task);
		renderTask(task);
	}else{
		alert('Ошибка!');
	}
}

async function deleteTask(taskIndex){
	let response = await fetch(`http://127.0.0.1:3000/items/${tasks[taskIndex].id}`, {
		method: 'DELETE',
	});
	
	if (response.ok){
		tasks.splice(taskIndex,1);
		updateList();
	}else{
		alert('Ошибка!');
	}
}

async function changeTask(task){	
	let response = await fetch(`http://127.0.0.1:3000/items/${task.id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json;charset=utf-8'
		},
		body: JSON.stringify(task)
	});
	
	if (response.ok){
		let taskIndex =  findTaskIndexById(task.id);
		tasks.splice(taskIndex,1,task);
		updateList();
	}else{
		alert('Ошибка');
	}
}

function formatTime(datetime){
	if(datetime){
		datetime = new Date(datetime);
		return `${datetime.getDate()}/${datetime.getMonth()+1}/${datetime.getFullYear()} ${datetime.getHours()}:${datetime.getMinutes()}`;
	}else{
		return '';
	}
}

function createTaskResultText(task){
	let resultText = '';
	if (task.taskResult){
		resultText = `${task.taskResult} at ${formatTime(task.resultDate)}`;
	}
	return resultText;
}

function renderTask(task){	
	list.innerHTML += 
	     `<li class="task ${task.priority} ${task.taskResult}" id=${task.id}>
		     <label class="task-priority">${task.priority.toUpperCase().charAt(0)}</label>
		     <input class="input hidden" type="text" onblur="editTask(this);" onchange="editTask(this);">
		     <label class="task-text" onclick="showEditor(this);return false;">${task.text}</label>
			 <input class="task-button" type="image" src="resourses/images/button_done.png" onclick="setResult(this, 'done');return false;">
			 <input class="task-button" type="image" src="resourses/images/button_cancel.png" onclick="setResult(this, 'canceled');return false;">
			 <input class="task-button" type="image" src="resourses/images/button_delete.png" onclick="taskDelete(this);return false;">
			 <time class="task-creation-date" datetime="${task.creationDate}">${formatTime(task.creationDate)}</time>
			 <time class="task-result-date" datetime="${task.resultDate}">${createTaskResultText(task)}</time>
		 </li>`;
		 
	updateListHeight();
}

function createTask(taskData, taskId){
	if(!taskId){
		taskId  = parseInt(taskData.id);
	}
	
	let resultText = '';
	
	if (taskData.taskResult.toLowerCase() === 'done'){
		resultText = 'Done at ';
	}else if(taskData.taskResult.toLowerCase() === 'canceled'){
		resultText = 'Canceled at ';
	}
	
}

addForm.addEventListener('submit', function (event){
	event.preventDefault();
	
	let formData = new FormData(addForm);
	let now = new Date();
	formData.append('creationDate', now);
	formData.append('resultDate', '');
	formData.append('taskResult', '');
	
	let task = {};
	formData.forEach(function(value, key){
		if (key === 'priority'){
			task[key] = value.toLowerCase();
		}else{
			task[key] = value;
		}
	});
	
	let formInput = addForm.querySelector('.form-input');
	formInput.value = '';
	
	addTask(task);
});

 document.addEventListener("DOMContentLoaded", function (){
	 getTasks();
 });
 
 let lastResult = '';
 function checkRepeat(result){
	 let isRepeat = false;
	 if(lastResult === result){
		 isRepeat = true;
		 lastResult = '';
	 }else{
		 lastResult = result;
	 }
	 
	 return isRepeat;
 }
 
 function setResult(btn, result) {
	 let taskId = btn.closest('.task').getAttribute('id');
	 let taskIndex = findTaskIndexById(taskId);
	 
	 if (!checkRepeat(result)){
		 tasks[taskIndex].resultDate = new Date();
		 tasks[taskIndex].taskResult = result;
	 }else{
		 tasks[taskIndex].resultDate = '';
		 tasks[taskIndex].taskResult = '';
	 }
	 
	 changeTask(tasks[taskIndex]);
}

function taskDelete(btn){
	let taskId = btn.closest('.task').getAttribute('id');
	let task = findTaskIndexById(taskId);
	
	deleteTask(task);
}

function resetFilters(tasks){	
	for (i = 0; i < tasks.length; i++){
		tasks[i].classList.remove('hidden');
	}
}

function filterList(){	
    let tasks = list.querySelectorAll('.task');
	
	resetFilters(tasks);
	
	for (i = 0; i < tasks.length; i++){
		for (j = 0; j < filters.length; j++){
			if (filters[j].checked){
				let filterParameter = document.querySelector(`[for="${filters[j].id}"]`).textContent.toLowerCase();
				
				if(!tasks[i].classList.contains(filterParameter)){
					tasks[i].classList.add('hidden');
				}
			}
		}
	}
}

let desc = true;
function sortByDate(){		
	tasks.sort((a,b) => new Date(a.creationDate) - new Date(b.creationDate));
	
	if (desc){
		tasks.reverse();
	}
	
	desc = !desc;
	
	updateList();
}

function showEditor(label){
	let task = label.closest('.task');
	let input = task.querySelector('.input');
	
	label.classList.add('hidden');
	input.classList.remove('hidden');
	input.value = label.textContent;
	input.focus();
}

function editTask(input){
	let taskId = input.closest('.task').getAttribute('id');
	let taskIndex = findTaskIndexById(taskId);
	
	let label = input.closest('.task').querySelector('.task-text');
	
		if (input.value !== label.textContent){
			let ans = confirm('Сохранить изменения?');
			
			if(ans){
				let newTask = Object.assign(tasks[taskIndex]);
				newTask.text = input.value;
				changeTask(newTask);
			}
		}
		
		label.classList.remove('hidden');
		input.classList.add('hidden');
	}