// Componente para manejar estados de loading y error de forma consistente

import { Loader2, AlertCircle, RefreshCw, CheckCircle, XCircle } from "lucide-react";

interface LoadingStateProps {
  isLoading?: boolean;
  isError?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  loadingMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function LoadingState({
  isLoading = false,
  isError = false,
  error = null,
  isEmpty = false,
  emptyMessage = "No se encontraron datos",
  loadingMessage = "Cargando...",
  errorMessage = "Ocurrió un error",
  onRetry,
  children,
  className = "",
}: LoadingStateProps) {
  // Si está cargando, mostrar spinner
  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Loader2 className="text-blue-600 animate-spin" size={32} />
        </div>
        <p className="text-gray-600 text-lg">{loadingMessage}</p>
        <p className="text-gray-400 text-sm mt-2">Por favor espera...</p>
      </div>
    );
  }

  // Si hay error, mostrar mensaje de error
  if (isError) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="text-red-600" size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{errorMessage}</h3>
        <p className="text-gray-600 text-center mb-6 max-w-md">
          {error || "Ocurrió un error al cargar los datos. Por favor intenta de nuevo."}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Reintentar
          </button>
        )}
      </div>
    );
  }

  // Si está vacío, mostrar mensaje de vacío
  if (isEmpty) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <XCircle className="text-gray-400" size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Sin datos</h3>
        <p className="text-gray-600 text-center mb-6 max-w-md">{emptyMessage}</p>
      </div>
    );
  }

  // Si todo está bien, mostrar children
  return <>{children}</>;
}

// Variante para estados de éxito
interface SuccessStateProps {
  message: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function SuccessState({
  message,
  description,
  icon = <CheckCircle className="text-green-600" size={32} />,
  className = "",
}: SuccessStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{message}</h3>
      {description && (
        <p className="text-gray-600 text-center mb-6 max-w-md">{description}</p>
      )}
    </div>
  );
}

// Hook para manejar estados de carga
export function useLoadingState() {
  const createState = (
    isLoading: boolean,
    isError: boolean,
    error: string | null,
    isEmpty: boolean
  ) => ({
    isLoading,
    isError,
    error,
    isEmpty,
  });

  return {
    createState,
    loading: createState(true, false, null, false),
    error: (error: string) => createState(false, true, error, false),
    empty: createState(false, false, null, true),
    success: createState(false, false, null, false),
  };
}

// Componente para skeleton loading
export function SkeletonLoader({
  count = 3,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="h-20 bg-gray-200 rounded-lg"></div>
        </div>
      ))}
    </div>
  );
}

// Componente para skeleton de tarjetas
export function CardSkeleton({
  count = 3,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="h-40 bg-gray-200 rounded-xl"></div>
        </div>
      ))}
    </div>
  );
}

// Componente para skeleton de tabla
export function TableSkeleton({
  rows = 5,
  columns = 4,
  className = "",
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header */}
      <div className="flex gap-2">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div key={`header-${colIndex}`} className="flex-1">
            <div className="h-8 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={`cell-${rowIndex}-${colIndex}`} className="flex-1">
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}