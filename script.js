let todo = document.querySelector('.todo');
let todolist = todo.querySelector('.todolist');
let counter = document.querySelector('.counter');
let allButton = document.querySelector('.all');
let activeButton = document.querySelector('.active');
let completeButton = document.querySelector('.complete');
let clearButton = document.querySelector('.clear');
let input = document.querySelector('.new-todo');
let items = todolist.querySelectorAll('li');
let toggleAll = todo.querySelector('.toggle-all');
let fullheight = 0;
let completebutton = false;
let editHeight = 0;


//обновление счетчика оставшихся задач

function updateCounter() {
    let count = 0;
    for (let item of items) {
        let itemContext = item.querySelector('.item');
        if (!itemContext.classList.contains('done')) {
            count++;
        }
    }
    if (count === 1) {
        counter.textContent = count + ' задание осталось';
    }
    else if (count >= 2 && count <= 4) {
        counter.textContent = count + ' задания осталось';
    }
    else {
        counter.textContent = count + ' заданий осталось';
    }
}

//конструктор новых задач

function todoConstructor (value) {
    let done = false;
    if (value.includes('done')) {
        value = value.replace(" done", "")
        done = true;
    }
    let newLi = document.createElement('li');
    let newElement = document.createElement('div');
    let newInputToggle = document.createElement('input');
    let newP = document.createElement('p');
    let newButton = document.createElement('button');
    let newInputEdit = document.createElement('input');
    newElement.classList.add('item');
    if (done) {
        newElement.classList.add('done');
    }
    if (completebutton) {
        newLi.classList.add('hidden');
    }
    newInputToggle.classList.add('toggle');
    newInputToggle.type = 'checkbox';
    newP.textContent = value;
    newButton.classList.add('destroy');
    newInputEdit.classList.add('edit');
    newInputEdit.classList.add('hidden');
    newElement.append(newInputToggle);
    newElement.append(newP);
    newElement.append(newButton);
    newElement.append(newInputEdit);
    newLi.append(newElement);
    todolist.append(newLi);
    items = todolist.querySelectorAll('li');
    updateCounter();
    updateButtons();
    listener();
    itemResize();
}

function itemResize() {
    fullheight = 0;
    for (let item of items) {
        if (!item.classList.contains('hidden')) {
            let p = item.querySelector("p");
            let itemDiv = item.querySelector(".item");
            let editItem = item.querySelector(".edit");
            let height = p.offsetHeight + 13;
            if (!editItem.classList.contains('hidden')) {
                height += editHeight;
            }
            itemDiv.style.height = height + 'px';
            item.style.height = height + 'px';
            fullheight += height;
        }
    }
    todolist.style.height = fullheight + 'px';
    return false;
}

//работа с базой данных

let db;

function indexedDBOk() {
    return "indexedDB" in window;
}

document.addEventListener("DOMContentLoaded", function() {
    if(!indexedDBOk) return;

    let openRequest = indexedDB.open("todos",1);

    openRequest.onupgradeneeded = function(e) {
        let thisDB = e.target.result;

        if(!thisDB.objectStoreNames.contains("todolist")) {
            let objectStore = thisDB.createObjectStore("todolist");
            objectStore.createIndex("index", "index", {unique: true});
        }
    }

    openRequest.onsuccess = function(e) {
        db = e.target.result;
        loadDB();
        items[0].remove();
    }

    openRequest.onerror = function() {
        console.log('Произошла ошибка в базе данных.');
    }

},false);

//обновление базы данных

function updateDB() {
    let transaction = db.transaction(["todolist"], "readwrite");
    let store = transaction.objectStore("todolist");
    store.clear();
    let key = 1;
    for (let item of items) {
        let p = item.querySelector("p");
        let itemDiv = item.querySelector(".item");
        let str = "";
        if (itemDiv.classList.contains("done")) {
            str = p.textContent + " done";
        } else {
            str = p.textContent;
        }
        let request = store.add(str, key);
        request.onerror = function (e) {
            console.log("Error", e.target.error.name);
        }
        key++;
    }
}

//загрузка данных из БД

function loadDB() {
    let objectStore = db.transaction("todolist").objectStore("todolist");
    objectStore.openCursor().onsuccess = function(event) {
        let cursor = event.target.result;
        if (cursor) {
            todoConstructor(cursor.value);
            cursor.continue();
        }
    };
}

//обновление кнопок для добавленных задач

