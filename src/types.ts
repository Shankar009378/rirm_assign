export interface DomainData {
  domain: string;
  niche1: string;
  niche2: string;
  traffic: number;
  dr: number;
  da: number;
  language: string;
  price: number;
  spamScore: number;
}


export interface AuthState {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}