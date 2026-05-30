import React from "react";

interface ErrorState {
  hasError: boolean;
  message: string;
}

interface Props {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<Props, ErrorState> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
    this.handleReload = this.handleReload.bind(this);
  }

  static getDerivedStateFromError(error: Error): ErrorState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReload() {
    this.setState({ hasError: false, message: "" });
    window.location.reload();
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-2xl p-8 text-center space-y-5">
          <div className="text-4xl">📷</div>
          <h1 className="text-white font-serif text-xl font-semibold">
            Algo salió mal
          </h1>
          <p className="text-stone-400 text-sm leading-relaxed">
            Ocurrió un error inesperado. Por favor recargá la página para continuar.
          </p>
          {this.state.message && (
            <pre className="text-left text-[10px] text-stone-600 bg-stone-950 border border-stone-800 rounded-lg p-3 overflow-auto max-h-32 font-mono">
              {this.state.message}
            </pre>
          )}
          <button
            onClick={this.handleReload}
            className="w-full py-2.5 bg-white text-stone-950 rounded-xl font-semibold text-sm hover:bg-stone-100 transition"
          >
            Recargar página
          </button>
          <p className="text-[10px] text-stone-600 font-mono">
            Powered by Nodo Ai Agency
          </p>
        </div>
      </div>
    );
  }
}