function updateButtons () {
    for (let item of items) {
        let itemContext = item.querySelector('.item');
        let deleteButton = item.querySelector('.destroy');
        let toggleButton = item.querySelector('.toggle');
        let p = item.querySelector('p');
        let edit = item.querySelector('.edit');
        item.onmouseover = itemResize;
        item.onmouseout = itemResize;
        deleteButton.onclick = function () {
            item.remove();
            items = todolist.querySelectorAll('li');
            itemResize();
            updateDB();
            updateCounter();
        }

        toggleButton.onclick = function () {
            itemContext.classList.toggle('done');
            updateDB();
            updateCounter();
            itemResize();
            if (completeButton.classList.contains("checked")) {
                completeShow();
            }
            else if (activeButton.classList.contains("checked")) {
                activeShow();
            }
        }

        p.onclick = function() {
            editHeight = 50;
            p.classList.add('hidden');
            deleteButton.classList.add('hidden');
            edit.classList.remove('hidden');
            edit.value = p.textContent;
            edit.focus();
        }

        edit.onblur = editExit;

        function editExit() {
            editHeight = 0;
            p.classList.remove('hidden');
            deleteButton.classList.remove('hidden');
            edit.classList.add('hidden');
            p.textContent = edit.value;
            if (edit.value === '' || !edit.value.trim().length) {
                item.remove();
            }
            items = todolist.querySelectorAll('li');
            itemResize();
            updateDB();
            updateCounter();
        }
    }
}

toggleAll.onclick = function () {
    let allchecked = true;
    for (let item of items) {
        let itemDiv = item.querySelector('.item');
        if (!itemDiv.classList.contains('done')) {
            allchecked = false;
            break;
        }
    }
    if (allchecked) {
        for (let item of items) {
            let itemDiv = item.querySelector('.item');
            itemDiv.classList.remove('done');
        }
    }
    else {
        for (let item of items) {
            let itemDiv = item.querySelector('.item');
            if (!itemDiv.classList.contains('done')) {
                itemDiv.classList.add('done');
            }
        }
    }
    updateDB();
}

//переключатели между задачами

allButton.onclick = function () {
    completeButton.classList.remove('checked');
    activeButton.classList.remove('checked');
    allButton.classList.add('checked');
    for (let item of items) {
        item.classList.remove('hidden');
    }
    completebutton = false;
    itemResize();
}

completeButton.onclick = function () {
    allButton.classList.remove('checked');
    activeButton.classList.remove('checked');
    completeButton.classList.add('checked');
    completeShow();
    completebutton = true;
    itemResize();
}

function completeShow() {
    for (let item of items) {
        let itemContext = item.querySelector('.item');
        if (itemContext.classList.contains('done')) {
            item.classList.remove('hidden');
        }
        else {
            if (!item.classList.contains('hidden')) {
                item.classList.add('hidden');
            }
        }
    }
}

activeButton.onclick = function () {
    allButton.classList.remove('checked');
    completeButton.classList.remove('checked');
    activeButton.classList.add('checked');
    activeShow();
    completebutton = false;
    itemResize();
}

function activeShow() {
    for (let item of items) {
        let itemContext = item.querySelector('.item');
        if (!itemContext.classList.contains('done')) {
            item.classList.remove('hidden');
        }
        else {
            if (!item.classList.contains('hidden')) {
                item.classList.add('hidden');
            }
        }
    }
}

//кнопка очистки выполненных заданий

clearButton.onclick = function () {
    for (let item of items) {
        let itemContext = item.querySelector('.item');
        if (itemContext.classList.contains('done')) {
            item.remove();
        }
    }
    items = todolist.querySelectorAll('li');
    updateDB();
    updateCounter();
    updateButtons();
    itemResize();
}

input.onblur = function () {
    input.value = "";
}

//добавление новых задач

function listener() {
    document.body.addEventListener('keydown', function (e) {
        if (e.keyCode === 27) {
            input.focus();
        }
    });
    input.addEventListener('keydown', function(e) {
        if (e.keyCode === 13 && this.value !== "") {
            if (this.value.trim().length) {
                todoConstructor(this.value);
                this.value = "";
                updateDB();
                updateCounter();
                items = todolist.querySelectorAll('li');
                updateButtons();
            }
            else {
                this.value = "";
            }
        }
    });

    for(let item of items) {
        let deleteButton = item.querySelector('.destroy');
        let p = item.querySelector('p');
        let edit = item.querySelector('.edit');
        edit.addEventListener('keydown', function (e) {
            if (e.keyCode === 13) {
                p.classList.remove('hidden');
                deleteButton.classList.remove('hidden');
                edit.classList.add('hidden');
                if (edit.value.trim().length) {
                    p.textContent = edit.value;
                }
                else {
                    item.remove();
                }
                items = todolist.querySelectorAll('li');
                updateCounter();
                updateDB();
                itemResize();
            }
        })
    }
}

window.onbeforeunload = function () {
    updateDB();
    return null;
}

listener();