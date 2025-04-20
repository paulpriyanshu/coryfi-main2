"use client"

import { useEffect, useState } from "react"
import { Check, Plus, Save, Search, Trash2, X } from "lucide-react"
import { toast } from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  getAllProducts,
  getFiltersByProduct,
  addFilter,
  editFilter,
  deleteFilter,
  addCounter,
  editCounter,
  deleteCounter,
  getCountersByProductId,
} from "@/app/api/business/products"

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
  showCost?: boolean // Add this property
}

type Counter = {
  id: number
  name: string
  keyValues: Record<string, number | string> // JSON object storing key-value pairs
  type: string // Type of the counter (e.g., "Quantity")
  description?: string
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

  // State for counters
  const [counters, setCounters] = useState<Record<number, Counter[]>>({})

  // State for new field form
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [newFieldName, setNewFieldName] = useState("")
  const [newFieldType, setNewFieldType] = useState("")
  const [showCost, setShowCost] = useState(false)

  // State for key-value pairs
  const [keyValuePairs, setKeyValuePairs] = useState<Array<{ key: string; value: string | number }>>([])
  const [newKey, setNewKey] = useState("")
  const [newValue, setNewValue] = useState("")

  // State for editing field
  const [editingField, setEditingField] = useState<Field | null>(null)
  const [editName, setEditName] = useState("")
  const [editType, setEditType] = useState("")
  const [editShowCost, setEditShowCost] = useState(false)
  const [editKeyValuePairs, setEditKeyValuePairs] = useState<Array<{ key: string; value: string | number }>>([])
  const [editNewKey, setEditNewKey] = useState("")
  const [editNewValue, setEditNewValue] = useState("")

  // State for new counter form
  const [newCounterName, setNewCounterName] = useState("")
  const [newCounterType, setNewCounterType] = useState("Quantity")
  const [newCounterDescription, setNewCounterDescription] = useState("")

  // State for counter key-value pairs
  const [counterKeyValuePairs, setCounterKeyValuePairs] = useState<
    Array<{ key: string; value: number; cost?: number }>
  >([])
  const [newCounterKey, setNewCounterKey] = useState("")
  const [newCounterValue, setNewCounterValue] = useState<number>(1)
  const [newCounterCost, setNewCounterCost] = useState<string>("")

  // State for editing counter
  const [editingCounter, setEditingCounter] = useState<Counter | null>(null)
  const [editCounterName, setEditCounterName] = useState("")
  const [editCounterType, setEditCounterType] = useState("")
  const [editCounterDescription, setEditCounterDescription] = useState("")
  const [editCounterKeyValuePairs, setEditCounterKeyValuePairs] = useState<
    Array<{ key: string; value: number; cost?: number }>
  >([])
  const [editCounterNewKey, setEditCounterNewKey] = useState("")
  const [editCounterNewValue, setEditCounterNewValue] = useState<number>(1)
  const [editCounterNewCost, setEditCounterNewCost] = useState<string>("")

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

  // Fetch counters for a product
  const fetchCounters = async (productId: number) => {
    try {
      const data = await getCountersByProductId(productId)
      setCounters((prev) => ({
        ...prev,
        [productId]: data,
      }))
      return data
    } catch (err: any) {
      console.error("Error fetching counters:", err)
      setCounters((prev) => ({
        ...prev,
        [productId]: [],
      }))
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

      // If we haven't loaded counters for this product yet, fetch them
      if (!counters[id]) {
        await fetchCounters(id)
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

  // Add a new counter key-value pair to the form
  const addCounterKeyValuePair = () => {
    if (!newCounterKey.trim()) {
      toast.error("Please enter a key")
      return
    }

    const valueAsNumber = Number(newCounterValue)
    if (isNaN(valueAsNumber)) {
      toast.error("Counter value must be a number")
      return
    }

    const costAsNumber = newCounterCost ? Number(newCounterCost) : undefined

    setCounterKeyValuePairs([
      ...counterKeyValuePairs,
      {
        key: newCounterKey,
        value: valueAsNumber,
        cost: costAsNumber,
      },
    ])
    setNewCounterKey("")
    setNewCounterValue(1)
    setNewCounterCost("")
  }

  // Remove a counter key-value pair from the form
  const removeCounterKeyValuePair = (index: number) => {
    setCounterKeyValuePairs(counterKeyValuePairs.filter((_, i) => i !== index))
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
          const newField = await addFilter(
            productId,
            newFieldName,
            keyValuesObject,
            showCost,
            newFieldType || "default",
          )

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
      setShowCost(false)

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast)
      toast.success(`Field added to ${selectedProducts.length} product(s) successfully`)
    } catch (err: any) {
      toast.error("Failed to add field")
      console.error(err)
    }
  }

  // Add a new counter
  const handleAddCounter = async () => {
    if (selectedProducts.length === 0 || !newCounterName.trim() || counterKeyValuePairs.length === 0) {
      toast.error("Please select at least one product, provide a counter name, and add at least one key-value pair")
      return
    }

    try {
      // Convert array of key-value pairs to object format
      const keyValuesObject: Record<string, any> = {}
      counterKeyValuePairs.forEach((pair) => {
        if (pair.cost !== undefined) {
          keyValuesObject[pair.key] = { value: pair.value, cost: pair.cost }
        } else {
          keyValuesObject[pair.key] = pair.value
        }
      })

      // Show loading toast
      const loadingToast = toast.loading(`Adding counter to ${selectedProducts.length} product(s)...`)

      // Add counter to each selected product
      const results = await Promise.all(
        selectedProducts.map(async (productId) => {
          const newCounter = await addCounter(
            productId,
            newCounterName,
            keyValuesObject,
            newCounterType || "Quantity",
            newCounterDescription || undefined,
          )

          // Update local state
          setCounters((prev) => ({
            ...prev,
            [productId]: [...(prev[productId] || []), newCounter],
          }))

          return newCounter
        }),
      )

      // Reset form
      setNewCounterName("")
      setNewCounterType("Quantity")
      setNewCounterDescription("")
      setCounterKeyValuePairs([])
      setNewCounterKey("")
      setNewCounterValue(1)
      setNewCounterCost("")

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast)
      toast.success(`Counter added to ${selectedProducts.length} product(s) successfully`)
    } catch (err: any) {
      toast.error("Failed to add counter")
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

  // Add a key-value pair to the counter edit form
  const addEditCounterKeyValuePair = () => {
    if (!editCounterNewKey.trim()) {
      toast.error("Please enter a key")
      return
    }

    const valueAsNumber = Number(editCounterNewValue)
    if (isNaN(valueAsNumber)) {
      toast.error("Counter value must be a number")
      return
    }

    const costAsNumber = editCounterNewCost ? Number(editCounterNewCost) : undefined

    setEditCounterKeyValuePairs([
      ...editCounterKeyValuePairs,
      {
        key: editCounterNewKey,
        value: valueAsNumber,
        cost: costAsNumber,
      },
    ])
    setEditCounterNewKey("")
    setEditCounterNewValue(1)
    setEditCounterNewCost("")
  }

  // Remove a key-value pair from the counter edit form
  const removeEditCounterKeyValuePair = (index: number) => {
    setEditCounterKeyValuePairs(editCounterKeyValuePairs.filter((_, i) => i !== index))
  }

  // Start editing a field
  const startEditField = (field: Field) => {
    setEditingField(field)
    setEditName(field.name)
    setEditType(field.type)
    setEditShowCost(field.showCost || false)

    // Convert object key-values to array for editing UI
    const pairsArray = Object.entries(field.keyValues).map(([key, value]) => ({ key, value }))
    setEditKeyValuePairs(pairsArray)
    setEditNewKey("")
    setEditNewValue("")
  }

  // Start editing a counter
  const startEditCounter = (counter: Counter) => {
    setEditingCounter(counter)
    setEditCounterName(counter.name)
    setEditCounterType(counter.type)
    setEditCounterDescription(counter.description || "")

    // Convert object key-values to array for editing UI
    const pairsArray = Object.entries(counter.keyValues).map(([key, value]) => {
      // Check if the value is an object with a cost property
      if (typeof value === "object" && value !== null && "value" in value) {
        return {
          key,
          value: Number(value.value),
          cost: "cost" in value ? Number(value.cost) : undefined,
        }
      }
      return { key, value: Number(value) }
    })
    setEditCounterKeyValuePairs(pairsArray)
    setEditCounterNewKey("")
    setEditCounterNewValue(1)
    setEditCounterNewCost("")
  }

  // Cancel editing field
  const cancelEdit = () => {
    setEditingField(null)
    setEditName("")
    setEditType("")
    setEditShowCost(false)
    setEditKeyValuePairs([])
    setEditNewKey("")
    setEditNewValue("")
  }

  // Cancel editing counter
  const cancelEditCounter = () => {
    setEditingCounter(null)
    setEditCounterName("")
    setEditCounterType("")
    setEditCounterDescription("")
    setEditCounterKeyValuePairs([])
    setEditCounterNewKey("")
    setEditCounterNewValue(1)
    setEditCounterNewCost("")
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

      const updated = await editFilter(editingField.id, editName, keyValuesObject, editShowCost, editType)

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

  // Save counter edits
  const saveCounterEdit = async () => {
    if (!editingCounter || !editCounterName.trim() || editCounterKeyValuePairs.length === 0) {
      toast.error("Please provide a counter name and at least one key-value pair")
      return
    }

    try {
      // Convert array of key-value pairs to object format
      const keyValuesObject: Record<string, any> = {}
      editCounterKeyValuePairs.forEach((pair) => {
        if (pair.cost !== undefined) {
          keyValuesObject[pair.key] = { value: pair.value, cost: pair.cost }
        } else {
          keyValuesObject[pair.key] = pair.value
        }
      })

      const updated = await editCounter(
        editingCounter.id,
        editCounterName,
        keyValuesObject,
        editCounterType,
        editCounterDescription || undefined,
      )

      // Update local state
      setCounters((prev) => {
        const productCounters = prev[editingCounter.productId] || []
        const updatedCounters = productCounters.map((c) => (c.id === editingCounter.id ? updated : c))

        return {
          ...prev,
          [editingCounter.productId]: updatedCounters,
        }
      })

      cancelEditCounter()
      toast.success("Counter updated successfully")
    } catch (err: any) {
      toast.error("Failed to update counter")
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

  // Delete a counter
  const handleDeleteCounter = async (counterId: number, productId: number) => {
    try {
      await deleteCounter(counterId)

      // Update local state
      setCounters((prev) => {
        const productCounters = prev[productId] || []
        return {
          ...prev,
          [productId]: productCounters.filter((c) => c.id !== counterId),
        }
      })

      toast.success("Counter deleted successfully")
    } catch (err: any) {
      toast.error("Failed to delete counter")
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
          <TabsTrigger value="counters">Manage Counters</TabsTrigger>
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

                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="show-cost"
                      checked={showCost}
                      onCheckedChange={setShowCost}
                      disabled={selectedProducts.length === 0}
                    />
                    <Label htmlFor="show-cost" className="cursor-pointer">
                      Show Cost
                    </Label>
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

                            <div className="flex items-center space-x-2 mt-2">
                              <Checkbox
                                id={`edit-show-cost-${field.id}`}
                                checked={editShowCost}
                                onCheckedChange={setEditShowCost}
                              />
                              <Label htmlFor={`edit-show-cost-${field.id}`} className="cursor-pointer">
                                Show Cost
                              </Label>
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

        {/* Counters Management Tab */}
        <TabsContent value="counters">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Product Selection (reused from Fields tab) */}
            <Card>
              <CardHeader>
                <CardTitle>Select Products</CardTitle>
                <CardDescription>Choose one or more products to manage counters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Product Search and Dropdown */}
                  <div className="space-y-2">
                    <Label htmlFor="counter-product-search">Search & Select Products</Label>
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
                      <Label htmlFor="counter-product-list-search">Quick Search</Label>
                      <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="counter-product-list-search"
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

            {/* Create New Counter */}
            <Card>
              <CardHeader>
                <CardTitle>Add New Counter to Selected Products</CardTitle>
                <CardDescription>Add a counter with key-value pairs to all selected products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="counter-name">Counter Name</Label>
                    <Input
                      id="counter-name"
                      placeholder="e.g. Bread, Extra Toppings"
                      value={newCounterName}
                      onChange={(e) => setNewCounterName(e.target.value)}
                      disabled={selectedProducts.length === 0}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Name of the counter (e.g., "Bread")</p>
                  </div>

                  <div>
                    <Label htmlFor="counter-type">Counter Type</Label>
                    <Input
                      id="counter-type"
                      placeholder="e.g. Quantity, Portions"
                      value={newCounterType}
                      onChange={(e) => setNewCounterType(e.target.value)}
                      disabled={selectedProducts.length === 0}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Categorizes this counter (default is "Quantity")
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="counter-description">Description (Optional)</Label>
                    <Input
                      id="counter-description"
                      placeholder="e.g. Add extra bread to your order"
                      value={newCounterDescription}
                      onChange={(e) => setNewCounterDescription(e.target.value)}
                      disabled={selectedProducts.length === 0}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Counter Items</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Item name (e.g. Bread)"
                        value={newCounterKey}
                        onChange={(e) => setNewCounterKey(e.target.value)}
                        disabled={selectedProducts.length === 0}
                      />
                      <Input
                        type="number"
                        placeholder="Default value (e.g. 1)"
                        value={newCounterValue}
                        onChange={(e) => setNewCounterValue(Number(e.target.value))}
                        min={0}
                        disabled={selectedProducts.length === 0}
                      />
                      <Input
                        type="number"
                        placeholder="Cost (optional)"
                        value={newCounterCost}
                        onChange={(e) => setNewCounterCost(e.target.value)}
                        min={0}
                        disabled={selectedProducts.length === 0}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full"
                      onClick={addCounterKeyValuePair}
                      disabled={selectedProducts.length === 0 || !newCounterKey.trim()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Counter Item
                    </Button>

                    {counterKeyValuePairs.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Added Counter Items:</h4>
                        <div className="space-y-2">
                          {counterKeyValuePairs.map((pair, index) => (
                            <div key={index} className="flex items-center justify-between border rounded-md p-2">
                              <span>
                                <span className="font-medium">{pair.key}</span>: {pair.value}
                                {pair.cost !== undefined && (
                                  <span className="ml-2 text-muted-foreground">(Cost: {pair.cost})</span>
                                )}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => removeCounterKeyValuePair(index)}
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
                    onClick={handleAddCounter}
                    disabled={
                      selectedProducts.length === 0 || !newCounterName.trim() || counterKeyValuePairs.length === 0
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Counter to Selected Products
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Counters */}
          {selectedProducts.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>
                  Current Counters for {products.find((p) => p.id === selectedProducts[0])?.name}
                  {selectedProducts.length > 1 && ` (+ ${selectedProducts.length - 1} more)`}
                </CardTitle>
                <CardDescription>
                  {selectedProducts.length === 1
                    ? "Manage existing counters for this product"
                    : "Showing counters for the first selected product"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!counters[selectedProducts[0]] ? (
                  <div className="text-center py-4">Loading counters...</div>
                ) : counters[selectedProducts[0]].length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No counters added yet.</p>
                ) : (
                  <div className="space-y-4">
                    {counters[selectedProducts[0]].map((counter) => (
                      <div key={counter.id} className="border rounded-lg p-4">
                        {editingCounter?.id === counter.id ? (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor={`edit-counter-name-${counter.id}`}>Counter Name</Label>
                              <Input
                                id={`edit-counter-name-${counter.id}`}
                                value={editCounterName}
                                onChange={(e) => setEditCounterName(e.target.value)}
                              />
                            </div>

                            <div>
                              <Label htmlFor={`edit-counter-type-${counter.id}`}>Counter Type</Label>
                              <Input
                                id={`edit-counter-type-${counter.id}`}
                                value={editCounterType}
                                onChange={(e) => setEditCounterType(e.target.value)}
                                placeholder="e.g. Quantity, Portions"
                              />
                            </div>

                            <div>
                              <Label htmlFor={`edit-counter-description-${counter.id}`}>Description (Optional)</Label>
                              <Input
                                id={`edit-counter-description-${counter.id}`}
                                value={editCounterDescription}
                                onChange={(e) => setEditCounterDescription(e.target.value)}
                                placeholder="e.g. Add extra bread to your order"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Counter Items</Label>
                              <div className="grid grid-cols-3 gap-2">
                                <Input
                                  placeholder="Item name (e.g. Bread)"
                                  value={editCounterNewKey}
                                  onChange={(e) => setEditCounterNewKey(e.target.value)}
                                />
                                <Input
                                  type="number"
                                  placeholder="Default value (e.g. 1)"
                                  value={editCounterNewValue}
                                  onChange={(e) => setEditCounterNewValue(Number(e.target.value))}
                                  min={0}
                                />
                                <Input
                                  type="number"
                                  placeholder="Cost (optional)"
                                  value={editCounterNewCost}
                                  onChange={(e) => setEditCounterNewCost(e.target.value)}
                                  min={0}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="secondary"
                                className="w-full"
                                onClick={addEditCounterKeyValuePair}
                                disabled={!editCounterNewKey.trim()}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Counter Item
                              </Button>

                              {editCounterKeyValuePairs.length > 0 && (
                                <div className="mt-4">
                                  <h4 className="text-sm font-medium mb-2">Counter Items:</h4>
                                  <div className="space-y-2">
                                    {editCounterKeyValuePairs.map((pair, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between border rounded-md p-2"
                                      >
                                        <span>
                                          <span className="font-medium">{pair.key}</span>: {pair.value}
                                          {pair.cost !== undefined && (
                                            <span className="ml-2 text-muted-foreground">(Cost: {pair.cost})</span>
                                          )}
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() => removeEditCounterKeyValuePair(index)}
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
                              <Button onClick={saveCounterEdit} className="flex-1">
                                <Save className="mr-2 h-4 w-4" />
                                Save
                              </Button>
                              <Button variant="outline" onClick={cancelEditCounter} className="flex-1">
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium text-lg">{counter.name}</h3>
                                <Badge variant="secondary" className="mt-1">
                                  Type: {counter.type || "Quantity"}
                                </Badge>
                                {counter.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{counter.description}</p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={() => startEditCounter(counter)}>
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteCounter(counter.id, selectedProducts[0])}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>

                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2">Counter Items:</h4>
                              <div className="grid gap-2">
                                {Object.entries(counter.keyValues).map(([key, value], index) => (
                                  <div key={index} className="flex justify-between items-center border rounded-md p-2">
                                    <span className="font-medium">{key}</span>
                                    <div>
                                      {typeof value === "object" && value !== null ? (
                                        <span>
                                          {value.value}
                                          {value.cost !== undefined && (
                                            <span className="ml-2 text-muted-foreground">(Cost: {value.cost})</span>
                                          )}
                                        </span>
                                      ) : (
                                        <span>{value}</span>
                                      )}
                                    </div>
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
      </Tabs>
    </div>
  )
}

