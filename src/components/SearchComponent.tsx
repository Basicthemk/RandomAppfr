"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { showToast } from "@/lib/toast";

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  folder?: { name: string };
}

export function SearchComponent() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async () => {
    if (query.length < 2) return;

    setSearching(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      showToast("Search failed", "error");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <input
        type="text"
        placeholder="Search recordings, transcripts, and summaries..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {hasSearched && (
        <div className="mt-4">
          {searching ? (
            <p className="text-gray-500">Searching...</p>
          ) : results.length === 0 ? (
            <p className="text-gray-500">No results found</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Found {results.length} result{results.length !== 1 ? "s" : ""}
              </p>
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={`/viewer/${result.id}`}
                  className="block p-3 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{result.title}</h3>
                      {result.description && (
                        <p className="text-sm text-gray-500 truncate">
                          {result.description}
                        </p>
                      )}
                      <div className="flex gap-2 mt-1 text-xs text-gray-500">
                        <span>
                          {new Date(result.createdAt).toLocaleDateString()}
                        </span>
                        {result.folder && <span>• {result.folder.name}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
