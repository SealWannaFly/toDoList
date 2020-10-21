class Task{
	constructor(){
		
	}
}

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

function createTask (input_text) {
	let newTask = document.createElement('li');
	newTask.classList.add('task');
	newTask.classList.add('flex-container-row');
	
	let taskText = document.createElement('label');
	taskText.classList.add('task-text');
	taskText.textContent = input_text;
	newTask.appendChild(taskText);
	
	let doneCheckbox = document.createElement('input');
	doneCheckbox.classList.add('task-done-checkbox');
	doneCheckbox.setAttribute('type', 'checkbox');
	newTask.appendChild(doneCheckbox);
	
	let cancelCheckbox = document.createElement('input');
	cancelCheckbox.classList.add('task-cancel-checkbox');
	cancelCheckbox.setAttribute('type', 'checkbox');
	newTask.appendChild(cancelCheckbox);
	
	let taskButtonDelete = document.createElement('input');
	taskButtonDelete.classList.add('task-button-delete');
	taskButtonDelete.setAttribute('type', 'image');
	taskButtonDelete.setAttribute('src', 'resourses/images/button_delete.png');
	newTask.appendChild(taskButtonDelete);
	
	let creationDate = document.createElement('label');
	creationDate.classList.add('task-creation-date');
	let now = new Date();
	creationDate.textContent = `${now.getDate()}/${now.getMonth()}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}`;
	newTask.appendChild(creationDate);
	
	let resultDate = document.createElement('label');
	resultDate.classList.add('task-result-date');
	resultDate.textContent = '';
	newTask.appendChild(resultDate); 
	
	return newTask;
}

let addForm = document.forms[0];
addForm.onsubmit = function (event){
	event.preventDefault();
	
	let taskText = addForm.elements.input_text;

	let newTask = createTask(taskText.value);
	list.append(newTask);
	
	updateListHeight();
	
	return false;
}