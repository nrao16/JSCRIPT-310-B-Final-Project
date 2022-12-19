/**
 * Represents a book.
 * @constructor
 * @param {string} isbn
 * @param {string} title
 * @param {string} rank
 * @param {string} description
 * @param {img} book_image
 */
const Book = class {
    constructor(isbn, author, title, rank) {
        this.isbn = isbn;
        this.author = author;
        this.title = title;
        this.rank = rank;
    }

    static BestSellerList = "New York Times";

    // override prototype
    toString() {
        return (`${this.title}(isbn-${this.isbn}) by ${this.author} ranked ${this.rank} on the ${Book.BestSellerList} best seller list.`);
    }

};


