/**
 * Represents a book.
 * @constructor
 * @param {string} primary_isbn13
 * @param {string} author
 * @param {string} title
 * @param {string} rank
 */
const Book = class {
    constructor(primary_isbn13, author, title, rank) {
        this.primary_isbn13 = primary_isbn13;
        this.author = author;
        this.title = title;
        this.rank = rank;
    }

    static BestSellerList = "New York Times";

    // override prototype
    toString() {
        return (`${this.primary_isbn13},${this.author},${this.title},${this.rank}`);
    }

};


