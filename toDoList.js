const addForm = document.forms.addForm;
const resultFilters = document.querySelectorAll('.filter-result');
const priorityFilters = document.querySelectorAll('.filter-priority');
const list = document.querySelector('.todolist');

const tasks = [];

function updateList(){
	for(let i = 0; i < tasks.length; i++){
		list.removeChild(document.getElementById(tasks[i].id));
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
	return tasks.findIndex(item => item.id == taskId);
}

async function getTasks() {
    fetch('http://127.0.0.1:3000/items')
        .then(response => response.json())
        .catch(() => alert('Ошибка при загрузке данных с сервера!'))
        .then(response => response.forEach(task => {
            tasks.push(task);
            renderTask(task);
        }));
}

async function addTask(task){
	fetch('http://127.0.0.1:3000/items', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json;charset=utf-8'
		},
		body: JSON.stringify(task)
	    })
		.then(response => response.json())
        .catch(() => alert('Ошибка при отправке данных на сервер!'))
        .then(response => {
			task.id = response.id;
			tasks.push(task);
			renderTask(task);
		});
}

async function deleteTask(task){
	fetch(`http://127.0.0.1:3000/items/${task.id}`, {
		method: 'DELETE',
		})
        .then(response => response.json())
        .catch(() => alert('Ошибка при удалении данных с сервера!'))
        .then(response => {
            tasks.splice(findTaskIndexById(task.id),1);
			list.removeChild(document.getElementById(task.id));
        });
}

async function changeTask(task){	
	fetch(`http://127.0.0.1:3000/items/${task.id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json;charset=utf-8'
		},
		body: JSON.stringify(task)
		})
        .then(response => response.json())
        .catch(() => alert('Ошибка при изменении данных на сервере!'))
        .then(response => {
			tasks.splice(findTaskIndexById(task.id),1,task);
			updateList();
        });
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
		     <input class="input hidden" type="text" onblur="hideEditor(this);">
		     <label class="task-text" onclick="showEditor(this);return false;">${task.text}</label>
			 <input class="task-button" type="image" src="resourses/images/button_done.png" onclick="setResult(this, 'done');return false;">
			 <input class="task-button" type="image" src="resourses/images/button_cancel.png" onclick="setResult(this, 'canceled');return false;">
			 <input class="task-button" type="image" src="resourses/images/button_delete.png" onclick="taskDelete(this);return false;">
			 <time class="task-creation-date" datetime="${task.creationDate}">${formatTime(task.creationDate)}</time>
			 <time class="task-result-date" datetime="${task.resultDate}">${createTaskResultText(task)}</time>
		 </li>`;
		 
	updateListHeight();
}

addForm.addEventListener('submit', function (event){
	event.preventDefault();
	
	if (addForm.elements[0].value === '') {return;}
	
	let task = {
		text: addForm.elements[0].value,
		priority: addForm.elements[1].value.toLowerCase(),
		creationDate: new Date(),
		resultDate: '',
		taskResult: '',
	};
	
	addForm.elements[0].value = '';
	
	addTask(task);
});

 document.addEventListener("DOMContentLoaded", function (){
	 getTasks();
 });
 
 function setResult(btn, result) {
	 let taskId = btn.closest('.task').getAttribute('id');
	 let newTask = Object.assign(tasks[findTaskIndexById(taskId)]);
	 
	 if (newTask.taskResult !== result){
		 newTask.resultDate = new Date();
		 newTask.taskResult = result;
	 }else{
		 newTask.resultDate = '';
		 newTask.taskResult = '';
	 }
	 
	 changeTask(newTask);
}

function taskDelete(btn){
	let taskId = btn.closest('.task').getAttribute('id');
	
	deleteTask(tasks[findTaskIndexById(taskId)]);
}

function resetFilters(tasks){	
	for (i = 0; i < tasks.length; i++){
		tasks[i].classList.remove('hidden');
	}
}

function filter(tasks, filters, isStrict){
	for (i = 0; i < tasks.length; i++){
		let wasOneActiveFilter = false;
		
		let isSuitable = false;
		if(isStrict){
			isSuitable = true;
		}
		
		for (j = 0; j < filters.length; j++){
			if (filters[j].checked){
				wasOneActiveFilter = true;
				let filterParameter = document.querySelector(`[for="${filters[j].id}"]`).textContent.toLowerCase();
				
				if (isStrict){
					isSuitable = isSuitable && tasks[i].classList.contains(filterParameter);
				} else {
					isSuitable = isSuitable || tasks[i].classList.contains(filterParameter);
				}
			}
		}
		
		if (wasOneActiveFilter){
			if (!isSuitable){
				tasks[i].classList.add('hidden');
			}
		}
	}
}

function filterList(){	
    let tasks = list.querySelectorAll('.task');
	
	resetFilters(tasks);
	filter(tasks, priorityFilters, false);
	filter(tasks, resultFilters, true);
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
}

function hideEditor(input){
	let taskId = input.closest('.task').getAttribute('id');
	let taskIndex = findTaskIndexById(taskId);
	
	let label = input.closest('.task').querySelector('.task-text');
	
	label.classList.remove('hidden');
	input.classList.add('hidden');
	
	if (input.value !== label.textContent){
			let ans = confirm('Сохранить изменения?');
			
			if(ans){
				let newTask = Object.assign(tasks[taskIndex]);
				newTask.text = input.value;
				changeTask(newTask);
			}
		}
		
	input.value = '';
}