import styles from "./Login.module.scss";

export default function LoginPage() {
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
                  <h2 className={styles.cardTitle}>Entrar</h2>
                  <p className={styles.cardSubtitle}>
                    Use seu e-mail e senha cadastrados.
                  </p>
                </div>

                <form className={styles.form}>
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
                    />
                  </div>

                  <div className={styles.row}>
                    <label className={styles.checkbox}>
                      <input type="checkbox" className={styles.checkboxInput} />
                      Manter conectado
                    </label>
                    <span>Último acesso há 2 dias</span>
                  </div>

                  <button type="submit" className={styles.submit}>
                    <span className={styles.submitContent}>
                      Entrar
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
                  <button type="button" className={styles.linkButton}>
                    Solicitar acesso
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
