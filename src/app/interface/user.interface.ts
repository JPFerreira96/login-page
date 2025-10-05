export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  motherName?: string;
  role: string;
  cards?: any[];
}