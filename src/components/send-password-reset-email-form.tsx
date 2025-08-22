import React from "react";
import type { Dispatch, SetStateAction, FormEvent } from "react";

type Props = {
  errorMessage?: string | null;
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  handleSendPasswordResetEmail: (email: string) => void | Promise<void>;
  handleCurrentRoute: (route: string) => void;
};

export const SendPasswordResetEmailForm: React.FC<Props> = ({
  errorMessage,
  email,
  setEmail,
  handleSendPasswordResetEmail,
  handleCurrentRoute,
}) => {
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSendPasswordResetEmail(email);
  };

  const onLoginClick = () => handleCurrentRoute("login");

  return (
    <form className="p-4" onSubmit={onSubmit} noValidate>
      <label htmlFor="reset-email" className="text-sm">Email</label>
      <input
        id="reset-email"
        required
        type="email"
        placeholder="Digite seu email"
        onChange={(e) => setEmail(e.currentTarget.value)}
        className="bg-white rounded w-full me-2 h-8 p-1 mb-4"
        value={email}
        autoComplete="email"
      />

      {!!errorMessage && (
        <p className="text-red-700 text-sm text-center mb-4">{errorMessage}</p>
      )}

      <button
        className="bg-primary rounded w-full me-2 h-8 p-1 mb-2 text-white font-bold disabled:opacity-50"
        type="submit"
        disabled={!email}
      >
        Enviar
      </button>

      <button
        className="border-2 rounded w-full me-2 h-8 p-1 mb-3 font-bold"
        type="button"
        onClick={onLoginClick}
      >
        Voltar
      </button>
    </form>
  );
};