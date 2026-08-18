"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Pencil, Star } from "lucide-react";

import { ErrorState } from "@/components/common/error-state";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RETURN_PARAM_KEY,
  resolveReturnHref,
  withReturnState,
} from "@/hooks/use-list-params";
import { cn, formatCurrency, toTitleCase } from "@/lib/utils";

import { useProduct } from "../hooks/use-products";
import type { Product } from "../types/product.types";

export interface ProductDetailViewProps {
  productId: string;
}

/** Read-only product details screen. */
export function ProductDetailView({ productId }: ProductDetailViewProps) {
  const searchParams = useSearchParams();
  const returnState = searchParams.get(RETURN_PARAM_KEY);

  // Returning to the listing restores the exact search/sort/page it came from.
  const backHref = resolveReturnHref("/products", returnState);
  const editHref = withReturnState(
    `/products/${productId}/edit`,
    returnState ? decodeURIComponent(returnState) : ""
  );

  const { data: product, isLoading, isError, error, refetch } = useProduct(productId);

  if (isLoading) return <ProductDetailSkeleton backHref={backHref} />;

  if (isError || !product) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Product details" backHref={backHref} backLabel="Back to products" />
        <ErrorState
          title="Failed to load this product"
          error={error}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={product.title}
        description={product.description}
        backHref={backHref}
        backLabel="Back to products"
        actions={
          <Button render={<Link href={editHref} />}>
            <Pencil />
            Edit product
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <ProductGallery product={product} />

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-3xl font-bold text-primary">
                  {formatCurrency(product.price)}
                </span>
                {product.discountPercentage > 0 ? (
                  <Badge variant="accent">
                    {product.discountPercentage}% off
                  </Badge>
                ) : null}
                <Badge variant="secondary">{toTitleCase(product.category)}</Badge>
                <RatingBadge rating={product.rating} />
              </div>

              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <DetailRow label="Brand" value={product.brand ?? "—"} />
                <DetailRow label="SKU" value={product.sku} />
                <DetailRow
                  label="Stock"
                  value={`${product.stock} units`}
                  valueClassName={
                    product.stock === 0 ? "text-destructive" : "text-accent"
                  }
                />
                <DetailRow label="Availability" value={product.availabilityStatus} />
                <DetailRow
                  label="Minimum order"
                  value={`${product.minimumOrderQuantity} units`}
                />
                <DetailRow label="Weight" value={`${product.weight}`} />
                <DetailRow label="Warranty" value={product.warrantyInformation} />
                <DetailRow label="Shipping" value={product.shippingInformation} />
                <DetailRow label="Return policy" value={product.returnPolicy} />
                <DetailRow
                  label="Dimensions"
                  value={`${product.dimensions.width} × ${product.dimensions.height} × ${product.dimensions.depth}`}
                />
              </dl>

              {product.tags?.length ? (
                <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {toTitleCase(tag)}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>

          {product.reviews?.length ? (
            <Card>
              <CardHeader>
                <CardTitle>Customer reviews</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {product.reviews.map((review, index) => (
                  <article
                    key={`${review.reviewerEmail}-${index}`}
                    className="rounded-md border border-border p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-foreground">
                        {review.reviewerName}
                      </p>
                      <RatingBadge rating={review.rating} />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {review.comment}
                    </p>
                  </article>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ProductGallery({ product }: { product: Product }) {
  const images = product.images?.length ? product.images : [product.thumbnail];
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <Card className="h-fit">
      <CardContent className="flex flex-col gap-4 pt-6">
        <div className="relative aspect-square w-full overflow-hidden rounded-md border border-border bg-muted">
          <Image
            src={activeImage}
            alt={product.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-contain p-4"
          />
        </div>

        {images.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            {images.map((image) => (
              <button
                key={image}
                type="button"
                onClick={() => setActiveImage(image)}
                aria-label={`Show image ${images.indexOf(image) + 1}`}
                className={cn(
                  "relative size-16 cursor-pointer overflow-hidden rounded-md border bg-muted transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  image === activeImage
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Image src={image} alt="" fill sizes="64px" className="object-contain p-1" />
              </button>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function RatingBadge({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
      <Star className="size-4 fill-amber-400 text-amber-400" />
      {rating.toFixed(2)}
    </span>
  );
}

function DetailRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className={cn("text-sm font-medium text-foreground", valueClassName)}>
        {value}
      </dd>
    </div>
  );
}

function ProductDetailSkeleton({ backHref }: { backHref: string }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Loading product…" backHref={backHref} backLabel="Back to products" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
