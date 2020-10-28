let list = document.querySelector('.todolist');
let filters = document.querySelectorAll('.filter-checkbox');
let datesort = document.querySelectorAll('.datefilter-button-sort');

function updateListHeight() {
	let tasks = list.querySelectorAll('.task');
	
	// Отображаем по 3 элемента
	if (tasks.length > 3) {
		let height = 0;
		for (i = 0; i < 3; i++) {
			height = height + tasks[i].offsetHeight;
		}
		list.style.maxHeight = height+'px';
	}
}

async function getGetResponse(){
	let response = await fetch('http://127.0.0.1:3000/items');
	
	if (response.ok){
		let content = await response.json();
		
		for(let key in content){
			createTask(content[key]);
		}
	}else{
		alert('Ошибка при загрузке данных с сервера!');
	}
}

async function getPostResponse(taskData){
	let response = await fetch('http://127.0.0.1:3000/items', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json;charset=utf-8'
		},
		body: JSON.stringify(taskData)
	});
	

	if (response.ok){
		let content = await response.json();
		let id = parseInt(JSON.stringify(content.id));
		
		createTask(taskData, id);
	}else{
		alert('Ошибка!');
	}
}

async function getDeleteResponse(task){
	let itemId = task.getAttribute('id');
	
	let response = await fetch(`http://127.0.0.1:3000/items/${itemId}`, {
		method: 'DELETE',
	});
	
	if (response.ok){
		task.remove();
	}else{
		alert('Ошибка!');
	}
}

async function getPutResponse(task, label, oldLabel){
	let itemId = task.getAttribute('id');
	
	let response = await fetch(`http://127.0.0.1:3000/items/${itemId}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json;charset=utf-8'
		},
		body: taskToJson(task)
	});
	
	if (!response.ok){
		if (label && oldlabel){
			label.textContent = oldLabel;
		}
		
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
	
	list.innerHTML += 
	     `<li class="task flex-container-row ${taskData.priority.toLowerCase()} ${taskData.taskResult.toLowerCase()}" id=${taskId}>
		     <input class="input hidden" type="text" onblur="editTask(this);" onchange="editTask(this);">
		     <label class="task-text" onclick="changeTask(this);return false;">${taskData.task}</label>
			 <input class="task-button task-button-done" type="image" src="resourses/images/button_done.png" onclick="setDone(this);return false;">
			 <input class="task-button task-button-cancel" type="image" src="resourses/images/button_cancel.png" onclick="setCanceled(this);return false;">
			 <input class="task-button task-button-delete" type="image" src="resourses/images/button_delete.png" onclick="taskDelete(this);return false;">
			 <time class="task-creation-date" datetime="${taskData.creationDate}">${formatTime(taskData.creationDate)}</time>
			 <time class="task-result-date" datetime="${taskData.resultDate}">${resultText + formatTime(taskData.resultDate)}</time>
		 </li>`;
		 
	updateListHeight();
}

let addForm = document.forms.addForm;

addForm.addEventListener('submit', function (event){
	event.preventDefault();
	
	let formData = new FormData(addForm);
	let now = new Date();
	formData.append('creationDate', now);
	formData.append('resultDate', '');
	formData.append('taskResult', '');
	
	let taskData = {};
	formData.forEach(function(value, key){
    taskData[key] = value;
	});
	
	let formInput = addForm.querySelector('.form-input');
	formInput.value = '';
	
	getPostResponse(taskData);
});

 document.addEventListener("DOMContentLoaded", function (){
	 getGetResponse();
 });
 
 function setDone(btn){
	 let task = btn.closest('.task');
	 
	 task.classList.remove('canceled');
	 task.classList.toggle('done');
	 
	 if(task.classList.contains('done')){
		let now = new Date();
		task.lastElementChild.setAttribute('datetime', now);
		task.lastElementChild.textContent = `Done at ${formatTime(now)}`;
	 }else{
		task.lastElementChild.setAttribute('datetime', '');
		task.lastElementChild.textContent = '';
	 }
	 
	getPutResponse(task);
};

function setCanceled(btn){
	let task = btn.closest('.task');
	task.classList.remove('done');
	task.classList.toggle('canceled');
	
	if(task.classList.contains('canceled')){
		let now = new Date();
		task.lastElementChild.setAttribute('datetime', now);
		task.lastElementChild.textContent = `Canceled at ${formatTime(now)}`;
	}else{
		task.lastElementChild.setAttribute('datetime', '');
		task.lastElementChild.textContent = '';
	}
	
	getPutResponse(task);
}

function taskDelete(btn){
	let task = btn.closest('.task');

	getDeleteResponse(task)
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

function compareByDate(a, b){
	a = new Date(a.querySelector('.task-creation-date').getAttribute('datetime'));
	b = new Date(b.querySelector('.task-creation-date').getAttribute('datetime'));
	
	if (a-b > 0) {
		return 1;
	}else if (a-b === 0){
		return 0;
	}else{
		return -1;
	}	
}

function sort(tasks, asc){
	let sorted = false;
	let buf;
	
	tasks = Array.from(tasks);
	
	while(!sorted){
		sorted = true;

		for (i = 0; i < tasks.length-1; i++){
			if (compareByDate(tasks[i], tasks[i+1]) < 0){
				sorted = false;
				buf = tasks[i];
				tasks[i] = tasks[i+1];
				tasks[i+1] = buf;
			}
		}
	}
	
	if (!asc){
		tasks = tasks.reverse();
	}
	
	return tasks;
}

let asc = true;
function sortByDate(){
	let tasks = document.querySelectorAll('.task');
	
	tasks = sort(tasks, asc); 
	
	list.innerHTML = '';
	for (i = 0; i < tasks.length; i++){
		list.append(tasks[i]);
	}
	
	asc = !asc;
}

function taskToJson(task){
	let obj = new Object();
	
	if (task.classList.length > 2){
		for (let i = 2; i < task.classList.length; i++){
			let property = task.classList[i];
			if(property === 'low' || property === 'medium' || property === 'high'){
				obj.priority = property;
			}
			
			if(property === 'done' || property === 'canceled'){
				obj.taskResult = property;
			}
		}
	}
	
	let doesExistTaskResult = 'taskResult' in obj;
	if(!doesExistTaskResult){
		obj.taskResult = '';
	}
	
	let taskText = task.querySelector('.task-text');
	obj.task = taskText.textContent;
	
	let creationDate = task.querySelector('.task-creation-date');
	obj.creationDate = creationDate.getAttribute('datetime');
	
	let resultDate = task.querySelector('.task-result-date');
	obj.resultDate = resultDate.getAttribute('datetime');
	
	console.log(JSON.stringify(obj));
	return JSON.stringify(obj);
}

function changeTask(label){
	let task = label.closest('.task');
	let input = task.querySelector('.input');
	
	label.classList.add('hidden');
	input.classList.remove('hidden');
	input.value = label.textContent;
	input.focus();
}

function editTask(input){
	let task = input.closest('.task');
	let label = task.querySelector('.task-text');
	let oldLabel = label.textContent;
	
		if (input.value !== label.textContent){
			let ans = confirm('Сохранить изменения?');
			
			if(ans){
				label.textContent = input.value;
				getPutResponse(task, label, oldLabel);
			}
		}
		
		label.classList.remove('hidden');
		input.classList.add('hidden');
	}