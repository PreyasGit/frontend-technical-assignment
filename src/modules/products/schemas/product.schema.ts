import * as yup from "yup";

/** Shared validation rules for the Add Product and Edit Product forms. */
export const productSchema = yup.object({
  title: yup
    .string()
    .trim()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be 120 characters or fewer"),
  description: yup
    .string()
    .trim()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be 1000 characters or fewer"),
  category: yup.string().trim().required("Category is required"),
  price: yup
    .number()
    .typeError("Price must be a number")
    .required("Price is required")
    .positive("Price must be greater than 0")
    .max(1_000_000, "Price looks unrealistically high"),
  stock: yup
    .number()
    .typeError("Stock must be a number")
    .required("Stock is required")
    .integer("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .max(1_000_000, "Stock looks unrealistically high"),
  brand: yup
    .string()
    .trim()
    .max(80, "Brand must be 80 characters or fewer")
    .optional(),
});

export type ProductFormValues = yup.InferType<typeof productSchema>;

export const productFormDefaults: ProductFormValues = {
  title: "",
  description: "",
  category: "",
  price: 0,
  stock: 0,
  brand: "",
};
