import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAdminMutation } from '@/hooks/use-admin-mutation'
import {
  patchById,
  removeById,
  snapshotList,
} from '@/lib/admin/optimistic-list'
import {
  createCategory,
  deleteCategory,
  fetchAllCategoriesAdmin,
  updateCategory,
  type CategoryInput,
} from '@/lib/database/queries/categories'
import {
  createProduct,
  deleteProduct,
  fetchAllProductsAdmin,
  updateProduct,
  type ProductInput,
} from '@/lib/database/queries/products'
import type { CategoryRow, ProductWithCategory } from '@/types/database'

export function useAdminProducts() {
  const { isAdmin, loading: authLoading } = useAuth()
  const [products, setProducts] = useState<ProductWithCategory[]>([])
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const { saving, error, setError, runMutation } = useAdminMutation()

  const refetch = useCallback(async () => {
    if (authLoading || !isAdmin) {
      if (!authLoading) setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const [pRes, cRes] = await Promise.all([
      fetchAllProductsAdmin(),
      fetchAllCategoriesAdmin(),
    ])
    setProducts(pRes.data)
    setCategories(cRes.data)
    if (pRes.error ?? cRes.error) setError(pRes.error ?? cRes.error ?? null)
    setLoading(false)
  }, [isAdmin, authLoading, setError])

  useEffect(() => {
    void refetch()
  }, [refetch])

  const createProductMutation = (input: ProductInput) =>
    runMutation(async () => {
      const r = await createProduct(input)
      if (r.error || !r.data) throw new Error(r.error ?? 'Creare eșuată')
      setProducts((prev) => [r.data!, ...prev])
    })

  const updateProductMutation = (id: string, input: Partial<ProductInput>) => {
    const prevProducts = snapshotList(products)
    const nextCategory =
      input.category_id !== undefined
        ? categories.find((c) => c.id === input.category_id) ?? null
        : undefined
    return runMutation(
      async () => {
        const r = await updateProduct(id, input)
        if (r.error || !r.data) throw new Error(r.error ?? 'Actualizare eșuată')
        setProducts((prev) => patchById(prev, id, r.data!))
      },
      {
        apply: () => {
          setProducts((prev) =>
            prev.map((p) => {
              if (p.id !== id) return p
              return {
                ...p,
                ...input,
                ...(nextCategory !== undefined
                  ? {
                      categories: nextCategory
                        ? {
                            id: nextCategory.id,
                            name: nextCategory.name,
                            slug: nextCategory.slug,
                          }
                        : null,
                    }
                  : {}),
              }
            }),
          )
        },
        rollback: () => setProducts(prevProducts),
      },
    )
  }

  const deleteProductMutation = (id: string) => {
    const prevProducts = snapshotList(products)
    return runMutation(
      async () => {
        const r = await deleteProduct(id)
        if (r.error || !r.data) throw new Error(r.error ?? 'Ștergere eșuată')
      },
      {
        apply: () => setProducts((prev) => removeById(prev, id)),
        rollback: () => setProducts(prevProducts),
      },
    )
  }

  const createCategoryMutation = (input: CategoryInput) =>
    runMutation(async () => {
      const r = await createCategory(input)
      if (r.error || !r.data) throw new Error(r.error ?? 'Creare eșuată')
      setCategories((prev) => [...prev, r.data!].sort((a, b) => a.sort_order - b.sort_order))
    })

  const updateCategoryMutation = (id: string, input: Partial<CategoryInput>) => {
    const prevCategories = snapshotList(categories)
    const prevProducts = snapshotList(products)
    return runMutation(
      async () => {
        const r = await updateCategory(id, input)
        if (r.error || !r.data) throw new Error(r.error ?? 'Actualizare eșuată')
        setCategories((prev) => patchById(prev, id, r.data!))
        if (input.name) {
          setProducts((prev) =>
            prev.map((p) =>
              p.category_id === id
                ? {
                    ...p,
                    categories: {
                      id,
                      name: r.data!.name,
                      slug: r.data!.slug,
                    },
                  }
                : p,
            ),
          )
        }
      },
      {
        apply: () => {
          setCategories((prev) => patchById<CategoryRow>(prev, id, input))
          if (input.name) {
            setProducts((prev) =>
              prev.map((p) =>
                p.category_id === id && p.categories
                  ? { ...p, categories: { ...p.categories, name: input.name! } }
                  : p,
              ),
            )
          }
        },
        rollback: () => {
          setCategories(prevCategories)
          setProducts(prevProducts)
        },
      },
    )
  }

  const deleteCategoryMutation = (id: string) => {
    const prevCategories = snapshotList(categories)
    return runMutation(
      async () => {
        const r = await deleteCategory(id)
        if (r.error || !r.data) throw new Error(r.error ?? 'Ștergere eșuată')
      },
      {
        apply: () => setCategories((prev) => removeById(prev, id)),
        rollback: () => setCategories(prevCategories),
      },
    )
  }

  return {
    products,
    categories,
    loading,
    saving,
    error,
    refetch,
    createProduct: createProductMutation,
    updateProduct: updateProductMutation,
    deleteProduct: deleteProductMutation,
    createCategory: createCategoryMutation,
    updateCategory: updateCategoryMutation,
    deleteCategory: deleteCategoryMutation,
  }
}
