export type ClientAddress = {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip?: string;
};

export type ClientProfileInput = {
  uid?: string;            // filled server-side if not provided
  email: string;
  displayName: string;
  phone?: string;
  document?: string;       // CPF/CNPJ
  birthDate?: string;      // YYYY-MM-DD
  address?: ClientAddress;
  marketingOptIn?: boolean;
};
