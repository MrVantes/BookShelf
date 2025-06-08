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
- [TypeScript](https://www.typescriptlang.org/) - Type safety
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
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
