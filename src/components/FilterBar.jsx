"use client";

import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Filter, LayoutGrid, List } from "lucide-react";

export default function FilterBar({
  pageRanges,
  centuries,
  selectedPagesRange,
  selectedCentury,
  onPagesRangeChange,
  onCenturyChange,
  viewMode,
  onViewChange,
  countries,
  languages,
  selectedCountry,
  selectedLanguage,
  onCountryChange,
  onLanguageChange,
}) {
  return (
    <div className="relative">
      {/* Filter Label */}
      <div className="flex justify-center items-center gap-1 mb-2">
        <Filter size={12} />
        <span className="text-gray-600 font-medium text-xs">Filters:</span>
      </div>
      {/* Dropdowns */}
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Country Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-8 min-w-[120px] justify-between text-xs cursor-pointer"
            >
              {selectedCountry || "All Countries"}
              <span className="ml-1">▾</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="z-[100] w-[var(--radix-dropdown-menu-trigger-width)]"
            align="start"
            sideOffset={4}
            style={{ position: "fixed" }}
          >
            <DropdownMenuItem
              className="text-xs cursor-pointer"
              onClick={() => onCountryChange("")}
            >
              All Countries
            </DropdownMenuItem>
            {countries.map((country) => (
              <DropdownMenuItem
                className="text-xs cursor-pointer"
                key={country}
                onClick={() => onCountryChange(country)}
              >
                {country}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Language Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-8 min-w-[120px] justify-between text-xs cursor-pointer"
            >
              {selectedLanguage || "All Languages"}
              <span className="ml-1">▾</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              className="text-xs cursor-pointer"
              onClick={() => onLanguageChange("")}
            >
              All Languages
            </DropdownMenuItem>
            {languages.map((language) => (
              <DropdownMenuItem
                className="text-xs cursor-pointer"
                key={language}
                onClick={() => onLanguageChange(language)}
              >
                {language}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Pages Range Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-8 min-w-[100px] justify-between text-xs cursor-pointer"
            >
              {selectedPagesRange}
              <span className="ml-1">▾</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {pageRanges.map((range) => (
              <DropdownMenuItem
                className="text-xs cursor-pointer"
                key={range}
                onClick={() => onPagesRangeChange(range)}
              >
                {range}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Century Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-8 min-w-[120px] justify-between text-xs cursor-pointer"
            >
              {selectedCentury}
              <span className="ml-1">▾</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {centuries.map((century) => (
              <DropdownMenuItem
                className="text-xs cursor-pointer"
                key={century}
                onClick={() => onCenturyChange(century)}
              >
                {century}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Toggle */}
        <div className="flex border rounded-md overflow-hidden ml-auto">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            className={`h-8 w-8 rounded-none ${
              viewMode === "grid" ? "bg-gray-900 text-white" : ""
            }`}
            aria-label="Grid view"
            onClick={() => onViewChange("grid")}
          >
            <LayoutGrid size={14} />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            className={`h-8 w-8 rounded-none ${
              viewMode === "list" ? "bg-gray-900 text-white" : ""
            }`}
            aria-label="List view"
            onClick={() => onViewChange("list")}
          >
            <List size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
