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

type Field = {
  id: number
  name: string
  keyValues: Record<string, number | string> // JSON object storing key-value pairs
  type: string // Type of the field (e.g., "Cost", "Length")
  productId: number
}

export default function ProductFieldsAdmin({ params }) {
  const businessPageId = params.pageid

  // State for products
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for fields
  const [fields, setFields] = useState<Record<number, Field[]>>({})

  // State for new field form
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [newFieldName, setNewFieldName] = useState("")
  const [newFieldType, setNewFieldType] = useState("")

  // State for key-value pairs
  const [keyValuePairs, setKeyValuePairs] = useState<Array<{ key: string; value: string | number }>>([])
  const [newKey, setNewKey] = useState("")
  const [newValue, setNewValue] = useState("")

  // State for editing field
  const [editingField, setEditingField] = useState<Field | null>(null)
  const [editName, setEditName] = useState("")
  const [editType, setEditType] = useState("")
  const [editKeyValuePairs, setEditKeyValuePairs] = useState<Array<{ key: string; value: string | number }>>([])
  const [editNewKey, setEditNewKey] = useState("")
  const [editNewValue, setEditNewValue] = useState("")

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
      } catch (err: any) {
        setError("Failed to load products")
        toast.error("Failed to load products")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [businessPageId])

  // Fetch fields for a product
  const fetchFields = async (productId: number) => {
    try {
      const data = await getFiltersByProduct(productId)
      setFields((prev) => ({
        ...prev,
        [productId]: data,
      }))
      return data
    } catch (err: any) {
      console.error("Error fetching fields:", err)
      // If no fields found, set empty array
      if ((err as Error).message.includes("No filters found")) {
        setFields((prev) => ({
          ...prev,
          [productId]: [],
        }))
      } else {
        toast.error("Failed to load fields")
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

      // If we haven't loaded fields for this product yet, fetch them
      if (!fields[id]) {
        await fetchFields(id)
      }
    }
  }

  // Add a new key-value pair to the form
  const addKeyValuePair = () => {
    if (!newKey.trim()) {
      toast.error("Please enter a key")
      return
    }

    const valueAsNumber = Number(newValue)
    const valueToAdd = !isNaN(valueAsNumber) ? valueAsNumber : newValue

    setKeyValuePairs([...keyValuePairs, { key: newKey, value: valueToAdd }])
    setNewKey("")
    setNewValue("")
  }

  // Remove a key-value pair from the form
  const removeKeyValuePair = (index: number) => {
    setKeyValuePairs(keyValuePairs.filter((_, i) => i !== index))
  }

  // Add a new field
  const handleAddField = async () => {
    if (selectedProducts.length === 0 || !newFieldName.trim() || keyValuePairs.length === 0) {
      toast.error("Please select at least one product, provide a field name, and add at least one key-value pair")
      return
    }

    try {
      // Convert array of key-value pairs to object format
      const keyValuesObject: Record<string, any> = {}
      keyValuePairs.forEach((pair) => {
        keyValuesObject[pair.key] = pair.value
      })

      // Show loading toast
      const loadingToast = toast.loading(`Adding field to ${selectedProducts.length} product(s)...`)

      // Add field to each selected product
      const results = await Promise.all(
        selectedProducts.map(async (productId) => {
          const newField = await addFilter(productId, newFieldName, keyValuesObject, newFieldType || "default")

          // Update local state
          setFields((prev) => ({
            ...prev,
            [productId]: [...(prev[productId] || []), newField],
          }))

          return newField
        }),
      )

      // Reset form
      setNewFieldName("")
      setNewFieldType("")
      setKeyValuePairs([])
      setNewKey("")
      setNewValue("")

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast)
      toast.success(`Field added to ${selectedProducts.length} product(s) successfully`)
    } catch (err: any) {
      toast.error("Failed to add field")
      console.error(err)
    }
  }

  // Add a key-value pair to the edit form
  const addEditKeyValuePair = () => {
    if (!editNewKey.trim()) {
      toast.error("Please enter a key")
      return
    }

    const valueAsNumber = Number(editNewValue)
    const valueToAdd = !isNaN(valueAsNumber) ? valueAsNumber : editNewValue

    setEditKeyValuePairs([...editKeyValuePairs, { key: editNewKey, value: valueToAdd }])
    setEditNewKey("")
    setEditNewValue("")
  }

  // Remove a key-value pair from the edit form
  const removeEditKeyValuePair = (index: number) => {
    setEditKeyValuePairs(editKeyValuePairs.filter((_, i) => i !== index))
  }

  // Start editing a field
  const startEditField = (field: Field) => {
    setEditingField(field)
    setEditName(field.name)
    setEditType(field.type)

    // Convert object key-values to array for editing UI
    const pairsArray = Object.entries(field.keyValues).map(([key, value]) => ({ key, value }))
    setEditKeyValuePairs(pairsArray)
    setEditNewKey("")
    setEditNewValue("")
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingField(null)
    setEditName("")
    setEditType("")
    setEditKeyValuePairs([])
    setEditNewKey("")
    setEditNewValue("")
  }

  // Save field edits
  const saveFieldEdit = async () => {
    if (!editingField || !editName.trim() || editKeyValuePairs.length === 0) {
      toast.error("Please provide a field name and at least one key-value pair")
      return
    }

    try {
      // Convert array of key-value pairs to object format
      const keyValuesObject: Record<string, any> = {}
      editKeyValuePairs.forEach((pair) => {
        keyValuesObject[pair.key] = pair.value
      })

      const updated = await editFilter(editingField.id, editName, keyValuesObject, editType)

      // Update local state
      setFields((prev) => {
        const productFields = prev[editingField.productId] || []
        const updatedFields = productFields.map((f) => (f.id === editingField.id ? updated : f))

        return {
          ...prev,
          [editingField.productId]: updatedFields,
        }
      })

      cancelEdit()
      toast.success("Field updated successfully")
    } catch (err: any) {
      toast.error("Failed to update field")
      console.error(err)
    }
  }

  // Delete a field
  const handleDeleteField = async (fieldId: number, productId: number) => {
    try {
      await deleteFilter(fieldId)

      // Update local state
      setFields((prev) => {
        const productFields = prev[productId] || []
        return {
          ...prev,
          [productId]: productFields.filter((f) => f.id !== fieldId),
        }
      })

      toast.success("Field deleted successfully")
    } catch (err: any) {
      toast.error("Failed to delete field")
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
                <CardDescription>Add a field with key-value pairs to all selected products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="field-name">Field Name</Label>
                    <Input
                      id="field-name"
                      placeholder="e.g. Toppings, Size, Color"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      disabled={selectedProducts.length === 0}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Name of the field (e.g., "Toppings")</p>
                  </div>

                  <div>
                    <Label htmlFor="field-type">Field Type</Label>
                    <Input
                      id="field-type"
                      placeholder="e.g. Cost, Length, Weight"
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value)}
                      disabled={selectedProducts.length === 0}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Categorizes this field (e.g., "Cost", "Size", "Weight")
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Key-Value Pairs</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Key (e.g. cheese)"
                        value={newKey}
                        onChange={(e) => setNewKey(e.target.value)}
                        disabled={selectedProducts.length === 0}
                      />
                      <Input
                        placeholder="Value (e.g. 30)"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        disabled={selectedProducts.length === 0}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full"
                      onClick={addKeyValuePair}
                      disabled={selectedProducts.length === 0 || !newKey.trim()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Key-Value Pair
                    </Button>

                    {keyValuePairs.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Added Key-Value Pairs:</h4>
                        <div className="space-y-2">
                          {keyValuePairs.map((pair, index) => (
                            <div key={index} className="flex items-center justify-between border rounded-md p-2">
                              <span>
                                <span className="font-medium">{pair.key}</span>: {pair.value}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => removeKeyValuePair(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleAddField}
                    disabled={selectedProducts.length === 0 || !newFieldName.trim() || keyValuePairs.length === 0}
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
                {!fields[selectedProducts[0]] ? (
                  <div className="text-center py-4">Loading fields...</div>
                ) : fields[selectedProducts[0]].length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No fields added yet.</p>
                ) : (
                  <div className="space-y-4">
                    {fields[selectedProducts[0]].map((field) => (
                      <div key={field.id} className="border rounded-lg p-4">
                        {editingField?.id === field.id ? (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor={`edit-name-${field.id}`}>Field Name</Label>
                              <Input
                                id={`edit-name-${field.id}`}
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                              />
                            </div>

                            <div>
                              <Label htmlFor={`edit-type-${field.id}`}>Field Type</Label>
                              <Input
                                id={`edit-type-${field.id}`}
                                value={editType}
                                onChange={(e) => setEditType(e.target.value)}
                                placeholder="e.g. Cost, Length, Weight"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Key-Value Pairs</Label>
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  placeholder="Key (e.g. cheese)"
                                  value={editNewKey}
                                  onChange={(e) => setEditNewKey(e.target.value)}
                                />
                                <Input
                                  placeholder="Value (e.g. 30)"
                                  value={editNewValue}
                                  onChange={(e) => setEditNewValue(e.target.value)}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="secondary"
                                className="w-full"
                                onClick={addEditKeyValuePair}
                                disabled={!editNewKey.trim()}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Key-Value Pair
                              </Button>

                              {editKeyValuePairs.length > 0 && (
                                <div className="mt-4">
                                  <h4 className="text-sm font-medium mb-2">Key-Value Pairs:</h4>
                                  <div className="space-y-2">
                                    {editKeyValuePairs.map((pair, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between border rounded-md p-2"
                                      >
                                        <span>
                                          <span className="font-medium">{pair.key}</span>: {pair.value}
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() => removeEditKeyValuePair(index)}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <Button onClick={saveFieldEdit} className="flex-1">
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
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium text-lg">{field.name}</h3>
                                <Badge variant="secondary" className="mt-1">
                                  Type: {field.type || "default"}
                                </Badge>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={() => startEditField(field)}>
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteField(field.id, selectedProducts[0])}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>

                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2">Key-Value Pairs:</h4>
                              <div className="grid gap-2">
                                {Object.entries(field.keyValues).map(([key, value], index) => (
                                  <div key={index} className="flex justify-between items-center border rounded-md p-2">
                                    <span className="font-medium">{key}</span>
                                    <span>{value}</span>
                                  </div>
                                ))}
                              </div>
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
                      if (!fields[productId]) {
                        await fetchFields(productId)
                      }
                      // Set as selected product to show its fields
                      setSelectedProducts([productId])
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

                {selectedProducts.length > 0 && fields[selectedProducts[0]]?.length > 0 && (
                  <div className="border rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">
                      {products.find((p) => p.id === selectedProducts[0])?.name}
                    </h2>

                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Display fields */}
                      {fields[selectedProducts[0]].map((field) => (
                        <div key={field.id}>
                          <Label htmlFor={`preview-${field.id}`}>{field.name}</Label>
                          <Select>
                            <SelectTrigger id={`preview-${field.id}`}>
                              <SelectValue placeholder={`Select ${field.name}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(field.keyValues).map(([key, value], index) => (
                                <SelectItem key={`${field.id}-${index}`} value={key}>
                                  {key} {field.type === "Cost" && value ? `(+${value})` : value ? `(${value})` : ""}
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

