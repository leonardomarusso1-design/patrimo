"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { signIn, signUp, requestPasswordReset, type AuthState } from "@/app/auth/actions";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Field";

const empty: AuthState = {};

function Alert({ state }: { state: AuthState }) {
  if (state.error)
    return (
      <p className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm text-danger" role="alert">
        {state.error}
      </p>
    );
  if (state.message)
    return (
      <p className="rounded-xl bg-success/10 px-3.5 py-2.5 text-sm text-success" role="status">
        {state.message}
      </p>
    );
  return null;
}

function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input type={show ? "text" : "password"} {...props} className="pr-11" />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, empty);
  const params = useSearchParams();
  const next = params.get("next") ?? "/app";

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <Alert state={state} />
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="voce@email.com" required />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Senha</Label>
          <Link href="/recuperar-senha" className="text-sm text-accent-dim hover:underline">
            Esqueci minha senha
          </Link>
        </div>
        <PasswordInput id="password" name="password" autoComplete="current-password" required />
      </div>
      <Button type="submit" className="w-full" loading={pending}>
        Entrar
      </Button>
    </form>
  );
}

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, empty);
  const params = useSearchParams();
  const plano = params.get("plano");

  return (
    <form action={action} className="space-y-4">
      <Alert state={state} />
      {plano && (
        <p className="rounded-xl bg-accent/10 px-3.5 py-2 text-sm text-accent-dim">
          Plano escolhido: <strong className="capitalize">{plano}</strong>. Finalize o
          cadastro para ativar.
        </p>
      )}
      <div>
        <Label htmlFor="fullName">Nome</Label>
        <Input id="fullName" name="fullName" autoComplete="name" placeholder="Seu nome" required />
      </div>
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="voce@email.com" required />
      </div>
      <div>
        <Label htmlFor="password">Senha</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          placeholder="Mínimo 8 caracteres"
          required
        />
        <FieldError>{null}</FieldError>
      </div>
      <Button type="submit" className="w-full" loading={pending}>
        Criar conta
      </Button>
      <p className="text-xs text-muted">
        Ao criar a conta você concorda com os{" "}
        <Link href="/termos" className="text-accent-dim underline">Termos</Link> e a{" "}
        <Link href="/privacidade" className="text-accent-dim underline">Política de Privacidade</Link>.
      </p>
    </form>
  );
}

export function ResetForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, empty);
  return (
    <form action={action} className="space-y-4">
      <Alert state={state} />
      <div>
        <Label htmlFor="email">E-mail da conta</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <Button type="submit" className="w-full" loading={pending}>
        Enviar link de redefinição
      </Button>
    </form>
  );
}
