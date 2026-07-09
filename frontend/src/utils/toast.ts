import { toast } from "react-toastify";

export function toastError(message: string) {
  toast.error(message);
}

export function toastSuccess(message: string) {
  toast.success(message);
}
