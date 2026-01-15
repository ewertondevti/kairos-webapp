export default function LoginPage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <div className="relative isolate">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 translate-x-1/4 translate-y-1/4 rounded-full bg-fuchsia-500/20 blur-3xl" />
        </div>

        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
          <div className="grid w-full gap-10 lg:grid-cols-2">
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Acesso seguro e moderno
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
                Bem-vindo de volta
              </h1>
              <p className="mt-4 max-w-xl text-base text-white/70 sm:text-lg">
                Entre com suas credenciais para gerenciar conteúdos, eventos e
                informações da comunidade com uma experiência rápida e elegante.
              </p>

              <div className="mt-8 grid gap-4 text-sm text-white/70 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-medium text-white">Gestão completa</p>
                  <p className="mt-2">
                    Organize álbuns, eventos e conteúdos em um só lugar.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-medium text-white">Experiência rápida</p>
                  <p className="mt-2">
                    Interface responsiva, fluida e otimizada.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center lg:justify-end">
              <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold">Entrar</h2>
                  <p className="mt-2 text-sm text-white/70">
                    Use seu e-mail e senha cadastrados.
                  </p>
                </div>

                <form className="space-y-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-white/90"
                    >
                      E-mail
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="voce@dominio.com"
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="text-sm font-medium text-white/90"
                      >
                        Senha
                      </label>
                      <button
                        type="button"
                        className="text-xs font-medium text-indigo-200 hover:text-indigo-100"
                      >
                        Esqueci minha senha
                      </button>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm text-white/70">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-white/20 bg-white/10 text-indigo-400 focus:ring-indigo-400/40"
                      />
                      Manter conectado
                    </label>
                    <span className="text-xs text-white/50">
                      Último acesso há 2 dias
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="group relative w-full overflow-hidden rounded-2xl bg-linear-to-r from-indigo-500 via-indigo-400 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-indigo-300/50"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Entrar
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 20 20"
                        className="h-4 w-4 transition group-hover:translate-x-0.5"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 10a.75.75 0 0 1 .75-.75h8.69l-2.47-2.47a.75.75 0 1 1 1.06-1.06l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l2.47-2.47H3.75A.75.75 0 0 1 3 10Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span className="absolute inset-0 bg-white/10" />
                    </span>
                  </button>
                </form>

                <div className="mt-6 border-t border-white/10 pt-5 text-center text-sm text-white/70">
                  Novo por aqui?{' '}
                  <button
                    type="button"
                    className="font-semibold text-indigo-200 hover:text-indigo-100"
                  >
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
