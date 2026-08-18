import type { ListQueryParams, RecordSource } from "@/types/api.types";

export interface UserAddress {
  address: string;
  city: string;
  state: string;
  stateCode: string;
  postalCode: string;
  country: string;
}

export interface UserCompany {
  department: string;
  name: string;
  title: string;
  address: UserAddress;
}

export interface User {
  /** Set by the API: whether this record was created or edited locally. */
  source?: RecordSource;

  id: number;
  firstName: string;
  lastName: string;
  maidenName?: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  username: string;
  birthDate: string;
  image: string;
  bloodGroup?: string;
  height?: number;
  weight?: number;
  eyeColor?: string;
  university?: string;
  address?: UserAddress;
  company?: UserCompany;
  role?: string;
}

/** Fields the application is allowed to create or update. */
export interface UserPayload {
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  username: string;
}

export interface UserListParams extends ListQueryParams {
  gender?: string;
}

export const USER_GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
] as const;
