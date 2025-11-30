import api from "../utils/api";

export interface LoginCredentials {
  email: string;
  password: string;
  googleToken?: string;
}

export interface LoginResponse {
  user: any; // or create a proper User type
  token: string;
}

const login = async (data: LoginCredentials): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>("/auth/login", data);
  return res.data;
};

export const googleLogin = async (idToken: string): Promise<LoginResponse> => {
  // send { idToken } to backend endpoint that verifies the token and returns { user, token }
  const res = await api.post<LoginResponse>("/auth/google/callback", {
    idToken,
  });
  return res.data;
};

const authService = { login, googleLogin };
export default authService;
