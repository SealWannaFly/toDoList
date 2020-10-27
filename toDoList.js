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
	let itemId = {
		id: task.getAttribute('id')
	};
	
	let response = await fetch('http://127.0.0.1:3000/items/:itemId', {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json;charset=utf-8'
		},
		body: JSON.stringify(itemId)
	});
	
	if (response.ok){
		task.remove();
	}else{
		alert('Ошибка!');
	}
}

function formatTime(datetime){
	datetime = new Date(datetime);
	return `${datetime.getDate()}/${datetime.getMonth()+1}/${datetime.getFullYear()} ${datetime.getHours()}:${datetime.getMinutes()}`;
}

function createTask(taskData, taskId){
	if(!taskId){
		taskId  = parseInt(taskData.id);
	}
	
	list.innerHTML += 
	     `<li class="task flex-container-row ${taskData.priority.toLowerCase()}" id=${taskId}>
		 <label class="task-text">${taskData.task}</label>
			 <input class="task-button task-button-done" type="image" src="resourses/images/button_done.png" onclick="setDone(this);return false;">
			 <input class="task-button task-button-cancel" type="image" src="resourses/images/button_cancel.png" onclick="setCanceled(this);return false;">
			 <input class="task-button task-button-delete" type="image" src="resourses/images/button_delete.png" onclick="taskDelete(this);return false;">
			 <time class="task-creation-date" datetime="${taskData.creationDate}">${formatTime(taskData.creationDate)}</time>
			 <time class="task-result-date"></time>
		 </li>`;
		 
	updateListHeight()
}

let addForm = document.forms.addForm;

addForm.addEventListener('submit', function (event){
	event.preventDefault();
	
	let formData = new FormData(addForm);
	let now = new Date();
	formData.append('creationDate', now);
	
	let taskData = {};
	formData.forEach(function(value, key){
    taskData[key] = value;
	});
	
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
		task.lastElementChild.textContent = '';
	 }
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
		task.lastElementChild.textContent = '';
	}
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
	console.log(asc);
	console.log(tasks);
	list.innerHTML = '';
	for (i = 0; i < tasks.length; i++){
		list.append(tasks[i]);
	}
	
	asc = !asc;
}