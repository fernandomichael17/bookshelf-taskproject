const STORAGE_KEY = "BookShelff-apps";
let bookshelf = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";

function isStorageExist() {
  if (typeof Storage == "undefined") {
    alert("Browser anda tidak mendukung local storage");
    return false;
  }
  return true;
}

function addBook() {
  const titleBook = document.getElementById("bookFormTitle").value;
  const authorBook = document.getElementById("bookFormAuthor").value;
  const yearBook = parseInt(document.getElementById("bookFormYear").value);
  const isComplete = document.getElementById("bookFormIsComplete").checked;

  const bookID = generateId();
  const bookObject = generateBookObject(
    bookID,
    titleBook,
    authorBook,
    yearBook,
    isComplete
  );
  bookshelf.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

  document.getElementById("bookForm").reset();
  document.querySelector("#bookFormSubmit span").textContent =
    "Belum selesai dibaca";
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

document.addEventListener("DOMContentLoaded", function () {
  const bookForm = document.getElementById("bookForm");
  if (bookForm) {
    bookForm.addEventListener("submit", function (event) {
      event.preventDefault();
      addBook();
    });
  }

  if (isStorageExist()) {
    loadDataFromStorage();
  }

  const searchForm = document.getElementById("searchBook");
  if (searchForm) {
    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const searchTitle = document
        .getElementById("searchBookTitle")
        .value.toLowerCase();
      searchBooks(searchTitle);
    });
  }

  const isCompleteCheckbox = document.getElementById("bookFormIsComplete");
  if (isCompleteCheckbox) {
    const submitSpan = document.querySelector("#bookFormSubmit span");
    isCompleteCheckbox.addEventListener("change", function () {
      submitSpan.textContent = this.checked
        ? "Selesai dibaca"
        : "Belum selesai dibaca";
    });
  }
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookList = document.getElementById("incompleteBookList");
  const completedBookList = document.getElementById("completeBookList");

  if (uncompletedBookList && completedBookList) {
    uncompletedBookList.innerHTML = "";
    completedBookList.innerHTML = "";

    for (const book of bookshelf) {
      const bookElement = makeBookContainer(book);
      if (!book.isComplete) {
        uncompletedBookList.append(bookElement);
      } else {
        completedBookList.append(bookElement);
      }
    }
  }
});

function makeBookContainer(bookObject) {
  const container = document.createElement("div");
  container.classList.add("book-item");
  container.setAttribute("data-bookid", bookObject.id);
  container.setAttribute("data-testid", "bookItem");

  const title = document.createElement("h3");
  title.setAttribute("data-testid", "bookItemTitle");
  title.innerText = bookObject.title;

  const author = document.createElement("p");
  author.setAttribute("data-testid", "bookItemAuthor");
  author.innerText = `Penulis: ${bookObject.author}`;

  const year = document.createElement("p");
  year.setAttribute("data-testid", "bookItemYear");
  year.innerText = `Tahun: ${bookObject.year}`;

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("button-container");

  const completeButton = document.createElement("button");
  completeButton.classList.add("complete-button");
  completeButton.setAttribute("data-testid", "bookItemIsCompleteButton");
  completeButton.innerText = bookObject.isComplete
    ? "Belum selesai dibaca"
    : "Selesai dibaca";
  completeButton.addEventListener("click", function () {
    if (bookObject.isComplete) {
      moveToUncomplete(bookObject.id);
    } else {
      moveToComplete(bookObject.id);
    }
  });

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-button");
  deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
  deleteButton.innerText = "Hapus buku";
  deleteButton.addEventListener("click", function () {
    removeBook(bookObject.id);
  });

  const editButton = document.createElement("button");
  editButton.classList.add("edit-button");
  editButton.setAttribute("data-testid", "bookItemEditButton");
  editButton.innerText = "Edit buku";
  editButton.addEventListener("click", function () {
    editBook(bookObject.id);
  });

  buttonContainer.append(completeButton, deleteButton, editButton);
  container.append(title, author, year, buttonContainer);

  return container;
}

function moveToComplete(id) {
  const bookTarget = findBook(id);
  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function moveToUncomplete(id) {
  const bookTarget = findBook(id);
  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBook(id) {
  const bookTarget = findBookIndex(id);
  if (bookTarget === -1) return;

  bookshelf.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(id) {
  for (const book of bookshelf) {
    if (book.id === id) {
      return book;
    }
  }
  return null;
}

function findBookIndex(id) {
  for (const index in bookshelf) {
    if (bookshelf[index].id === id) {
      return index;
    }
  }
  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(bookshelf);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);

  if (serializedData !== null) {
    const parsedData = JSON.parse(serializedData);
    bookshelf = parsedData.map((book) => ({
      ...book,
      year: parseInt(book.year),
    }));
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function searchBooks(keyword) {
  const uncompletedBookList = document.getElementById("incompleteBookList");
  const completedBookList = document.getElementById("completeBookList");

  if (uncompletedBookList && completedBookList) {
    uncompletedBookList.innerHTML = "";
    completedBookList.innerHTML = "";

    for (const book of bookshelf) {
      if (book.title.toLowerCase().includes(keyword)) {
        const bookElement = makeBookContainer(book);
        if (!book.isComplete) {
          uncompletedBookList.append(bookElement);
        } else {
          completedBookList.append(bookElement);
        }
      }
    }
  }
}

function showEditPopup(book) {
  const popup = document.createElement("div");
  popup.classList.add("popup");

  popup.innerHTML = `
    <div class="popup-content">
      <h2>Edit Buku</h2>
      <label for="editBookTitle">Judul</label>
      <input id="editBookTitle" type="text" value="${book.title}" required />
      <label for="editBookAuthor">Penulis</label>
      <input id="editBookAuthor" type="text" value="${book.author}" required />
      <label for="editBookYear">Tahun</label>
      <input id="editBookYear" type="number" value="${book.year}" required />
      <label for="editBookIsComplete">Selesai dibaca</label>
      <input id="editBookIsComplete" type="checkbox" ${
        book.isComplete ? "checked" : "" // Changed from isCompleted to isComplete
      } />
      <button id="saveEditButton">Simpan</button>
      <button id="cancelEditButton">Batal</button>
    </div>
  `;

  document.body.appendChild(popup);

  document
    .getElementById("saveEditButton")
    .addEventListener("click", function () {
      const updatedBook = {
        id: book.id,
        title: document.getElementById("editBookTitle").value,
        author: document.getElementById("editBookAuthor").value,
        year: parseInt(document.getElementById("editBookYear").value),
        isComplete: document.getElementById("editBookIsComplete").checked,
      };
      updateBook(updatedBook);
      document.body.removeChild(popup);
    });

  document
    .getElementById("cancelEditButton")
    .addEventListener("click", function () {
      document.body.removeChild(popup);
    });
}

function updateBook(updatedBook) {
  const bookIndex = findBookIndex(updatedBook.id);
  if (bookIndex !== -1) {
    bookshelf[bookIndex] = updatedBook;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
}

function editBook(id) {
  const bookTarget = findBook(id);
  if (bookTarget == null) return;

  showEditPopup(bookTarget);
}
