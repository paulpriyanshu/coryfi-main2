"use client"
import { useState } from "react";
import { Edit, Trash2, Package, Plus, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const products = [
  {
    id: 1,
    name: "Premium Cotton T-Shirt",
    price: "$29.99",
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=60",
    variants: [
      { id: 1, color: "Crimson Red", size: "M", sku: "TSH-RED-M", stock: 45 },
      { id: 2, color: "Navy Blue", size: "L", sku: "TSH-BLU-L", stock: 32 },
      { id: 3, color: "Charcoal Grey", size: "XL", sku: "TSH-GRY-XL", stock: 28 },
    ],
  },
  {
    id: 2,
    name: "Slim Fit Denim Jeans",
    price: "$59.99",
    status: "Low Stock",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=60",
    variants: [
      { id: 1, color: "Vintage Black", size: "32", sku: "JNS-BLK-32", stock: 12 },
      { id: 2, color: "Stone Wash", size: "34", sku: "JNS-STN-34", stock: 8 },
      { id: 3, color: "Dark Indigo", size: "36", sku: "JNS-IND-36", stock: 15 },
    ],
  },
  {
    id: 3,
    name: "Classic Oxford Shirt",
    price: "$45.99",
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=60",
    variants: [
      { id: 1, color: "Crisp White", size: "M", sku: "OXF-WHT-M", stock: 55 },
      { id: 2, color: "Sky Blue", size: "L", sku: "OXF-BLU-L", stock: 42 },
      { id: 3, color: "Light Pink", size: "XL", sku: "OXF-PNK-XL", stock: 38 },
    ],
  }
];

export default function ProductsTable() {
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in stock':
        return 'bg-green-100 text-green-800';
      case 'low stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out of stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedProductData = products.find(p => p.id === selectedProduct);

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Product Management</h2>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Product
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Products List - Left Side */}
        <Card className="col-span-5 bg-white">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">Products</h3>
          </div>
          <ScrollArea className="h-[calc(100vh-240px)]">
            <div className="divide-y">
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedProduct === product.id
                      ? 'bg-gray-50 border-l-4 border-indigo-500'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedProduct(product.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </h4>
                        <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${
                          selectedProduct === product.id ? 'transform rotate-90' : ''
                        }`} />
                      </div>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{product.price}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                          {product.status}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {product.variants.length} variants
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Variants Panel - Right Side */}
        <Card className="col-span-7 bg-white">
          {selectedProductData ? (
            <>
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedProductData.name} - Variants
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Manage product variants and inventory
                    </p>
                  </div>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variant
                  </Button>
                </div>
              </div>
              <ScrollArea className="h-[calc(100vh-240px)]">
                <div className="p-4 grid gap-4">
                  {selectedProductData.variants.map((variant) => (
                    <Card key={variant.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-2 h-12 rounded-full bg-indigo-500 opacity-75" />
                          <div>
                            <Badge variant="outline" className="mb-2">
                              {variant.sku}
                            </Badge>
                            <h4 className="text-sm font-medium text-gray-900">
                              {variant.color} - Size {variant.size}
                            </h4>
                            <div className="flex items-center mt-1 space-x-2">
                              <Badge variant={variant.stock > 20 ? "success" : "destructive"}>
                                Stock: {variant.stock}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="h-[calc(100vh-240px)] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a product to view its variants</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}