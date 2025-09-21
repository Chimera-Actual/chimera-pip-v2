import React from 'react';

export class BootErrorBoundary extends React.Component<
  { children: React.ReactNode }, { err?: Error }
> {
  state = { err: undefined as Error | undefined };
  static getDerivedStateFromError(err: Error) { return { err }; }
  componentDidCatch(err: any, info: any) { console.error('Boot error', err, info); }
  render() {
    if (this.state.err) {
      return (
        <div className="p-6 text-primary">
          <h1 className="text-xl font-bold">SYSTEM STARTUP FAILURE</h1>
          <p className="mt-2 opacity-80">{String(this.state.err.message ?? this.state.err)}</p>
          <p className="mt-4">Check environment variables in Settings → API Keys, then reload.</p>
        </div>
      );
    }
    return this.props.children;
  }
}