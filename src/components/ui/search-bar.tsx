"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
  value?: string
  onChange?: (query: string) => void
}

const SearchBar = ({
  placeholder = "Search...",
  onSearch,
  value,
  onChange,
}: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState(value || "")

  useEffect(() => {
    if (value !== undefined) {
      setSearchQuery(value)
    }
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    if (onChange) {
      onChange(query)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchQuery)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit(e as React.FormEvent)
    }
    
    // Enable paste and select all shortcuts
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      return; // Let the default paste behavior work
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      return; // Let the default select all behavior work
    }
  }

  const handleClear = () => {
    setSearchQuery('')
    if (onChange) {
      onChange('')
    }
    if (onSearch) {
      onSearch('')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-center w-full"
    >
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <input
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          "w-full pl-10 py-2 rounded-none",
          searchQuery ? "pr-10" : "pr-4", // 有内容时为清除按钮留出空间
          "bg-transparent border-0 border-b-2 border-border",
          "focus:outline-none focus:ring-0 focus:border-primary",
          "transition-colors duration-300"
        )}
      />
      {searchQuery && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-accent rounded-full transition-colors"
          title="Clear search"
        >
          <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </button>
      )}
    </form>
  )
}

export { SearchBar } 