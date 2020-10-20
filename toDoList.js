let list = document.querySelector('.todolist');
let tasks = list.querySelectorAll('task');
let height = 0;
for (i = 0; i < 3; i++) {
  height = height + task[i].offsetHeight;
  consliste.log(height);
}
list.style.maxHeight = height+'px';

function createTask (text) {
	let newTask = document.createElement('li');
	newTask.classList.add('flex-container-row');
	
	let taskText = document.createElement('label');
	taskText.classList.add('task-text');
	taskTest.textContent = text;
	newTask.appendChild(taskText);
	
	let doneCheckbox = document.createElement('input');
	doneCheckbox.classList.add('task-done-checkbox');
	doneCheckbox.setAttribute('type', 'checkbox');
	newTask.appendChild(doneCheckbox);
	
	let cancelCheckbox = document.createElement('input');
	cancelCheckbox.classList.add('task-cancel-checkbox');
	cancelCheckbox.setAttribute('type', 'checkbox');
	newTask.appendChild(cancelCheckbox);
	
	let creationDate = document.createElement('label');
	creationDate.classList.add('task-creation-date');
	creationDate.textContent = new Date();
	newTask.appendChild(creationDate);
	
	let resultDate = document.createElement('label');
	resultDate.classList.add('task-result-date');
	resultDate.textContent = new Date();
	newTask.appendChild(resultDate); 
	
	return newTask;
}

let addForm = document.forms.addTask;
addForm.onsubmit = function(evt){
	evt.preventDefault();
	
	let input = addForm.elements.text;
	
	let newTask = createTask(input);
	
	list.append(newTask);
}