import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
  color?: "coral" | "mint" | "sunny" | "success";
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({ 
  current, 
  total, 
  color = "success", 
  showLabel = true,
  size = "md" 
}: ProgressBarProps) {
  const percentage = Math.min((current / total) * 100, 100);
  
  const colorClasses = {
    coral: "bg-coral",
    mint: "bg-mint", 
    sunny: "bg-sunny",
    success: "bg-success"
  };

  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4"
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`flex-1 ${sizeClasses[size]} bg-gray-200 rounded-full overflow-hidden`}>
        <motion.div
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full progress-fill`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      {showLabel && (
        <span className="text-sm text-gray-600 font-nunito font-semibold min-w-max">
          {current}/{total}
        </span>
      )}
    </div>
  );
}
