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
    let newLabel = document.createElement('label');
    let newButton = document.createElement('button');
    let newInputEdit = document.createElement('input');
    newElement.classList.add('item');
    if (done) {
        newElement.classList.add('done');
    }
    newInputToggle.classList.add('toggle');
    newInputToggle.type = 'checkbox';
    newLabel.textContent = value;
    newButton.classList.add('destroy');
    newInputEdit.classList.add('edit');
    newInputEdit.classList.add('hidden');
    newElement.append(newInputToggle);
    newElement.append(newLabel);
    newElement.append(newButton);
    newElement.append(newInputEdit);
    newLi.append(newElement);
    todolist.append(newLi);
    items = todolist.querySelectorAll('li');
    updateCounter();
    updateButtons();
    listener();
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
        let label = item.querySelector("label");
        let itemDiv = item.querySelector(".item");
        let str = "";
        if (itemDiv.classList.contains("done")) {
            str = label.textContent + " done";
        } else {
            str = label.textContent;
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
        let label = item.querySelector('label');
        let edit = item.querySelector('.edit');
        deleteButton.onclick = function () {
            item.remove();
            items = todolist.querySelectorAll('li');
            updateDB();
            updateCounter();
        }

        toggleButton.onclick = function () {
            itemContext.classList.toggle('done');
            updateDB();
            updateCounter();
        }

        label.onclick = function() {
            label.classList.add('hidden');
            deleteButton.classList.add('hidden');
            edit.classList.remove('hidden');
            edit.value = label.textContent;
        }

        edit.onblur = function () {
            label.classList.remove('hidden');
            deleteButton.classList.remove('hidden');
            edit.classList.add('hidden');
            label.textContent = edit.value;
            if (edit.value === '') {
                item.remove();
            }
            items = todolist.querySelectorAll('li');
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
}

completeButton.onclick = function () {
    allButton.classList.remove('checked');
    activeButton.classList.remove('checked');
    completeButton.classList.add('checked');
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
}

input.onblur = function () {
    input.value = "";
}

//добавление новых задач

function listener() {
    input.addEventListener('keydown', function(e) {
        if (e.keyCode === 13 && this.value !== "") {
            todoConstructor(this.value);
            this.value = "";
            updateDB();
            updateCounter();
            items = todolist.querySelectorAll('li');
            updateButtons();
        }
    });

    for(let item of items) {
        let deleteButton = item.querySelector('.destroy');
        let label = item.querySelector('label');
        let edit = item.querySelector('.edit');
        edit.addEventListener('keydown', function (e) {
            if (e.keyCode === 13) {
                label.classList.remove('hidden');
                deleteButton.classList.remove('hidden');
                edit.classList.add('hidden');
                label.textContent = edit.value;
                items = todolist.querySelectorAll('li');
                updateCounter();
                updateDB();
            }
        })
    }
}

window.onbeforeunload = function () {
    updateDB();
    return null;
}

listener();