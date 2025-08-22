"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { getAuth, signOut, sendPasswordResetEmail } from "firebase/auth";
import { useAuth } from "@/hooks";
import { LoginForm } from "@/components/login-form";
import { RegisterForm } from "@/components/register-form";
import { SendPasswordResetEmailForm } from "@/components/send-password-reset-email-form";
import { PromoAlert, ListItem, ProfileHeader, Section } from "@/components/profile-ui";
import { faComments, faBell, faIdCard, faCreditCard } from "@fortawesome/free-solid-svg-icons";

export default function PerfilPage() {
  const router = useRouter();
  // ✅ só o que existe no AuthContextType
  const { user, loading } = useAuth();

  // estado local para o formulário de reset
  const [email, setEmail] = React.useState<string>("");
  const [resetError, setResetError] = React.useState<string | null>(null);

  // logout direto no Firebase
  const onLogout = React.useCallback(async () => {
    try {
      await signOut(getAuth());
      router.refresh(); // opcional
    } catch (e) {
      console.error("Erro ao sair:", e);
    }
  }, [router]);

  // navegação pedida pelo form
  const handleCurrentRoute = (route: string) => {
    if (route === "login") router.push("/perfil");
  };

  // envio de email de reset usando Firebase (sem depender do contexto)
  const onResetPassword = async (value: string) => {
    try {
      setResetError(null);
      await sendPasswordResetEmail(getAuth(), value);
    } catch (e: unknown) {
      console.error(e);
      setResetError("Não foi possível enviar o e-mail de recuperação.");
    }
  };

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4">
        <div className="card-lg mt-8">Carregando perfil…</div>
      </main>
    );
  }

  if (user) {
    return (
      <main className="max-w-5xl mx-auto px-4">
        <header className="py-6">
          <ProfileHeader
            name={user?.displayName ?? null}
            email={user?.email ?? null}
            photoURL={user?.photoURL ?? null}
          />
        </header>

        <div className="space-y-6">
          <PromoAlert />

          <Section title="Opções">
            <div className="card-lg space-y-1">
              <ListItem icon={faComments} label="Conversas" desc="Meu histórico de conversas" href="/perfil/conversas" />
              <ListItem icon={faBell} label="Notificações" desc="Minha central de notificações" badge="1" href="/perfil/notificacoes" />
              <ListItem icon={faIdCard} label="Dados da conta" desc="Minhas informações da conta" href="/perfil/dados" />
              <ListItem icon={faCreditCard} label="Pagamentos" desc="Meus saldos e cartões" badge="NOVO!" href="/perfil/pagamentos" />
            </div>
          </Section>

          <div className="card flex justify-end">
            <button className="btn-ghost" onClick={onLogout}>Sair</button>
          </div>
        </div>
      </main>
    );
  }

  // Não logado
  return (
    <main className="max-w-5xl mx-auto px-4">
      <header className="py-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Perfil</h1>
        <p className="muted">Entre para acessar suas conversas, notificações e histórico de pedidos.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-lg">
          <h2 className="text-xl font-semibold mb-4">Entrar</h2>
          <LoginForm />
        </div>

        <div className="card-lg">
          <h2 className="text-xl font-semibold mb-4">Criar conta</h2>
          <RegisterForm />
        </div>

        <div className="card-lg md:col-span-2">
          <h2 className="text-xl font-semibold mb-2">Esqueci minha senha</h2>
          <SendPasswordResetEmailForm
            errorMessage={resetError}
            email={email}
            setEmail={setEmail}
            handleSendPasswordResetEmail={onResetPassword}
            handleCurrentRoute={handleCurrentRoute}
          />
        </div>
      </div>
    </main>
  );
}
