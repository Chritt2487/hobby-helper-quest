import { Loader2 } from "lucide-react";

export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-[#9b87f5]" />
      <p className="text-gray-600">✨ Working our magic to find your perfect activities! ✨</p>
    </div>
  );
}