let ol = document.querySelector('.todolist');
let li = ol.querySelectorAll('li');
let height = 0;
for (i = 0; i < 3; i++) {
  height = height + li[i].offsetHeight;
  console.log(height);
}
ol.style.maxHeight = height+'px';