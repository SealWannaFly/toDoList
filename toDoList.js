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

async function getPostResponse(formData){
	let response = await fetch('http://127.0.0.1:3000/items', {
		method: 'POST',
		body: formData
	});
	
	let content = await response.json();
	let id = parseInt(JSON.stringify(content.id));

	createTask(formData, id);
}

function createTask(formData, taskId){
	let now = new Date();

	list.innerHTML += 
	     `<li class="task flex-container-row ${formData.get('priority')}" id=${taskId}>
		 <label class="task-text">${formData.get('task')}</label>
			 <input class="task-button task-button-done" type="image" src="resourses/images/button_done.png">
			 <input class="task-button task-button-cancel" type="image" src="resourses/images/button_cancel.png">
			 <input class="task-button task-button-delete" type="image" src="resourses/images/button_delete.png">
			 <label class="task-creation-date">${now.getDate()}/${now.getMonth()}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}</label>
			 <label class="task-result-date"></label>
		 </li>`;
}

let addForm = document.forms[0];

addForm.addEventListener('submit', function (event){
	event.preventDefault();
	
	let formData = new FormData(this);

	getPostResponse(formData);
});