import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  phone?: string;
  userType: "producer" | "provider";
}

export interface AuthResponse {
  user: User;
  profile?: any;
}

class AuthService {
  private user: User | null = null;
  private profile: any = null;

  constructor() {
    // Try to load user from localStorage on initialization
    const savedUser = localStorage.getItem("user");
    const savedProfile = localStorage.getItem("profile");
    
    if (savedUser) {
      this.user = JSON.parse(savedUser);
    }
    
    if (savedProfile) {
      this.profile = JSON.parse(savedProfile);
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/login", { email, password });
    const data = await response.json();
    
    this.user = data.user;
    this.profile = data.profile;
    
    localStorage.setItem("user", JSON.stringify(data.user));
    if (data.profile) {
      localStorage.setItem("profile", JSON.stringify(data.profile));
    }
    
    return data;
  }

  async register(userData: any): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/register", userData);
    const data = await response.json();
    
    this.user = data.user;
    
    localStorage.setItem("user", JSON.stringify(data.user));
    
    return data;
  }

  logout() {
    this.user = null;
    this.profile = null;
    localStorage.removeItem("user");
    localStorage.removeItem("profile");
  }

  getCurrentUser(): User | null {
    return this.user;
  }

  getCurrentProfile(): any {
    return this.profile;
  }

  isAuthenticated(): boolean {
    return this.user !== null;
  }

  isProducer(): boolean {
    return this.user?.userType === "producer";
  }

  isProvider(): boolean {
    return this.user?.userType === "provider";
  }
}

export const authService = new AuthService();
