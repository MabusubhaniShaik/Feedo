// constants/ui.ts
export const UI_CONSTANTS = {
  // Font sizes in rem (following Tailwind convention but smaller)
  fontSize: {
    xs: "0.625rem", // 10px
    sm: "0.75rem", // 12px
    base: "0.875rem", // 14px
    lg: "1rem", // 16px
    xl: "1.125rem", // 18px
  },

  // Spacing/sizing
  spacing: {
    button: {
      xs: "h-6 px-2", // Extra small
      sm: "h-7 px-3", // Small
      md: "h-8 px-4", // Medium
      lg: "h-9 px-4", // Large
    },
    icon: {
      xs: "h-3 w-3", // Extra small
      sm: "h-3.5 w-3.5", // Small
      md: "h-4 w-4", // Medium
    },
  },
} as const;
