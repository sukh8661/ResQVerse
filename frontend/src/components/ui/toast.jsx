import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
const ToastProvider = ({ duration = 5000, swipeDirection = "right", ...props }) => (
  <ToastPrimitives.Provider duration={duration} swipeDirection={swipeDirection} {...props} />
);
const ToastViewport = React.forwardRef(({ className, ...props }, ref) => <ToastPrimitives.Viewport
  ref={ref}
  className={cn(
    "fixed bottom-5 right-5 top-auto z-[100] flex max-h-screen w-[calc(100%-2rem)] flex-col gap-3 p-0 sm:w-[430px]",
    className
  )}
  {...props}
/>);
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start justify-between gap-4 overflow-hidden rounded-2xl border p-5 pr-12 shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-all duration-300 data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-5 data-[state=open]:fade-in-0",
  {
    variants: {
      variant: {
        default: "border-emerald-200/80 bg-white/95 text-slate-900",
        destructive: "destructive group border-red-300/80 bg-red-950/95 text-white"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return <ToastPrimitives.Root
    ref={ref}
    className={cn(toastVariants({ variant }), className)}
    {...props}
  />;
});
Toast.displayName = ToastPrimitives.Root.displayName;
const ToastAction = React.forwardRef(({ className, ...props }, ref) => <ToastPrimitives.Action
  ref={ref}
  className={cn(
    "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
    className
  )}
  {...props}
/>);
ToastAction.displayName = ToastPrimitives.Action.displayName;
const ToastClose = React.forwardRef(({ className, ...props }, ref) => <ToastPrimitives.Close
  ref={ref}
  className={cn(
    "absolute right-3 top-3 rounded-full p-1.5 text-slate-400 opacity-100 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 group-[.destructive]:text-red-100/80 group-[.destructive]:hover:bg-white/10 group-[.destructive]:hover:text-white group-[.destructive]:focus:ring-red-200",
    className
  )}
  toast-close=""
  {...props}
>
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>);
ToastClose.displayName = ToastPrimitives.Close.displayName;
const ToastTitle = React.forwardRef(({ className, ...props }, ref) => <ToastPrimitives.Title
  ref={ref}
  className={cn("text-sm font-bold tracking-normal", className)}
  {...props}
/>);
ToastTitle.displayName = ToastPrimitives.Title.displayName;
const ToastDescription = React.forwardRef(({ className, ...props }, ref) => <ToastPrimitives.Description
  ref={ref}
  className={cn("text-sm leading-5 opacity-90", className)}
  {...props}
/>);
ToastDescription.displayName = ToastPrimitives.Description.displayName;
export {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport
};
