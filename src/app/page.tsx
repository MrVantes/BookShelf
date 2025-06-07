"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import debounce from "lodash/debounce";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import FilterBar from "@/components/FilterBar";
import BookList from "@/components/BookList";
import booksData from "./data/books.json";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Library } from "lucide-react";

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedPagesRange, setSelectedPagesRange] = useState("All Pages");
  const [selectedCentury, setSelectedCentury] = useState("All Years");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [isFiltering, setIsFiltering] = useState(false);

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

  // Move searchIndex to the top
  const searchIndex = useMemo(() => {
    return booksData.map((book) => ({
      ...book,
      searchString:
        `${book.title} ${book.author} ${book.language}`.toLowerCase(),
    }));
  }, []);

  // Get unique countries and languages from books data
  const countries = useMemo(() => {
    const uniqueCountries = [...new Set(booksData.map((book) => book.country))];
    return uniqueCountries.sort();
  }, []);

  const languages = useMemo(() => {
    const uniqueLanguages = [
      ...new Set(booksData.map((book) => book.language)),
    ];
    return uniqueLanguages.sort();
  }, []);

  const pagesMatch = useCallback(
    (bookPages: number, range: string): boolean => {
      if (range === "All Pages") return true;
      if (range === "501+") return bookPages >= 501;
      const [minStr, maxStr] = range.split("-");
      return bookPages >= Number(minStr) && bookPages <= Number(maxStr);
    },
    []
  );

  const yearMatch = useCallback(
    (bookYear: number, century: string): boolean => {
      if (century === "All Years") return true;
      const centNum = Number(century.split("th")[0]);
      if (isNaN(centNum)) return true;
      const startYear = (centNum - 1) * 100 + 1;
      const endYear = centNum * 100;
      return bookYear >= startYear && bookYear <= endYear;
    },
    []
  );

  // Update useMemo dependencies
  const { paginatedBooks, totalPages } = useMemo(() => {
    setIsFiltering(true);
    const lowerSearch = debouncedSearch.toLowerCase();

    const filtered = searchIndex.filter((book) => {
      if (selectedCountry && book.country !== selectedCountry) return false;
      if (selectedLanguage && book.language !== selectedLanguage) return false;
      if (
        selectedPagesRange !== "All Pages" &&
        !pagesMatch(book.pages, selectedPagesRange)
      )
        return false;
      if (
        selectedCentury !== "All Years" &&
        !yearMatch(book.year, selectedCentury)
      )
        return false;
      if (lowerSearch && !book.searchString.includes(lowerSearch)) return false;
      return true;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedBooks = filtered.slice(start, start + itemsPerPage);

    setIsFiltering(false);
    return { paginatedBooks, totalPages };
  }, [
    searchIndex,
    debouncedSearch,
    selectedCountry,
    selectedLanguage,
    selectedPagesRange,
    selectedCentury,
    currentPage,
    itemsPerPage,
    pagesMatch,
    yearMatch,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedPagesRange, selectedCentury, itemsPerPage]);

  // Debounce search updates
  const debouncedSetSearch = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearch(value);
      }, 200),
    []
  );

  // Update search immediately but debounce the filtering
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      debouncedSetSearch(e.target.value);
    },
    [debouncedSetSearch]
  );

  return (
    <div className="min-h-screen pb-16">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-10 shadow-sm">
        <div className="w-full max-w-7xl mx-auto px-4">
          {/* Title */}
          <div className="flex flex-col items-center justify-center h-16">
            <div className="flex items-center gap-2 text-center font-bold text-2xl">
              <Library className="h-7 w-7" /> {/* Add the logo */}
              <span>BookShelf</span>
            </div>
            <div className="text-center text-gray-500 text-xs">
              A curated list of books from books.json
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
          isLoading={isFiltering}
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
