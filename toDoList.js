let list = document.querySelector('.todolist');

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

function createTask(taskData, taskId){
	if(!taskId){
		taskId  = parseInt(taskData.id);
	}
	
	list.innerHTML += 
	     `<li class="task flex-container-row ${taskData.priority}" id=${taskId}>
		 <label class="task-text">${taskData.task}</label>
			 <input class="task-button task-button-done" type="image" src="resourses/images/button_done.png" onclick="setDone(this);return false;">
			 <input class="task-button task-button-cancel" type="image" src="resourses/images/button_cancel.png" onclick="setCanceled(this);return false;">
			 <input class="task-button task-button-delete" type="image" src="resourses/images/button_delete.png" onclick="taskDelete(this);return false;">
			 <label class="task-creation-date">${taskData.creationDate}</label>
			 <label class="task-result-date"></label>
		 </li>`;
		 
	updateListHeight()
}

let addForm = document.forms.addForm;

addForm.addEventListener('submit', function (event){
	event.preventDefault();
	
	let formData = new FormData(addForm);
	let now = new Date();
	formData.append('creationDate', `${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}`);
	
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
	 task.classList.remove('task-canceled');
	 task.classList.toggle('task-done');
	 
	 if(task.classList.contains('task-done')){
		let now = new Date();
		task.lastElementChild.textContent = `Done at ${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}`;
	 }else{
		task.lastElementChild.textContent = '';
	 }
};

function setCanceled(btn){
	let task = btn.closest('.task');
	task.classList.remove('task-done');
	task.classList.toggle('task-canceled');
	
	if(task.classList.contains('task-canceled')){
		let now = new Date();
		task.lastElementChild.textContent = `Canceled at ${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}`;
	}else{
		task.lastElementChild.textContent = '';
	}
}

function taskDelete(btn){
	let task = btn.closest('.task');

	getDeleteResponse(task)
}