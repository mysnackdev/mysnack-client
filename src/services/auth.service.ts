import {
  createUserWithEmailAndPassword,
  signInAnonymously as fbSignInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  type UserCredential,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "../firebase";
import type { LoginRequest, UserRequest } from "@/@types";

// Util para extrair mensagem segura de qualquer erro
function getErrorMessage(err: unknown): string {
  if (err instanceof FirebaseError) return `${err.code}: ${err.message}`;
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export class AuthService {
  static auth = auth;

  static async signInAnonymously(): Promise<UserCredential> {
    try {
      const res = await fbSignInAnonymously(auth);
      console.log("Login anônimo realizado com sucesso.");
      return res;
    } catch (err: unknown) {
      console.error("Erro no login anônimo:", getErrorMessage(err));
      throw err;
    }
  }

  static async signIn(params: LoginRequest): Promise<UserCredential> {
    try {
      await AuthService.logOut();
      return await signInWithEmailAndPassword(auth, params.email, params.password);
    } catch (err: unknown) {
      console.error("Erro ao fazer login:", getErrorMessage(err));
      throw err;
    }
  }

  static async signUp(params: UserRequest): Promise<UserCredential> {
    try {
      await AuthService.logOut();
      return await createUserWithEmailAndPassword(auth, params.email, params.password);
    } catch (err: unknown) {
      console.error("Erro ao fazer cadastro:", getErrorMessage(err));
      throw err;
    }
  }

  static async passwordResetEmail(email: string): Promise<void> {
    try {
      await AuthService.logOut();
      await sendPasswordResetEmail(auth, email);
    } catch (err: unknown) {
      console.error("Erro ao enviar email de recuperação de senha:", getErrorMessage(err));
      throw err;
    }
  }

  static async logOut(): Promise<void> {
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (err: unknown) {
      console.error("Erro ao fazer logout:", getErrorMessage(err));
      throw err;
    }
  }
}
