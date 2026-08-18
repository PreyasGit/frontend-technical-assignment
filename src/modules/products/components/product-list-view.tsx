"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, PackageSearch, Pencil, Plus, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PageHeader } from "@/components/common/page-header";
import { Pagination } from "@/components/common/pagination";
import { SearchInput } from "@/components/common/search-input";
import { SourceBadge } from "@/components/common/source-badge";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useListParams, withReturnState } from "@/hooks/use-list-params";
import { cn, formatCurrency, toTitleCase } from "@/lib/utils";

import { useDeleteProduct } from "../hooks/use-product-mutations";
import { useProductCategories, useProducts } from "../hooks/use-products";
import type { Product } from "../types/product.types";

/**
 * Product listing screen.
 *
 * Search, sorting and pagination are performed by the API and mirrored in the
 * URL, so the exact view can be restored when the user returns from a details
 * or edit screen.
 */
export function ProductListView() {
  const listParams = useListParams({ defaultSortBy: "title", defaultOrder: "asc" });
  const category = listParams.getFilter("category");

  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const { data, isLoading, isFetching, isError, error, refetch } = useProducts({
    page: listParams.page,
    limit: listParams.limit,
    search: listParams.search,
    sortBy: listParams.sortBy,
    order: listParams.order,
    category,
  });

  const { data: categories } = useProductCategories();

  const deleteMutation = useDeleteProduct(() => setProductToDelete(null));

  const products = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasFilters = Boolean(listParams.search || category);

  /** Detail and edit links carry the current listing state in `?from=`. */
  const detailHref = (id: number) =>
    withReturnState(`/products/${id}`, listParams.queryString);
  const editHref = (id: number) =>
    withReturnState(`/products/${id}/edit`, listParams.queryString);

  const columns: DataTableColumn<Product>[] = [
    {
      key: "thumbnail",
      header: "Image",
      className: "w-16",
      cell: (product) => (
        <div className="relative size-10 overflow-hidden rounded-md border border-border bg-muted">
          <Image
            src={product.thumbnail}
            alt=""
            fill
            sizes="40px"
            className="object-contain"
          />
        </div>
      ),
    },
    {
      key: "title",
      header: "Title",
      sortable: true,
      cell: (product) => (
        <div className="flex items-center gap-2">
          <Link
            href={detailHref(product.id)}
            className="font-medium text-foreground transition-colors hover:text-primary"
          >
            {product.title}
          </Link>
          <SourceBadge source={product.source} />
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      hideOnMobile: true,
      cell: (product) => (
        <Badge variant="secondary">{toTitleCase(product.category)}</Badge>
      ),
    },
    {
      key: "price",
      header: "Price",
      sortable: true,
      className: "text-right",
      cell: (product) => (
        <span className="font-medium tabular-nums">
          {formatCurrency(product.price)}
        </span>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      sortable: true,
      hideOnMobile: true,
      className: "text-right",
      cell: (product) => (
        <span
          className={cn(
            "tabular-nums",
            product.stock === 0
              ? "text-destructive"
              : product.stock < 20
                ? "text-secondary"
                : "text-accent"
          )}
        >
          {product.stock}
        </span>
      ),
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "text-right",
      cell: (product) => (
        <div className="flex items-center justify-end gap-1">
          <ButtonLink
            size="icon-sm"
            variant="ghost"
            aria-label={`View ${product.title}`}
            href={detailHref(product.id)}
          >
            <Eye />
          </ButtonLink>
          <ButtonLink
            size="icon-sm"
            variant="ghost"
            aria-label={`Edit ${product.title}`}
            href={editHref(product.id)}
          >
            <Pencil />
          </ButtonLink>
          <Button
            size="icon-sm"
            variant="destructive"
            aria-label={`Delete ${product.title}`}
            onClick={() => setProductToDelete(product)}
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Products"
        description="Server-side search, sorting and pagination backed by the DummyJSON Products API."
        actions={
          <ButtonLink href={withReturnState("/products/new", listParams.queryString)}>
            <Plus />
            Add Product
          </ButtonLink>
        }
      />

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
        <SearchInput
          value={listParams.search}
          placeholder="Search products by title, brand or description…"
          label="Search products"
          // Search and the category filter now combine: the API applies both.
          onChange={(value) => listParams.setParams({ search: value })}
          className="sm:max-w-sm"
        />

        <div className="flex items-center gap-3 sm:ml-auto">
          <span className="hidden text-sm font-medium whitespace-nowrap text-muted-foreground sm:inline">
            Category
          </span>
          <Select
            aria-label="Filter by category"
            value={category}
            onChange={(event) =>
              listParams.setParams({ category: event.target.value || undefined })
            }
            className="sm:w-52"
          >
            <option value="">All categories</option>
            {categories?.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </Select>

          {hasFilters ? (
            <Button variant="ghost" size="sm" onClick={listParams.reset}>
              Clear
            </Button>
          ) : null}
        </div>
      </div>

      {isError ? (
        <ErrorState
          title="Failed to load products"
          error={error}
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <DataTable
            caption="Products"
            columns={columns}
            rows={products}
            getRowId={(product) => product.id}
            isLoading={isLoading}
            skeletonRows={listParams.limit}
            sortBy={listParams.sortBy}
            order={listParams.order}
            onSortChange={listParams.toggleSort}
            emptyState={
              <EmptyState
                icon={PackageSearch}
                title="No products found"
                description={
                  hasFilters
                    ? "No products match the current search or category filter."
                    : "The catalogue is empty right now."
                }
                action={
                  hasFilters ? (
                    <Button variant="outline" size="sm" onClick={listParams.reset}>
                      Clear filters
                    </Button>
                  ) : null
                }
              />
            }
          />

          <Pagination
            page={listParams.page}
            limit={listParams.limit}
            total={total}
            itemLabel="products"
            isLoading={isFetching}
            onPageChange={(page) => listParams.setParams({ page })}
          />
        </>
      )}

      <ConfirmDialog
        open={productToDelete !== null}
        onOpenChange={(open) => !open && setProductToDelete(null)}
        title="Delete product"
        description={`"${productToDelete?.title ?? ""}" will be removed from the catalogue. This action cannot be undone.`}
        confirmLabel="Delete product"
        destructive
        isPending={deleteMutation.isPending}
        onConfirm={() =>
          productToDelete && deleteMutation.mutate(productToDelete.id)
        }
      />
    </div>
  );
}
