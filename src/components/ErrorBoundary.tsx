import { Component, type ErrorInfo, type ReactNode } from 'react';
import { BookOpenIcon } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100 flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpenIcon size={40} className="text-purple-500" />
            </div>
            <h1 className="text-2xl font-display font-bold text-purple-600 mb-3">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 mb-6 font-body">
              Don't worry! Even the best storytellers have hiccups sometimes.
              Let's try that again!
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              className="py-3 px-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl shadow hover:from-purple-600 hover:to-blue-600 transition-colors font-body"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
