"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react"

// Mock data - replace with actual API call in production
const products = [
  { id: 1, name: "Product 1", category: "Category A", price: 19.99, stock: 100 },
  { id: 2, name: "Product 2", category: "Category B", price: 29.99, stock: 50 },
  // Add more products...
]

export default function ProductsTable() {
  const [sortColumn, setSortColumn] = useState("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filter, setFilter] = useState("")
  const [visibleColumns, setVisibleColumns] = useState(["name", "category", "price", "stock"])

  const sortedProducts = [...products].sort((a, b) => {
    if (sortColumn) {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1
      if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1
    }
    return 0
  })

  const filteredProducts = sortedProducts.filter((product) =>
    Object.values(product).some((value) => value.toString().toLowerCase().includes(filter.toLowerCase())),
  )

  const handleSort = (column) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Input
          placeholder="Filter products..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Columns</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {["name", "category", "price", "stock"].map((column) => (
              <DropdownMenuCheckboxItem
                key={column}
                checked={visibleColumns.includes(column)}
                onCheckedChange={(checked) =>
                  setVisibleColumns(
                    checked ? [...visibleColumns, column] : visibleColumns.filter((col) => col !== column),
                  )
                }
              >
                {column.charAt(0).toUpperCase() + column.slice(1)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.includes("name") && (
                <TableHead className="w-[200px]">
                  <Button variant="ghost" onClick={() => handleSort("name")}>
                    Name{" "}
                    {sortColumn === "name" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-2 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-2 h-4 w-4" />
                      ))}
                  </Button>
                </TableHead>
              )}
              {visibleColumns.includes("category") && (
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("category")}>
                    Category{" "}
                    {sortColumn === "category" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-2 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-2 h-4 w-4" />
                      ))}
                  </Button>
                </TableHead>
              )}
              {visibleColumns.includes("price") && (
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("price")}>
                    Price{" "}
                    {sortColumn === "price" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-2 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-2 h-4 w-4" />
                      ))}
                  </Button>
                </TableHead>
              )}
              {visibleColumns.includes("stock") && (
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("stock")}>
                    Stock{" "}
                    {sortColumn === "stock" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-2 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-2 h-4 w-4" />
                      ))}
                  </Button>
                </TableHead>
              )}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                {visibleColumns.includes("name") && <TableCell className="font-medium">{product.name}</TableCell>}
                {visibleColumns.includes("category") && <TableCell>{product.category}</TableCell>}
                {visibleColumns.includes("price") && <TableCell>${product.price.toFixed(2)}</TableCell>}
                {visibleColumns.includes("stock") && <TableCell>{product.stock}</TableCell>}
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

