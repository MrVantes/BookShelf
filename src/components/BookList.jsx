/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { supabase } from "../lib/SupabaseClient";
import { Edit } from "lucide-react";

function BookCard({ book, viewMode, onEdit }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`border dark:border-gray-800 rounded-md shadow-sm bg-white dark:bg-gray-900 ${
        viewMode === "list" ? "flex gap-4 p-4" : "p-2 flex flex-col"
      }`}
    >
      <div className={`relative group ${viewMode === "list" ? "" : "mb-2"}`}>
        {book.coverUrl && !imgError ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            onError={() => setImgError(true)}
            className={`rounded-md select-none cursor-default ${
              viewMode === "list"
                ? "h-32 w-24 object-cover flex-shrink-0"
                : "h-48 w-full object-cover"
            }`}
          />
        ) : (
          <div
            className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md text-gray-400 dark:text-gray-600 italic select-none cursor-default ${
              viewMode === "list" ? "h-32 w-24 flex-shrink-0" : "h-48 w-full"
            }`}
          >
            No Image
          </div>
        )}

        {/* Edit button */}
        <button
          className="cursor-pointer absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition bg-white/90 hover:bg-blue-100 rounded-full p-1 shadow"
          title="Edit"
          onClick={() => onEdit(book)}
          tabIndex={-1}
          type="button"
        >
          <Edit className="w-4 h-4 text-blue-600" />
        </button>
      </div>

      <div className={viewMode === "list" ? "flex-grow" : ""}>
        <a
          href={book.link?.trim()}
          target="_blank"
          rel="noopener noreferrer"
          className="block font-semibold text-sm mb-1 hover:underline text-blue-600 cursor-pointer"
        >
          {book.title}
        </a>
        <p className="text-xs text-gray-600 dark:text-gray-300">{book.author}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">{book.language}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {book.pages} pages — {book.year > 0 ? book.year : `${-book.year} BC`}
        </p>
      </div>
    </div>
  );
}

export default function BookList({ books, viewMode, isLoading = false }) {
  const [booksWithCovers, setBooksWithCovers] = useState([]);
  const [isFetchingCovers, setIsFetchingCovers] = useState(false);
  const [activeBook, setActiveBook] = useState(null);
  const [storedImages, setStoredImages] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchGoogleBookCover = async (book) => {
    try {
      const cleanTitle = book.title.replace(/,/g, "").trim();
      const hasAuthor = book.author && book.author.toLowerCase() !== "unknown";
      const query = hasAuthor
        ? encodeURIComponent(
            `intitle:${cleanTitle}+inauthor:${book.author.trim()}`
          )
        : encodeURIComponent(`intitle:${cleanTitle}`);

      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=10`
      );
      const data = await res.json();

      if (!data.items) return null;

      const bookWithImage = data.items.find(
        (item) =>
          item.volumeInfo?.imageLinks?.thumbnail ||
          item.volumeInfo?.imageLinks?.smallThumbnail
      );

      return (
        bookWithImage?.volumeInfo?.imageLinks?.thumbnail ||
        bookWithImage?.volumeInfo?.imageLinks?.smallThumbnail ||
        null
      );
    } catch (err) {
      console.error("Failed to fetch book cover:", err);
      return null;
    }
  };

const fetchStoredImages = async () => {
  const { data: listData, error: listError } = await supabase.storage
    .from("bookcovers")
    .list("covers", {
      limit: 100,
      sortBy: { column: "name", order: "asc" },
    });

  if (listError) {
    console.error("Failed to list files:", listError.message);
    return;
  }

  const urls = await Promise.all(
    listData.map(async (item) => {
      const { data: publicUrlData, error: publicUrlError } = supabase.storage
        .from("bookcovers")
        .getPublicUrl(`covers/${item.name}`);

      if (publicUrlError) {
        console.error(`Failed public URL for ${item.name}:`, publicUrlError.message);
        return null;
      }

      return {
        name: item.name,
        url: publicUrlData.publicUrl,
      };
    })
  );

  const validUrls = urls.filter(Boolean);
  setStoredImages(validUrls);
};



  useEffect(() => {
    async function loadCovers() {
      setIsFetchingCovers(true);
      try {
        const booksWithImages = await Promise.all(
          books.map(async (book) => {
            if (book.coverUrl && book.coverUrl.trim() !== "") {
              const { data } = supabase.storage
                .from("bookcovers")
                .getPublicUrl(book.coverUrl.trim());
              const publicUrl = data?.publicUrl;
              return { ...book, coverUrl: publicUrl };
            }

            const filename = book.title
              .toLowerCase()
              .replace(/[^a-z0-9\s]/g, "")
              .replace(/\s+/g, "-");
            const githubUrl = `https://raw.githubusercontent.com/benoitvallon/100-best-books/master/static/images/${filename}.jpg`;

            try {
              const response = await fetch(githubUrl, { method: "HEAD" });
              if (response.ok) {
                return { ...book, coverUrl: githubUrl };
              }

              const googleCover = await fetchGoogleBookCover(book);
              return { ...book, coverUrl: googleCover || null };
            } catch (err) {
              console.error("Error fetching fallback covers:", err);
              return { ...book, coverUrl: null };
            }
          })
        );

        setBooksWithCovers(booksWithImages || []);
      } catch (error) {
        console.error("Error loading covers:", error);
        setBooksWithCovers(books.map((book) => ({ ...book, coverUrl: null })));
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
    <>
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-2 md:grid-cols-4 gap-4 p-4"
            : "flex flex-col gap-4 p-4 max-w-3xl mx-auto"
        }
      >
        {booksWithCovers.map((book, i) => (
          <BookCard
            key={i}
            book={book}
            viewMode={viewMode}
            onEdit={(book) => {
              setActiveBook(book);
              setShowModal(true);
              fetchStoredImages();
            }}
          />
        ))}
      </div>

      {showModal && activeBook && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4 text-center">
              Select a Cover for{" "}
              <span className="text-blue-600">{activeBook.title}</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {storedImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img.url}
                  alt={`Cover ${idx}`}
                  onClick={async () => {
                    // Update the coverUrl in the Supabase table for this book
                    const { error } = await supabase
                      .from("Books")
                      .update({ coverUrl: `covers/${img.name}` })
                      .eq("id", activeBook.id);

                    if (error) {
                      alert("Failed to update cover: " + error.message);
                      return;
                    }

                    // Update local state to reflect the new cover
                    const updated = booksWithCovers.map((book) =>
                      book.id === activeBook.id
                        ? { ...book, coverUrl: img.url }
                        : book
                    );
                    setBooksWithCovers(updated);
                    setShowModal(false);
                    setActiveBook(null);
                  }}
                  className="cursor-pointer hover:scale-105 transition rounded shadow border border-gray-200"
                />
              ))}
            </div>
            <button
              className="mt-6 block mx-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
              onClick={() => {
                setShowModal(false);
                setActiveBook(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
