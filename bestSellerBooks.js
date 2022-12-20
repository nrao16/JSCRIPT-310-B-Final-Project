// ensure dom fully loaded
document.addEventListener("DOMContentLoaded", function () {

    const formEl = document.querySelector('#best-books-form');
    const yearEl = document.querySelector('#year');
    const monthEl = document.querySelector('#month');
    const dateEl = document.querySelector('#date');
    const bookBagViewButton = document.querySelector('#viewBookBag');

    // show current date and time
    const currentDateTimeEl = document.getElementById('currentDateTime');
    let currentDate = new Date();
    currentDateTimeEl.innerText = currentDate.toLocaleDateString() + " " + currentDate.toLocaleTimeString();

    setInterval(() => {
        currentDateTimeEl.innerText = new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
    }, 1000);

    // validate search fields
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

    // toggle adding and removing books from local storage
    const toggleBookBag = (e, book) => {

        let bagImage = e.target.classList.contains("btn") ? e.target.getElementsByTagName('img')[0] : e.target;

        let myBook = new Book(book.primary_isbn13, book.author, book.title, book.rank);
        let myBookBag = localStorage.getItem('myBookBag') ? new Map(JSON.parse(localStorage.getItem('myBookBag'))) : new Map();

        // add to book bag
        if (bagImage.id === "init-bag") {
            bagImage.id = "checked-bag";
            bagImage.src = "bag-check-fill.svg";
            bagImage.style.height = "25px";
            bagImage.style.width = "25px";
            myBookBag.set(myBook.primary_isbn13, myBook.toString());
            console.log(myBookBag);
            localStorage.setItem('myBookBag', JSON.stringify(Array.from(myBookBag.entries())));
        }
        // remove from book bag 
        else {
            bagImage.src = "bag.svg"
            bagImage.id = "init-bag";
            bagImage.style.height = "25px";
            bagImage.style.width = "25px";
            myBookBag.delete(myBook.primary_isbn13);
            localStorage.setItem('myBookBag', JSON.stringify(Array.from(myBookBag.entries())));
        }
    }

    // display books stored in local storage
    const displayBookBag = (e) => {
        let myBookBag = localStorage.getItem('myBookBag') ? new Map(JSON.parse(localStorage.getItem('myBookBag'))) : "";
        const displayDiv = document.getElementById('books-container');

        if (myBookBag instanceof Map && myBookBag.size > 0) {
            displayDiv.innerHTML = `<h3>Your Book <i class="bi bi-bag-check-fill" style="font-size:48px;color:red;"></i> with ${Book.BestSellerList} Hardcover titles</h3>`;
            myBookBag.forEach((value, key) => {
                const bookDetails = value.split(',');
                const storedBook = new Book(bookDetails[0], bookDetails[1], bookDetails[2], bookDetails[3]);
                createBookListItem(storedBook, displayDiv, true);
            });
        } else {
            displayDiv.innerHTML = `<h3>Your book bag is empty.<br>Start a new search to add some books</h3>`;
        }
    }

    // create a book li item for either new search or from local storage retrieved books
    const createBookListItem = (book, displayDiv, alreadyBagged) => {
        let liElement = document.createElement('li');
        const spanElement = document.createElement('span');

        const bookTitleElement = document.createElement('strong');
        bookTitleElement.innerText = `${book.title} by ${book.author}`;
        spanElement.appendChild(bookTitleElement);

        let bagButtonElement = document.createElement('button');
        bagButtonElement.id = "bag-button";
        bagButtonElement.classList.add('btn', 'btn-outline-light');

        let bagImg = document.createElement('img');
        if (alreadyBagged) {
            bagImg.id = "checked-bag";
            bagImg.src = "bag-check-fill.svg";
            bagImg.style.height = "25px";
            bagImg.style.width = "25px";
        } else {
            bagImg.src = "bag.svg";
            bagImg.id = "init-bag";
            bagImg.style.height = "25px";
            bagImg.style.width = "25px";
        }
        bagButtonElement.appendChild(bagImg);
        bagButtonElement.addEventListener('click', (e) => { toggleBookBag(e, book) });
        spanElement.appendChild(bagButtonElement);

        if (book.book_image) {
            spanElement.appendChild(document.createElement('p'));
            let bookImg = document.createElement("img");
            bookImg.src = `${book.book_image}`;
            spanElement.appendChild(bookImg);
        }

        if (book.description) {
            let bookDescription = document.createElement('blockquote');
            bookDescription.innerHTML = `<blockquote><p>${book.description}</p><blockquote>`;
            spanElement.appendChild(bookDescription);
        }
        liElement.appendChild(spanElement);
        displayDiv.appendChild(liElement);
    }

    // display search results
    const displayResults = (bookList) => {
        const displayDiv = document.getElementById('books-container');
        displayDiv.innerHTML = `<h2>Top 5 ${Book.BestSellerList} Hardcover Books</h2><br><blockquote>Click on bag to add to your book bag</blockquote>`;

        let top5 = bookList.results.books.filter(book => book.rank <= 5);
        top5.forEach(book => {
            console.log(book);
            createBookListItem(book, displayDiv, false);
        });

    };

    yearEl.addEventListener('input', checkValidation);
    monthEl.addEventListener('input', checkValidation);
    dateEl.addEventListener('input', checkValidation);
    bookBagViewButton.addEventListener('click', displayBookBag);

    // submit search and get data back from nyt api call
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

        if (!valid) { return false };

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