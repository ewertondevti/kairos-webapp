"use client";

import { firebaseAuth } from "@/firebase";
import { App } from "antd";
import { sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./PasswordRecovery.module.scss";

export default function PasswordRecoveryPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const onBackHome = () => router.push("/");
  const onBackLogin = () => router.push("/login");

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();

    if (!email) {
      message.error("Informe o e-mail para recuperar a senha.");
      return;
    }

    try {
      setIsLoading(true);
      await sendPasswordResetEmail(firebaseAuth, email);
      setIsSent(true);
      message.success("Se o e-mail estiver cadastrado, enviaremos o link.");
    } catch (error) {
      console.error("Erro ao enviar recuperação:", error);
      message.error("Não foi possível enviar o link de recuperação.");
    } finally {
      setIsLoading(false);
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
                Recuperação segura
              </div>
              <h1 className={styles.title}>Recuperar senha</h1>
              <p className={styles.subtitle}>
                Informe o e-mail cadastrado para receber o link de redefinição
                com segurança.
              </p>

              <div className={styles.featureGrid}>
                <div className={styles.featureCard}>
                  <p className={styles.featureTitle}>Processo rápido</p>
                  <p className={styles.featureText}>
                    Receba o link e redefina sua senha em poucos passos.
                  </p>
                </div>
                <div className={styles.featureCard}>
                  <p className={styles.featureTitle}>Proteção contínua</p>
                  <p className={styles.featureText}>
                    Mantemos seus dados protegidos durante toda a recuperação.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.formWrap}>
              <div className={styles.card}>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.backButton}
                    onClick={onBackHome}
                  >
                    Voltar ao início
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={onBackLogin}
                  >
                    Voltar para o login
                  </button>
                </div>

                <h2 className={styles.cardTitle}>Enviar link de recuperação</h2>
                <p className={styles.cardSubtitle}>
                  Você receberá instruções por e-mail para criar uma nova senha.
                </p>

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

                  <button
                    type="submit"
                    className={styles.submit}
                    disabled={isLoading}
                  >
                    <span className={styles.submitContent}>
                      {isLoading ? "Enviando..." : "Enviar link"}
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

                <div className={styles.infoBox}>
                  {isSent
                    ? "Se o e-mail estiver cadastrado, você receberá o link em instantes."
                    : "Por segurança, não informamos se o e-mail existe no sistema."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
