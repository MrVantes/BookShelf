"use client";

import { useState, useEffect, useCallback } from "react";
import debounce from "lodash/debounce";
import { Input } from "../components/ui/input";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Library,
  Upload,
} from "lucide-react";
import FilterBar from "../components/FilterBar";
import BookList from "../components/BookList";
import { Button } from "../components/ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Replace <project-ref> with your Supabase project ref
const SUPABASE_EDGE_URL =
  "https://ekxqpkvvdonvpliouoes.supabase.co/functions/v1/search-books";

export default function Home() {
  // UI/filter state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [selectedPagesRange, setSelectedPagesRange] = useState("All Pages");
  const [selectedCentury, setSelectedCentury] = useState("All Years");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Data state
  const [paginatedBooks, setPaginatedBooks] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [countries, setCountries] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [userTier, setUserTier] = useState(null);

  // Filter options
  const PAGE_SIZE_OPTIONS = [20, 50, 100];
  const pageRanges = [
    "All Pages",
    "1-100",
    "101-200",
    "201-300",
    "301-400",
    "401-500",
    "501+",
  ];
  const centuries = [
    "All Years",
    "16th century",
    "17th century",
    "18th century",
    "19th century",
    "20th century",
    "21st century",
  ];

  // Debounce search input
  const debouncedSetSearch = useCallback(
    debounce((value) => setDebouncedSearch(value), 200),
    []
  );
  const handleSearchChange = useCallback(
    (e) => {
      setSearch(e.target.value);
      debouncedSetSearch(e.target.value);
    },
    [debouncedSetSearch]
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedPagesRange, selectedCentury, itemsPerPage]);

  // Fetch from Supabase Edge Function
  useEffect(() => {
    async function fetchBooks() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(SUPABASE_EDGE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            search: debouncedSearch,
            selectedCountry,
            selectedLanguage,
            selectedPagesRange,
            selectedCentury,
            currentPage,
            itemsPerPage,
          }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Failed to fetch");
        setPaginatedBooks(result.books);
        setTotalPages(result.totalPages);
        setCountries(result.countries || []);
        setLanguages(result.languages || []);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    fetchBooks();
  }, [
    debouncedSearch,
    selectedCountry,
    selectedLanguage,
    selectedPagesRange,
    selectedCentury,
    currentPage,
    itemsPerPage,
  ]);

  useEffect(() => {
    // Check user on mount
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        // Get tier directly from user metadata
        setUserTier(data.user.user_metadata?.tier ?? null);
      } else {
        setUserTier(null);
      }
    });
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          setUserTier(session.user.user_metadata?.tier ?? null);
        } else {
          setUserTier(null);
        }
      }
    );
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const router = useRouter();

  return (
    <div className="min-h-screen pb-16">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-10 shadow-sm">
        <div className="w-full max-w-7xl mx-auto px-4 relative">
          {/* Auth Button (top right) */}
          {!user ? (
            <button
              onClick={() => router.push("/login")}
              className="cursor-pointer absolute right-4 lg:right-8 top-2 flex items-center gap-1 border-1 border-gray-200 hover:bg-slate-200 px-3 py-1.5 rounded-md shadow transition font-medium"
              aria-label="Login"
            >
              <span className="hidden sm:inline">Login</span>
            </button>
          ) : userTier === 2 ? (
            <>
              <button
                onClick={() => router.push("/upload-cover")}
                className="cursor-pointer absolute right-24 lg:right-28 top-2 flex items-center gap-1 border-1 border-gray-200 hover:bg-slate-200 px-3 py-1.5 rounded-md shadow transition font-medium"
                aria-label="Upload Book Cover"
              >
                <Upload className="w-5 h-5" />
                <span className="hidden sm:inline">Upload</span>
              </button>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  setUser(null);
                  setUserTier(null);
                  router.push("/");
                }}
                className="cursor-pointer absolute right-4 lg:right-8 top-2 flex items-center gap-1 border-1 border-gray-200 hover:bg-red-100 px-3 py-1.5 rounded-md shadow transition font-medium text-red-600"
                aria-label="Logout"
              >
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                setUser(null);
                setUserTier(null);
                router.push("/");
              }}
              className="cursor-pointer absolute right-4 lg:right-8 top-2 flex items-center gap-1 border-1 border-gray-200 hover:bg-red-100 px-3 py-1.5 rounded-md shadow transition font-medium text-red-600"
              aria-label="Logout"
            >
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
          {/* Title */}
          <div className="flex flex-col items-center justify-center h-16">
            <div className="flex items-center gap-2 text-center font-bold text-2xl">
              <Library className="h-7 w-7" />
              <span>BookShelf</span>
            </div>
            <div className="text-center text-gray-500 text-xs">
              A curated list of books from supabase
            </div>
          </div>

          {/* Search & Filters Container */}
          <div className="w-full pb-4">
            {/* Search */}
            <div className="flex justify-center w-full sm:w-1/2 lg:w-1/3 mx-auto h-8 mb-3">
              <div className="relative w-full">
                <Search
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
                  size={14}
                />
                <Input
                  className="pl-8 h-8 text-sm"
                  placeholder="Search books, authors or language..."
                  value={search}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex justify-center w-full">
              <FilterBar
                pageRanges={pageRanges}
                centuries={centuries}
                selectedPagesRange={selectedPagesRange}
                selectedCentury={selectedCentury}
                onPagesRangeChange={setSelectedPagesRange}
                onCenturyChange={setSelectedCentury}
                viewMode={viewMode}
                onViewChange={setViewMode}
                countries={countries}
                languages={languages}
                selectedCountry={selectedCountry}
                selectedLanguage={selectedLanguage}
                onCountryChange={setSelectedCountry}
                onLanguageChange={setSelectedLanguage}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-7xl mx-auto px-4 pt-44">
        {/* Book List */}
        <BookList
          books={paginatedBooks}
          viewMode={viewMode}
          isLoading={loading}
        />
      </div>

      {/* Fixed Pagination */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t">
        <div className="w-full max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between gap-4 py-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border rounded-md px-2 py-1 text-xs cursor-pointer"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-8 px-2 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (!isNaN(value)) {
                      setCurrentPage(Math.min(Math.max(1, value), totalPages));
                    }
                  }}
                  className="w-12 text-center border rounded-md p-1 text-xs cursor-text"
                />
                <span className="text-xs text-gray-600">/ {totalPages}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="h-8 px-2 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-xs text-gray-500">
              {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, paginatedBooks.length)} of{" "}
              {paginatedBooks.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
