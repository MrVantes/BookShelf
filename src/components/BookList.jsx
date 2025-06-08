/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";

export default function BookList({ books, viewMode, isLoading = false }) {
  const [booksWithCovers, setBooksWithCovers] = useState([]);
  const [isFetchingCovers, setIsFetchingCovers] = useState(false);

  const fetchGoogleBookCover = async (book) => {
    try {
      const query = encodeURIComponent(`intitle:${book.title}+inauthor:${book.author}`);
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`
      );
      const data = await res.json();
      const imageLinks = data.items?.[0]?.volumeInfo?.imageLinks;
      return imageLinks?.thumbnail || imageLinks?.smallThumbnail;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    async function loadCovers() {
      setIsFetchingCovers(true);
      try {
        const booksWithImages = await Promise.all(
          books.map(async (book) => {
            // Try GitHub image first
            const filename = book.title
              .toLowerCase()
              .replace(/[^a-z0-9\s]/g, "")
              .replace(/\s+/g, "-");
            const githubUrl = `https://raw.githubusercontent.com/benoitvallon/100-best-books/master/static/images/${filename}.jpg`;
            
            try {
              const response = await fetch(githubUrl, { method: 'HEAD' });
              if (response.ok) {
                return { ...book, coverUrl: githubUrl };
              }
              // If GitHub image fails, try Google Books
              const googleCover = await fetchGoogleBookCover(book);
              return { ...book, coverUrl: googleCover || null };
            } catch {
              // If both fail, return book without cover
              return { ...book, coverUrl: null };
            }
          })
        );
        setBooksWithCovers(booksWithImages || []);
      } catch (error) {
        console.error("Error loading covers:", error);
        setBooksWithCovers(books.map(book => ({ ...book, coverUrl: null })));
      } finally {
        setIsFetchingCovers(false);
      }
    }

    loadCovers();
  }, [books]);

  if (isLoading || isFetchingCovers) {
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isLoading ? "Loading books..." : "Fetching books..."}
        </p>
      </div>
    );
  }

  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-2 md:grid-cols-4 gap-4 p-4"
          : "flex flex-col gap-4 p-4 max-w-3xl mx-auto"
      }
    >
      {booksWithCovers.map((book, i) => (
        <div
          key={i}
          className={`border dark:border-gray-800 rounded-md shadow-sm bg-white dark:bg-gray-900 ${
            viewMode === "list" ? "flex gap-4 p-4" : "p-2 flex flex-col"
          }`}
        >
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className={`rounded-md select-none cursor-default ${
                viewMode === "list"
                  ? "h-32 w-24 object-cover flex-shrink-0"
                  : "h-48 w-full object-cover mb-2"
              }`}
            />
          ) : (
            <div
              className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md text-gray-400 dark:text-gray-600 italic select-none cursor-default ${
                viewMode === "list"
                  ? "h-32 w-24 flex-shrink-0"
                  : "h-48 w-full mb-2"
              }`}
            >
              No Image
            </div>
          )}
          <div className={viewMode === "list" ? "flex-grow" : ""}>
            <a
              href={book.link?.trim()}
              target="_blank"
              rel="noopener noreferrer"
              className="block font-semibold text-sm mb-1 hover:underline text-blue-600 cursor-pointer"
            >
              {book.title}
            </a>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              {book.author}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              {book.language}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {book.pages} pages —{" "}
              {book.year > 0 ? book.year : `${-book.year} BC`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
