import Image from "next/image"

export function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <div key={product.id} className="group relative aspect-square rounded-lg overflow-hidden bg-muted">
          <Image
            src={`/placeholder.svg?height=300&width=300&text=Product ${product.id}`}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
            <div className="p-4 w-full text-white">
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-white/80">${product.price.toFixed(2)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

