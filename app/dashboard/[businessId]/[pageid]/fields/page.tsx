"use client"

import { useEffect, useState } from "react"
import { Check, Plus, Save, Search, Trash2, X } from "lucide-react"
import { toast } from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getAllProducts, getFiltersByProduct, addFilter, editFilter, deleteFilter } from "@/app/api/business/products"

// Types for our data structure
type Product = {
  id: number
  name: string
  description?: string
  price?: number
  variantsByType?: Record<string, any[]>
  [key: string]: any
}

type Filter = {
  id: number
  key: string
  value: string[] // Changed from string to string[]
  productId: number
}

export default function ProductFieldsAdmin({ params }) {
  const businessPageId = params.pageid

  // State for products
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for filters
  const [filters, setFilters] = useState<Record<number, Filter[]>>({})

  // State for new filter form
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [newFilterKey, setNewFilterKey] = useState("")
  const [newFilterValues, setNewFilterValues] = useState<string[]>([]) // Changed from newFilterValue (string) to newFilterValues (string[])
  const [newValueInput, setNewValueInput] = useState("") // New state for the input field

  // State for editing filter
  const [editingFilter, setEditingFilter] = useState<Filter | null>(null)
  const [editKey, setEditKey] = useState("")
  const [editValues, setEditValues] = useState<string[]>([]) // Changed from editValue (string) to editValues (string[])
  const [editValueInput, setEditValueInput] = useState("") // New state for the input field

  // State for product search
  const [searchQuery, setSearchQuery] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Fetch products on component mount
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const data = await getAllProducts(businessPageId)
        setProducts(data)
      } catch (err) {
        setError("Failed to load products")
        toast.error("Failed to load products")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [businessPageId])

  // Fetch filters for a product
  const fetchFilters = async (productId: number) => {
    try {
      const data = await getFiltersByProduct(productId)
      setFilters((prev) => ({
        ...prev,
        [productId]: data,
      }))
      return data
    } catch (err) {
      console.error("Error fetching filters:", err)
      // If no filters found, set empty array
      if ((err as Error).message.includes("No filters found")) {
        setFilters((prev) => ({
          ...prev,
          [productId]: [],
        }))
      } else {
        toast.error("Failed to load filters")
      }
      return []
    }
  }

  // Handle product selection
  const handleProductSelect = async (productId: string) => {
    const id = Number.parseInt(productId)

    // Toggle selection - if already selected, remove it, otherwise add it
    if (selectedProducts.includes(id)) {
      setSelectedProducts((prev) => prev.filter((p) => p !== id))
    } else {
      setSelectedProducts((prev) => [...prev, id])

      // If we haven't loaded filters for this product yet, fetch them
      if (!filters[id]) {
        await fetchFilters(id)
      }
    }
  }

  // Add a new filter
  const handleAddFilter = async () => {
    if (selectedProducts.length === 0 || !newFilterKey.trim() || newFilterValues.length === 0) {
      toast.error("Please select at least one product, provide a key, and add at least one value")
      return
    }

    try {
      // Show loading toast
      const loadingToast = toast.loading(`Adding field to ${selectedProducts.length} product(s)...`)

      // Add filter to each selected product
      const results = await Promise.all(
        selectedProducts.map(async (productId) => {
          const newFilter = await addFilter(productId, newFilterKey, newFilterValues)

          // Update local state
          setFilters((prev) => ({
            ...prev,
            [productId]: [...(prev[productId] || []), newFilter],
          }))

          return newFilter
        }),
      )

      // Reset form
      setNewFilterKey("")
      setNewFilterValues([])
      setNewValueInput("")

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast)
      toast.success(`Field added to ${selectedProducts.length} product(s) successfully`)
    } catch (err) {
      toast.error("Failed to add filter to some products")
      console.error(err)
    }
  }

  // Add a value to the new filter values array
  const addValueToNewFilter = () => {
    if (!newValueInput.trim()) return

    setNewFilterValues((prev) => [...prev, newValueInput.trim()])
    setNewValueInput("")
  }

  // Remove a value from the new filter values array
  const removeValueFromNewFilter = (index: number) => {
    setNewFilterValues((prev) => prev.filter((_, i) => i !== index))
  }

  // Add a value to the edit filter values array
  const addValueToEditFilter = () => {
    if (!editValueInput.trim()) return

    setEditValues((prev) => [...prev, editValueInput.trim()])
    setEditValueInput("")
  }

  // Remove a value from the edit filter values array
  const removeValueFromEditFilter = (index: number) => {
    setEditValues((prev) => prev.filter((_, i) => i !== index))
  }

  // Start editing a filter
  const startEditFilter = (filter: Filter) => {
    setEditingFilter(filter)
    setEditKey(filter.key)
    setEditValues([...filter.value]) // Clone the array
    setEditValueInput("")
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingFilter(null)
    setEditKey("")
    setEditValues("")
    setEditValueInput("")
  }

  // Save filter edits
  const saveFilterEdit = async () => {
    if (!editingFilter || !editKey.trim() || editValues.length === 0) {
      toast.error("Please provide a key and at least one value")
      return
    }

    try {
      const updated = await editFilter(editingFilter.id, editKey, editValues)

      // Update local state
      setFilters((prev) => {
        const productFilters = prev[editingFilter.productId] || []
        const updatedFilters = productFilters.map((f) => (f.id === editingFilter.id ? updated : f))

        return {
          ...prev,
          [editingFilter.productId]: updatedFilters,
        }
      })

      cancelEdit()
      toast.success("Filter updated successfully")
    } catch (err) {
      toast.error("Failed to update filter")
      console.error(err)
    }
  }

  // Delete a filter
  const handleDeleteFilter = async (filterId: number, productId: number) => {
    try {
      await deleteFilter(filterId)

      // Update local state
      setFilters((prev) => {
        const productFilters = prev[productId] || []
        return {
          ...prev,
          [productId]: productFilters.filter((f) => f.id !== filterId),
        }
      })

      toast.success("Filter deleted successfully")
    } catch (err) {
      toast.error("Failed to delete filter")
      console.error(err)
    }
  }

  // Filter products based on search query
  const filteredProducts = searchQuery
    ? products.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : products

  // Remove a product from selection
  const removeProduct = (productId: number) => {
    setSelectedProducts((prev) => prev.filter((id) => id !== productId))
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading products...</div>
  }

  if (error) {
    return <div className="text-destructive text-center p-4">{error}</div>
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Product Fields Management</h1>

      <Tabs defaultValue="fields">
        <TabsList className="mb-6">
          <TabsTrigger value="fields">Manage Fields</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Fields Management Tab */}
        <TabsContent value="fields">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Product Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Products</CardTitle>
                <CardDescription>Choose one or more products to manage fields</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Product Search and Dropdown */}
                  <div className="space-y-2">
                    <Label htmlFor="product-search">Search & Select Products</Label>
                    <div className="flex flex-col gap-2">
                      <Popover open={dropdownOpen} onOpenChange={setDropdownOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={dropdownOpen}
                            className="justify-between w-full"
                          >
                            {selectedProducts.length > 0
                              ? `${selectedProducts.length} product(s) selected`
                              : "Select products..."}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput
                              placeholder="Search products..."
                              value={searchQuery}
                              onValueChange={setSearchQuery}
                            />
                            <CommandList>
                              <CommandEmpty>No products found.</CommandEmpty>
                              <CommandGroup>
                                <ScrollArea className="h-[200px]">
                                  {filteredProducts.map((product) => (
                                    <CommandItem
                                      key={product.id}
                                      value={product.id.toString()}
                                      onSelect={() => {
                                        handleProductSelect(product.id.toString())
                                        // Keep dropdown open for multiple selections
                                      }}
                                    >
                                      <Check
                                        className={`mr-2 h-4 w-4 ${
                                          selectedProducts.includes(product.id) ? "opacity-100" : "opacity-0"
                                        }`}
                                      />
                                      {product.name}
                                    </CommandItem>
                                  ))}
                                </ScrollArea>
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Selected Products */}
                  {selectedProducts.length > 0 && (
                    <div>
                      <Label className="mb-2 block">Selected Products</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedProducts.map((productId) => {
                          const product = products.find((p) => p.id === productId)
                          return (
                            <Badge key={productId} variant="secondary" className="flex items-center gap-1">
                              {product?.name}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 ml-1"
                                onClick={() => removeProduct(productId)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Product List with Search */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Label htmlFor="product-list-search">Quick Search</Label>
                      <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="product-list-search"
                          placeholder="Filter products..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <ScrollArea className="h-[300px] border rounded-md">
                      <div className="p-2 space-y-1">
                        {filteredProducts.length === 0 ? (
                          <p className="text-center py-4 text-muted-foreground">No products found</p>
                        ) : (
                          filteredProducts.map((product) => (
                            <div
                              key={product.id}
                              className={`p-2 border rounded-md cursor-pointer flex items-center justify-between ${
                                selectedProducts.includes(product.id) ? "bg-muted border-primary" : ""
                              }`}
                              onClick={() => handleProductSelect(product.id.toString())}
                            >
                              <span>{product.name}</span>
                              {selectedProducts.includes(product.id) && (
                                <div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                  ✓
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Create New Field */}
            <Card>
              <CardHeader>
                <CardTitle>Add New Field to Selected Products</CardTitle>
                <CardDescription>Add a field to all selected products at once</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="field-key">Field Name</Label>
                    <Input
                      id="field-key"
                      placeholder="e.g. size, color, material"
                      value={newFilterKey}
                      onChange={(e) => setNewFilterKey(e.target.value)}
                      disabled={selectedProducts.length === 0}
                    />
                  </div>

                  <div>
                    <Label htmlFor="field-values">Field Values</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        id="field-values"
                        placeholder="e.g. large, red, cotton"
                        value={newValueInput}
                        onChange={(e) => setNewValueInput(e.target.value)}
                        disabled={selectedProducts.length === 0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addValueToNewFilter()
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={addValueToNewFilter}
                        disabled={selectedProducts.length === 0 || !newValueInput.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {newFilterValues.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newFilterValues.map((value, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {value}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0 ml-1"
                              onClick={() => removeValueFromNewFilter(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleAddFilter}
                    disabled={selectedProducts.length === 0 || !newFilterKey.trim() || newFilterValues.length === 0}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Field to Selected Products
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Fields */}
          {selectedProducts.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>
                  Current Fields for {products.find((p) => p.id === selectedProducts[0])?.name}
                  {selectedProducts.length > 1 && ` (+ ${selectedProducts.length - 1} more)`}
                </CardTitle>
                <CardDescription>
                  {selectedProducts.length === 1
                    ? "Manage existing fields for this product"
                    : "Showing fields for the first selected product"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!filters[selectedProducts[0]] ? (
                  <div className="text-center py-4">Loading fields...</div>
                ) : filters[selectedProducts[0]].length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No fields added yet.</p>
                ) : (
                  <div className="space-y-4">
                    {filters[selectedProducts[0]].map((filter) => (
                      <div key={filter.id} className="border rounded-lg p-4">
                        {editingFilter?.id === filter.id ? (
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor={`edit-key-${filter.id}`}>Field Name</Label>
                              <Input
                                id={`edit-key-${filter.id}`}
                                value={editKey}
                                onChange={(e) => setEditKey(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`edit-values-${filter.id}`}>Field Values</Label>
                              <div className="flex gap-2 mb-2">
                                <Input
                                  id={`edit-values-${filter.id}`}
                                  value={editValueInput}
                                  onChange={(e) => setEditValueInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault()
                                      addValueToEditFilter()
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="secondary"
                                  onClick={addValueToEditFilter}
                                  disabled={!editValueInput.trim()}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>

                              {editValues.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {editValues.map((value, index) => (
                                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                      {value}
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-4 w-4 p-0 ml-1"
                                        onClick={() => removeValueFromEditFilter(index)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={saveFilterEdit} className="flex-1">
                                <Save className="mr-2 h-4 w-4" />
                                Save
                              </Button>
                              <Button variant="outline" onClick={cancelEdit} className="flex-1">
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{filter.key}</h3>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {filter.value.map((val, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {val}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon" onClick={() => startEditFilter(filter)}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteFilter(filter.id, selectedProducts[0])}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Customer View Preview</CardTitle>
              <CardDescription>This is how customers will see the product options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="preview-product">Select Product</Label>
                  <Select
                    onValueChange={async (value) => {
                      const productId = Number.parseInt(value)
                      if (!filters[productId]) {
                        await fetchFilters(productId)
                      }
                    }}
                  >
                    <SelectTrigger id="preview-product">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProducts.length > 0 && filters[selectedProducts[0]]?.length > 0 && (
                  <div className="border rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">
                      {products.find((p) => p.id === selectedProducts[0])?.name}
                    </h2>

                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Group filters by key */}
                      {Object.entries(
                        filters[selectedProducts[0]].reduce(
                          (acc, filter) => {
                            if (!acc[filter.key]) acc[filter.key] = []
                            acc[filter.key].push(filter)
                            return acc
                          },
                          {} as Record<string, Filter[]>,
                        ),
                      ).map(([key, options]) => (
                        <div key={key}>
                          <Label htmlFor={`preview-${key}`}>{key}</Label>
                          <Select>
                            <SelectTrigger id={`preview-${key}`}>
                              <SelectValue placeholder={`Select ${key}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {options[0].value.map((val, index) => (
                                <SelectItem key={`${options[0].id}-${index}`} value={val}>
                                  {val}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>

                    <Button className="mt-6 w-full">Add to Cart</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

