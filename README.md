# 📚 BookShelf

A modern website to showcase books from 'https://github.com/benoitvallon/100-best-books/blob/master/books.json'. Built with Next.js and TypeScript, featuring a responsive design and Google Books API integration for book covers if github fails to provide.

## 🚀 Deployed to Vercel

Using this link: https://book-shelf-seven-ebon.vercel.app/

## ✨ Features

- Grid and list view modes for book display
- Automatic book cover fetching from Google Books API
- Responsive design for mobile and desktop
- Book details including:
  - Title and author
  - Language
  - Page count
  - Publication year
  - Cover images

## 🏃🏾 Getting Started

1. Clone the repository:

```bash
git clone https://github.com/MrVantes/BookCollection.git
cd BookCollection
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [Javascript](https://www.typescriptlang.org/) - ts better
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Google Books API](https://developers.google.com/books) - Book cover images

## 📖 Project Structure

```
src/
├── components/     # React components
└── app/            # Next.js pages
  └── data/         # books.json
```

## 🖥️ Pseudo Code

```
// Data Structure
type Book {
    title: string
    author: string
    language: string
    pages: number
    year: number
    link: string
    country: string
    imageLink: string
}

// Main Application Flow
function BookShelfApp {
    // State Management
    books = loadBooksFromJSON()
    viewMode = "grid" or "list"
    darkMode = getUserPreference()

    // Main Components
    Header {
        Logo
        ViewModeToggle(viewMode)
        DarkModeToggle(darkMode)
    }

    BookList(books, viewMode) {
        // Book Cover Fetching
        FOR each book IN books {
            coverUrl = fetchFromGoogleBooksAPI(book.title, book.author)
            IF coverUrl exists {
                book.coverUrl = coverUrl
            }
        }

        // Display Logic
        IF viewMode is "grid" {
            DisplayBooksInGrid(books)
        } ELSE {
            DisplayBooksInList(books)
        }
    }

    Footer {
        DisplayProjectInfo()
    }
}

// Book Display Components
function DisplayBooksInGrid(books) {
    CREATE 2x2 grid for mobile
    CREATE 4x4 grid for desktop
    FOR each book IN books {
        DisplayBookCard {
            IF book.coverUrl exists {
                ShowCoverImage
            } ELSE {
                ShowPlaceholder
            }
            DisplayBookInfo {
                Title (clickable link)
                Author
                Language
                Pages
                Year
            }
        }
    }
}

function DisplayBooksInList(books) {
    FOR each book IN books {
        DisplayBookRow {
            IF book.coverUrl exists {
                ShowCoverImage (small)
            } ELSE {
                ShowPlaceholder (small)
            }
            DisplayBookInfo {
                Title (clickable link)
                Author
                Language
                Pages
                Year
            }
        }
    }
}

// API Integration
function fetchFromGoogleBooksAPI(title, author) {
    query = constructSearchQuery(title, author)
    response = GET https://www.googleapis.com/books/v1/volumes?q=${query}
    IF response.success {
        RETURN getBestQualityCover(response.imageLinks)
    } ELSE {
        RETURN undefined
    }
}

// Responsive Design Logic
function handleResponsiveLayout {
    IF screenWidth < 768px {
        USE mobile layout
        2 columns grid
    } ELSE {
        USE desktop layout
        4 columns grid
    }
}

// Dark Mode Implementation
function toggleDarkMode {
    IF darkMode is active {
        APPLY dark color scheme
        STORE preference
    } ELSE {
        APPLY light color scheme
        STORE preference
    }
}

// Error Handling
function handleErrors {
    IF API fetch fails {
        USE placeholder image
        LOG error
    }

    IF book data missing {
        DISPLAY placeholder text
    }
}

## 🔍 Search and Filter Logic

```
// Search Index Creation
function createSearchIndex(books) {
    RETURN books.map(book => ({
        ...book,
        searchString: LOWERCASE(CONCAT(book.title, book.author, book.language))
    }))
}

// Filter Logic
function filterBooks(books, filters) {
    SET filteredBooks = books

    // Search Filter
    IF searchQuery NOT EMPTY {
        filteredBooks = filteredBooks.FILTER(book => 
            book.searchString.INCLUDES(LOWERCASE(searchQuery))
        )
    }

    // Country Filter
    IF selectedCountry NOT EMPTY {
        filteredBooks = filteredBooks.FILTER(book => 
            book.country EQUALS selectedCountry
        )
    }

    // Language Filter
    IF selectedLanguage NOT EMPTY {
        filteredBooks = filteredBooks.FILTER(book => 
            book.language EQUALS selectedLanguage
        )
    }

    // Pages Range Filter
    IF selectedPagesRange NOT "All Pages" {
        IF selectedPagesRange EQUALS "501+" {
            filteredBooks = filteredBooks.FILTER(book => 
                book.pages >= 501
            )
        } ELSE {
            SET [minPages, maxPages] = selectedPagesRange.SPLIT("-")
            filteredBooks = filteredBooks.FILTER(book => 
                book.pages >= minPages AND book.pages <= maxPages
            )
        }
    }

    // Century Filter
    IF selectedCentury NOT "All Years" {
        SET centuryNumber = PARSE_NUMBER(selectedCentury)
        SET startYear = (centuryNumber - 1) * 100 + 1
        SET endYear = centuryNumber * 100
        
        filteredBooks = filteredBooks.FILTER(book => 
            book.year >= startYear AND book.year <= endYear
        )
    }

    RETURN filteredBooks
}

// Pagination Logic
function paginateBooks(filteredBooks, currentPage, itemsPerPage) {
    SET totalPages = CEIL(filteredBooks.length / itemsPerPage)
    SET startIndex = (currentPage - 1) * itemsPerPage
    SET endIndex = startIndex + itemsPerPage
    
    RETURN {
        paginatedBooks: filteredBooks.SLICE(startIndex, endIndex),
        totalPages: totalPages,
        totalItems: filteredBooks.length
    }
}

// Search and Filter State Management
function handleSearchAndFilter {
    // Initialize States
    SET searchQuery = ""
    SET selectedCountry = ""
    SET selectedLanguage = ""
    SET selectedPagesRange = "All Pages"
    SET selectedCentury = "All Years"
    SET currentPage = 1
    SET itemsPerPage = 12

    // Create Memoized Search Index
    SET searchIndex = MEMOIZE(createSearchIndex(books))

    // Handle Search Input
    ON searchInput CHANGE {
        SET searchQuery = event.value
        DEBOUNCE updateResults(200ms)
    }

    // Handle Filter Changes
    ON filterChange {
        SET respective_filter = new_value
        SET currentPage = 1
        updateResults()
    }

    // Update Results
    function updateResults {
        SET isLoading = true
        SET filteredBooks = filterBooks(
            searchIndex, 
            {
                searchQuery,
                selectedCountry,
                selectedLanguage,
                selectedPagesRange,
                selectedCentury
            }
        )
        SET paginationResult = paginateBooks(
            filteredBooks,
            currentPage,
            itemsPerPage
        )
        UPDATE UI with paginationResult
        SET isLoading = false
    }
}
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
