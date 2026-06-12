const variantStyles = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm hover:shadow-md active:bg-brand-800',
  secondary: 'bg-white text-surface-700 border border-surface-300 hover:bg-surface-50 active:bg-surface-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  ghost: 'text-surface-600 hover:text-surface-900 hover:bg-surface-100',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({ children, variant = 'primary', size = 'md', className = '', disabled, loading, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

const badgeVariants = {
  default: 'bg-surface-100 text-surface-700',
  primary: 'bg-brand-100 text-brand-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
};

export function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeVariants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-surface-200 shadow-sm ${hover ? 'card-hover' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-surface-700">{label}</label>}
      <input
        className={`input-base ${error ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-500/20' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function Select({ label, error, options, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-surface-700">{label}</label>}
      <select
        className={`input-base ${error ? 'border-red-300' : ''} ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-100">
        {icon || (
          <svg className="h-8 w-8 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>
      <h3 className="text-lg font-semibold text-surface-900 mb-1.5">{title}</h3>
      <p className="text-surface-500 mb-6 max-w-sm text-center text-sm">{description}</p>
      {action}
    </div>
  );
}

export function Toast({ message, type = 'success', onClose }) {
  const colors = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg animate-slide-down ${colors[type]}`}>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 text-current opacity-60 hover:opacity-100">&times;</button>
    </div>
  );
}
