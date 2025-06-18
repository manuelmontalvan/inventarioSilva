'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue,
} from '@/components/ui/select'
import { addToast } from '@heroui/toast'
import { Combobox } from '@/components/ui/combobox'

export default function NewPurchasePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    productId: '',
    supplierId: '',
    registeredById: '', // puedes obtenerlo del contexto de auth
    invoice_number: '',
    quantity: '',
    unit_cost: '',
    total_cost: '',
    purchase_date: '',
    notes: '',
  })

  const [products, setProducts] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const [prodRes, suppRes] = await Promise.all([
        fetch('/api/products', { credentials: 'include' }),
        fetch('/api/suppliers', { credentials: 'include' }),
      ])
      const products = await prodRes.json()
      const suppliers = await suppRes.json()
      setProducts(products)
      setSuppliers(suppliers)
    }

    fetchData()
  }, [])

  useEffect(() => {
    const quantity = parseFloat(form.quantity)
    const unit_cost = parseFloat(form.unit_cost)
    if (!isNaN(quantity) && !isNaN(unit_cost)) {
      setForm((prev) => ({
        ...prev,
        total_cost: (quantity * unit_cost).toFixed(2),
      }))
    }
  }, [form.quantity, form.unit_cost])

  const handleChange = (e: any) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('Error al registrar compra')

      addToast({
        title: 'Compra registrada correctamente',
        description: 'La compra se ha registrado exitosamente.',
        color: 'success',
      })

      router.push('/dashboard/purchases')
    } catch (err) {
      console.error(err)
      addToast({
        title: 'Error al registrar compra',
        description:
          'Hubo un problema al registrar la compra. Por favor, inténtalo de nuevo.',
        color: 'danger',
      })
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Ingreso de Producto</h1>
      <form onSubmit={handleSubmit} className="grid gap-4">
        {/* Combobox de productos con búsqueda por nombre, marca o categoría */}
        <Combobox
          items={products}
          selected={products.find((p) => p.id === form.productId) || null}
          onChange={(product) =>
            setForm({ ...form, productId: product.id })
          }
          displayValue={(product) =>
            `${product.name} (${product.brand?.name || 'Sin marca'} / ${
              product.category?.name || 'Sin categoría'
            })`
          }
          placeholder="Buscar producto por nombre, marca o categoría"
        />

        {/* Select de proveedores */}
        <Select
          onValueChange={(value) => setForm({ ...form, supplierId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar proveedor" />
          </SelectTrigger>
          <SelectContent>
            {suppliers.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id}>
                {supplier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          name="invoice_number"
          placeholder="Número de factura"
          value={form.invoice_number}
          onChange={handleChange}
        />
        <Input
          name="quantity"
          type="number"
          placeholder="Cantidad"
          value={form.quantity}
          onChange={handleChange}
        />
        <Input
          name="unit_cost"
          type="number"
          placeholder="Costo unitario"
          value={form.unit_cost}
          onChange={handleChange}
        />
        <Input
          name="total_cost"
          type="number"
          value={form.total_cost}
          disabled
        />
        <Input
          name="purchase_date"
          type="date"
          value={form.purchase_date}
          onChange={handleChange}
        />
        <Textarea
          name="notes"
          placeholder="Notas (opcional)"
          value={form.notes}
          onChange={handleChange}
        />

        <Button type="submit" className="w-full">
          Registrar Compra
        </Button>
      </form>
    </div>
  )
}
