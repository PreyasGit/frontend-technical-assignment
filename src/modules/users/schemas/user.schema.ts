import * as yup from "yup";

/** Validation rules shared by the Add User and Edit User modals. */
export const userSchema = yup.object({
  firstName: yup
    .string()
    .trim()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be 50 characters or fewer"),
  lastName: yup
    .string()
    .trim()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be 50 characters or fewer"),
  username: yup
    .string()
    .trim()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters")
    .matches(
      /^[a-zA-Z0-9._-]+$/,
      "Username may only contain letters, numbers, dots, dashes and underscores"
    ),
  email: yup
    .string()
    .trim()
    .required("Email is required")
    .email("Enter a valid email address"),
  phone: yup
    .string()
    .trim()
    .required("Phone number is required")
    .matches(/^[+()\d\s-]{7,20}$/, "Enter a valid phone number"),
  age: yup
    .number()
    .typeError("Age must be a number")
    .required("Age is required")
    .integer("Age must be a whole number")
    .min(18, "User must be at least 18")
    .max(120, "Age must be 120 or below"),
  gender: yup
    .string()
    .required("Gender is required")
    .oneOf(["male", "female"], "Select a gender"),
});

export type UserFormValues = yup.InferType<typeof userSchema>;

export const userFormDefaults: UserFormValues = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  phone: "",
  age: 18,
  gender: "male",
};
