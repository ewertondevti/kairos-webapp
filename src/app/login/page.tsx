"use client";

import { firebaseAuth } from "@/firebase";
import { requestAccess, syncUserClaims } from "@/services/userServices";
import { UserRole } from "@/types/user";
import { App, Form, Input, Modal } from "antd";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./Login.module.scss";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestForm] = Form.useForm();
  const { message } = App.useApp();
  const onBack = () => router.back();
  const parseRole = (value: unknown): UserRole | null => {
    if (typeof value === "number" && [0, 1, 2].includes(value)) {
      return value as UserRole;
    }

    const parsedValue = Number(value);
    return [0, 1, 2].includes(parsedValue) ? (parsedValue as UserRole) : null;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      message.error("Preencha email e senha.");
      return;
    }

    try {
      setIsLoading(true);
      const credential = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );
      const initialToken = await credential.user.getIdTokenResult(true);
      let activeClaim = initialToken.claims.active as boolean | undefined;
      let role = parseRole(initialToken.claims.role);

      if (role === null || typeof activeClaim !== "boolean") {
        try {
          await syncUserClaims();
          const refreshedToken = await credential.user.getIdTokenResult(true);
          activeClaim = refreshedToken.claims.active as boolean | undefined;
          role = parseRole(refreshedToken.claims.role);
        } catch (syncError) {
          console.error("Erro ao sincronizar claims:", syncError);
        }
      }

      const active = Boolean(activeClaim);
      const hasActiveClaim = typeof activeClaim === "boolean";

      if (role === null || !hasActiveClaim) {
        await signOut(firebaseAuth);
        message.error("Seu acesso ainda não está configurado.");
        return;
      }

      if (!active) {
        await signOut(firebaseAuth);
        message.error("Seu acesso está inativo. Fale com a secretaria.");
        return;
      }

      const redirectTo =
        role === UserRole.Admin
          ? "/admin"
          : role === UserRole.Secretaria
          ? "/secretaria"
          : "/management/albums";
      router.push(redirectTo);
    } catch (error) {
      console.error("Erro ao entrar:", error);
      message.error("Não foi possível entrar. Verifique seus dados.");
    } finally {
      setIsLoading(false);
    }
  };

  const onRequestAccess = async () => {
    try {
      const values = await requestForm.validateFields();
      setRequestLoading(true);
      await requestAccess(values);
      message.success("Solicitação enviada com sucesso!");
      requestForm.resetFields();
      setIsRequestOpen(false);
    } catch (error) {
      if (error) {
        console.error("Erro ao solicitar acesso:", error);
        message.error("Não foi possível enviar sua solicitação.");
      }
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.background}>
        <div className={styles.glowLayer}>
          <div className={styles.glowTop} />
          <div className={styles.glowBottom} />
        </div>

        <div className={styles.container}>
          <div className={styles.grid}>
            <div className={styles.intro}>
              <div className={styles.pill}>
                <span className={styles.dot} />
                Acesso seguro e moderno
              </div>
              <h1 className={styles.title}>Bem-vindo de volta</h1>
              <p className={styles.subtitle}>
                Entre com suas credenciais para gerenciar conteúdos, eventos e
                informações da comunidade com uma experiência rápida e elegante.
              </p>

              <div className={styles.featureGrid}>
                <div className={styles.featureCard}>
                  <p className={styles.featureTitle}>Gestão completa</p>
                  <p className={styles.featureText}>
                    Organize álbuns, eventos e conteúdos em um só lugar.
                  </p>
                </div>
                <div className={styles.featureCard}>
                  <p className={styles.featureTitle}>Experiência rápida</p>
                  <p className={styles.featureText}>
                    Interface responsiva, fluida e otimizada.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.formWrap}>
              <div className={styles.card}>
                <div>
                  <button
                    type="button"
                    className={styles.backButton}
                    onClick={onBack}
                  >
                    Voltar
                  </button>
                  <h2 className={styles.cardTitle}>Entrar</h2>
                  <p className={styles.cardSubtitle}>
                    Use seu e-mail e senha cadastrados.
                  </p>
                </div>

                <form className={styles.form} onSubmit={onSubmit}>
                  <div className={styles.field}>
                    <label htmlFor="email" className={styles.label}>
                      E-mail
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="voce@dominio.com"
                      className={styles.input}
                      required
                    />
                  </div>

                  <div className={styles.field}>
                    <div className={styles.fieldRow}>
                      <label htmlFor="password" className={styles.label}>
                        Senha
                      </label>
                      <button type="button" className={styles.forgot}>
                        Esqueci minha senha
                      </button>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className={styles.input}
                      required
                    />
                  </div>

                  <div className={styles.row}>
                    <label className={styles.checkbox}>
                      <input type="checkbox" className={styles.checkboxInput} />
                      Manter conectado
                    </label>
                    <span>Último acesso há 2 dias</span>
                  </div>

                  <button
                    type="submit"
                    className={styles.submit}
                    disabled={isLoading}
                  >
                    <span className={styles.submitContent}>
                      {isLoading ? "Aguarde..." : "Entrar"}
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 20 20"
                        className={styles.submitIcon}
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 10a.75.75 0 0 1 .75-.75h8.69l-2.47-2.47a.75.75 0 1 1 1.06-1.06l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l2.47-2.47H3.75A.75.75 0 0 1 3 10Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </button>
                </form>

                <div className={styles.divider}>
                  Novo por aqui?{" "}
                  <button
                    type="button"
                    className={styles.linkButton}
                    onClick={() => setIsRequestOpen(true)}
                  >
                    Solicitar acesso
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="Solicitar acesso"
        open={isRequestOpen}
        onCancel={() => setIsRequestOpen(false)}
        okText="Enviar"
        confirmLoading={requestLoading}
        onOk={onRequestAccess}
        destroyOnHidden
      >
        <Form form={requestForm} layout="vertical" requiredMark="optional">
          <Form.Item
            name="fullname"
            label="Nome completo"
            rules={[{ required: true, message: "Informe seu nome completo." }]}
          >
            <Input placeholder="Nome completo" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Informe seu email." },
              { type: "email", message: "Email inválido." },
            ]}
          >
            <Input placeholder="email@dominio.com" type="email" />
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
}
