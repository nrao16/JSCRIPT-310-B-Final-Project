// ensure dom fully loaded

document.addEventListener("DOMContentLoaded", function () {

const formEl = document.querySelector('#best-books-form');
const yearEl = document.querySelector('#year');
const monthEl = document.querySelector('#month');
const dateEl = document.querySelector('#date');
const bookBagViewButton = document.querySelector('#viewBookBag');


function checkValidation(e) {
    let currentElement = e.target;

    // without this the tool tip keeps showing!

    currentElement.setCustomValidity("");
    let currentLabel = document.querySelector(`#${currentElement.id}-label`).innerText;
    if (currentElement.id === 'year') {
        if (!currentElement.validity.valid || Number(currentElement.value) < currentElement.min) {
            currentElement.setCustomValidity(`${currentLabel} has to be 4 digits and a min of ${currentElement.min}`);
            currentElement.reportValidity();
        }
    }
    else if (currentElement.id == "month" || currentElement.id === "date") {
        if (!currentElement.validity.valid || Number(currentElement.value) < Number(currentElement.min) ||
            Number(currentElement.value) > Number(currentElement.max)) {
            currentElement.setCustomValidity(`${currentLabel} has to be between ${currentElement.min} and ${currentElement.max}`);
            currentElement.reportValidity();
        }
    }
}

const toggleBookBag =  (e, book) => {

    let bagImage = e.target.classList.contains("btn") ? e.target.getElementsByTagName('img')[0]: e.target;

    let myBook = new Book(book.primary_isbn13, book.author, book.title, book.rank);
    let myBookBag = localStorage.getItem('myBookBag') ? new Map(JSON.parse(localStorage.getItem('myBookBag'))) : new Map();
    console.log(myBookBag);

    // add to book bag
    if(bagImage.id === "init-bag") {
        bagImage.id = "checked-bag";
        bagImage.src = "bag-check-fill.svg";
        myBookBag.set(myBook.isbn, myBook.toString());
        console.log(myBookBag);
        localStorage.setItem('myBookBag', JSON.stringify(Array.from(myBookBag.entries())));
    }
    // remove from book bag 
    else {
        bagImage.src = "bag.svg"
        bagImage.id = "init-bag";
        myBookBag.delete(myBook.isbn);
        localStorage.setItem('myBookBag', JSON.stringify(Array.from(myBookBag.entries())));
    }
}

const displayBookBag = (e) => {
    console.log(`e.target:${e.target}`);

    if(e.target.id === "viewBookBag") {
        let myBookBag = localStorage.getItem('myBookBag') ? localStorage.getItem('myBookBag') : "Your book bag is empty.";
        const displayDiv = document.getElementById('books-container');
        displayDiv.innerHTML = `<p>${myBookBag}</p>`;
    };
}

const displayResults = (bookList) => {
    const displayDiv = document.getElementById('books-container');
    displayDiv.innerHTML = `<h2><strong>Top 5 ${Book.BestSellerList} Hardcover</strong></h2>`;

    let top5 = bookList.results.books.filter(book => book.rank <= 5);
    top5.forEach(book => {
        console.log(book);
        let liElement = document.createElement('li');
        const spanElement = document.createElement('span');

        const bookTitleElement = document.createElement('strong');
        bookTitleElement.innerText = `${book.title} by ${book.author}`;
        spanElement.appendChild(bookTitleElement);

        let bagButtonElement = document.createElement('button');
        bagButtonElement.id = "bag-button";
        bagButtonElement.classList.add('btn', 'btn-outline-light');

        let bagImg = document.createElement('img');
        bagImg.src ="bag.svg";
        bagImg.id = "init-bag";
        bagButtonElement.appendChild(bagImg);
        bagButtonElement.addEventListener('click', (e) => {toggleBookBag(e, book) });
        spanElement.appendChild(bagButtonElement);

        spanElement.appendChild(document.createElement('p'));
        let bookImg = document.createElement("img");
        bookImg.src = `${book.book_image}`;
        spanElement.appendChild(bookImg);

        let bookDescription = document.createElement('blockquote');
        bookDescription.innerHTML = `<blockquote><p>${book.description}</p><blockquote>`;
        spanElement.appendChild(bookDescription);

        liElement.appendChild(spanElement);
        displayDiv.appendChild(liElement);
    });

};

yearEl.addEventListener('input', checkValidation);
monthEl.addEventListener('input', checkValidation);
dateEl.addEventListener('input', checkValidation);
bookBagViewButton.addEventListener('click', displayBookBag);

formEl.addEventListener('submit', function (e) {
    e.preventDefault();

    let valid = true;
    const validationElements = Array.from(document.querySelectorAll('.validate-input'));
    validationElements.forEach(el => {
        if (!el.validity.valid) {
            el.reportValidity();
            valid = false;
        }
    });

    if(!valid) { return false };
    
    const year = yearEl.value;
    const month = monthEl.value;
    const date = dateEl.value;

    const url = `https://api.nytimes.com/svc/books/v3/lists/${year}-${month}-${date}/hardcover-fiction.json?api-key=${apiKey}`;
    fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            return response.json();
        })
        .then((json) => displayResults(json))
        .catch((err) => console.error(`Fetch problem: ${err.message}`));

});

});