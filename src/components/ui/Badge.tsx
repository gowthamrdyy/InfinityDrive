// ============================================
// InfinityDrive — Badge Component
// ============================================

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: 'bg-white/[0.06] text-text-secondary',
  success: 'bg-green-500/10 text-green-400 border-green-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  error: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export function Badge({
  variant = 'default',
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-2 py-0.5 rounded-full
        text-[11px] font-medium
        border border-transparent
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
