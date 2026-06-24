import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { CognitoUser } from "amazon-cognito-identity-js";
import * as authService from "@/lib/auth";

interface AuthUser {
  sub: string;
  email: string;
  name: string;
}

type SignInResult =
  | { type: "success" }
  | { type: "newPasswordRequired" };

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingNewPassword: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  completeNewPassword: (newPassword: string, name?: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [challengeUser, setChallengeUser] = useState<CognitoUser | null>(null);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const session = await authService.getSession();
      if (session) {
        const payload = session.getIdToken().decodePayload();
        setUser({
          sub: payload.sub,
          email: payload.email,
          name: payload.name || payload.email,
        });
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  const signIn = useCallback(async (email: string, password: string): Promise<SignInResult> => {
    const result = await authService.signIn(email, password);

    if (result.type === "newPasswordRequired") {
      setChallengeUser(result.user);
      return { type: "newPasswordRequired" };
    }

    const payload = result.session.getIdToken().decodePayload();
    setUser({
      sub: payload.sub,
      email: payload.email,
      name: payload.name || payload.email,
    });
    return { type: "success" };
  }, []);

  const completeNewPassword = useCallback(async (newPassword: string, name?: string) => {
    if (!challengeUser) {
      throw new Error("No pending password challenge");
    }
    const session = await authService.completeNewPassword(challengeUser, newPassword, name);
    const payload = session.getIdToken().decodePayload();
    setUser({
      sub: payload.sub,
      email: payload.email,
      name: payload.name || payload.email,
    });
    setChallengeUser(null);
  }, [challengeUser]);

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      await authService.signUp(email, password, name);
    },
    []
  );

  const confirmSignUp = useCallback(async (email: string, code: string) => {
    await authService.confirmSignUp(email, code);
  }, []);

  const signOut = useCallback(() => {
    authService.signOut();
    setUser(null);
    setChallengeUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        pendingNewPassword: !!challengeUser,
        signIn,
        completeNewPassword,
        signUp,
        confirmSignUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
