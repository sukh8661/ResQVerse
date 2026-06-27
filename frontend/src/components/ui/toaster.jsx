import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport
} from "@/components/ui/toast";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
function Toaster() {
  const { toasts } = useToast();
  return <ToastProvider>
      {toasts.map(function({ id, title, description, action, ...props }) {
    const Icon = props.variant === "destructive" ? AlertCircle : title?.toLowerCase?.().includes("success") || title?.toLowerCase?.().includes("created") ? CheckCircle2 : Info;
    return <Toast key={id} {...props}>
            <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${props.variant === "destructive" ? "bg-red-500/20 text-red-100" : "bg-emerald-100 text-emerald-700"}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="grid flex-1 gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>;
  })}
      <ToastViewport />
    </ToastProvider>;
}
export {
  Toaster
};
