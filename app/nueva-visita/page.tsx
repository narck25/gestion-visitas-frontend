"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Camera, MapPin, Upload, X, Check, ChevronLeft, ChevronRight,
  AlertCircle, CheckCircle, Loader2, Home, RotateCcw, Search, User
} from "lucide-react";
import { getClients } from "@/lib/clients";
import { getUserInfo } from "@/lib/auth";
import CameraCapture from "@/components/CameraCapture";

// Tipos
type Step = 1 | 2 | 3 | 4 | 5;

interface Client {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface VisitData {
  cliente: string;
  clienteId: number | null;
  notas: string;
  location: { lat: number; lng: number; accuracy: number } | null;
  fotoAntes: { file: File; url: string; base64: string } | null;
  fotoDespues: { file: File; url: string; base64: string } | null;
}

export default function NuevaVisitaPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [visitData, setVisitData] = useState<VisitData>({
    cliente: "",
    clienteId: null,
    notas: "",
    location: null,
    fotoAntes: null,
    fotoDespues: null,
  });

  // Estados para manejo de UI
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Estados para clientes
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Refs
  const clientInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Función para obtener ubicación GPS
  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Tu dispositivo no soporta geolocalización");
      return;
    }

    setIsLoadingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setVisitData({
          ...visitData,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
        });
        setIsLoadingLocation(false);
      },
      (error) => {
        let errorMessage = "No se pudo obtener la ubicación";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Por favor habilita el GPS en tu dispositivo";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Ubicación no disponible. Intenta de nuevo";
            break;
          case error.TIMEOUT:
            errorMessage = "Tiempo agotado. Intenta de nuevo";
            break;
        }
        setError(errorMessage);
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Auto-obtener ubicación al llegar al paso 2
  useEffect(() => {
    if (currentStep === 2 && !visitData.location && !isLoadingLocation) {
      getLocation();
    }
  }, [currentStep]);

  // Función para manejar captura de foto ANTES
  const handleFotoAntesCapture = (imageBase64: string) => {
    // Convertir base64 a Blob y luego a File
    const base64Data = imageBase64.split(',')[1];
    const binaryData = atob(base64Data);
    const arrayBuffer = new ArrayBuffer(binaryData.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < binaryData.length; i++) {
      uint8Array[i] = binaryData.charCodeAt(i);
    }
    
    const blob = new Blob([uint8Array], { type: 'image/jpeg' });
    const file = new File([blob], `foto_antes_${Date.now()}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
    
    const url = URL.createObjectURL(blob);
    
    setVisitData({
      ...visitData,
      fotoAntes: { file, url, base64: imageBase64 }
    });
  };

  // Función para manejar captura de foto DESPUÉS
  const handleFotoDespuesCapture = (imageBase64: string) => {
    // Convertir base64 a Blob y luego a File
    const base64Data = imageBase64.split(',')[1];
    const binaryData = atob(base64Data);
    const arrayBuffer = new ArrayBuffer(binaryData.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < binaryData.length; i++) {
      uint8Array[i] = binaryData.charCodeAt(i);
    }
    
    const blob = new Blob([uint8Array], { type: 'image/jpeg' });
    const file = new File([blob], `foto_despues_${Date.now()}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
    
    const url = URL.createObjectURL(blob);
    
    setVisitData({
      ...visitData,
      fotoDespues: { file, url, base64: imageBase64 }
    });
  };

  // Validar si se puede avanzar al siguiente paso
  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return visitData.cliente.trim() !== "";
      case 2:
        return visitData.location !== null;
      case 3:
        return visitData.fotoAntes !== null;
      case 4:
        return visitData.fotoDespues !== null;
      case 5:
        return true;
      default:
        return false;
    }
  };

  // Navegar entre pasos
  const goToStep = (step: Step) => {
    setError(null);
    setCurrentStep(step);
  };

  // Enviar visita a la API
  const handleSubmit = async () => {
    setIsSending(true);
    setError(null);

    try {
      // Validar que todos los datos requeridos estén presentes
      if (!visitData.cliente.trim()) {
        throw new Error("El nombre del cliente es requerido");
      }

      if (!visitData.location) {
        throw new Error("La ubicación GPS es requerida");
      }

      if (!visitData.fotoAntes) {
        throw new Error("La foto ANTES es requerida");
      }

      if (!visitData.fotoDespues) {
        throw new Error("La foto DESPUÉS es requerida");
      }

      // Importar módulos necesarios
      const { getOrCreateClient } = await import("@/lib/clients");
      const { createVisit, uploadBothVisitImages } = await import("@/lib/visits");

      // 1. Obtener o crear cliente
      let clientId = visitData.clienteId;
      if (!clientId) {
        clientId = await getOrCreateClient(visitData.cliente.trim());
      }

      // 2. Crear la visita
      const visitResponse = await createVisit({
        clientId,
        latitude: visitData.location.lat,
        longitude: visitData.location.lng,
        accuracy: visitData.location.accuracy,
        notes: visitData.notas || "",
      });

      const visitId = visitResponse.id;

      // 3. Subir imágenes
      await uploadBothVisitImages(
        visitId,
        visitData.fotoAntes.file,
        visitData.fotoDespues.file
      );

      setSuccess(true);
      setIsSending(false);
      
      // Limpiar recursos de imágenes
      if (visitData.fotoAntes) URL.revokeObjectURL(visitData.fotoAntes.url);
      if (visitData.fotoDespues) URL.revokeObjectURL(visitData.fotoDespues.url);
      
    } catch (err: any) {
      console.error("Error al enviar visita:", err);
      setError(err.message || "Error al enviar la visita. Por favor intenta de nuevo.");
      setIsSending(false);
    }
  };

  // Cargar clientes al montar el componente
  useEffect(() => {
    const loadClients = async () => {
      try {
        setIsLoadingClients(true);
        const clientsData = await getClients();
        setClients(clientsData);
        setFilteredClients(clientsData);
      } catch (error) {
        console.error("Error al cargar clientes:", error);
        setError("No se pudieron cargar los clientes. Intenta de nuevo.");
      } finally {
        setIsLoadingClients(false);
      }
    };

    loadClients();
  }, []);

  // Filtrar clientes cuando cambia el texto de búsqueda
  useEffect(() => {
    if (visitData.cliente.trim() === "") {
      setFilteredClients(clients);
      setShowClientDropdown(false);
    } else {
      const searchTerm = visitData.cliente.toLowerCase();
      const filtered = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm)
      );
      setFilteredClients(filtered);
      setShowClientDropdown(filtered.length > 0);
    }
  }, [visitData.cliente, clients]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        clientInputRef.current &&
        !clientInputRef.current.contains(event.target as Node)
      ) {
        setShowClientDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Función para seleccionar un cliente
  const selectClient = (client: Client) => {
    setVisitData({
      ...visitData,
      cliente: client.name,
      clienteId: client.id,
    });
    setShowClientDropdown(false);
  };

  // Limpiar recursos
  useEffect(() => {
    return () => {
      if (visitData.fotoAntes) URL.revokeObjectURL(visitData.fotoAntes.url);
      if (visitData.fotoDespues) URL.revokeObjectURL(visitData.fotoDespues.url);
    };
  }, []);

  // Renderizar pantalla de éxito
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600" size={48} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              ¡Visita Registrada!
            </h1>
            <p className="text-gray-600 mb-8">
              La visita se ha enviado exitosamente al servidor.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700"
              >
                Registrar Nueva Visita
              </button>
              <button
                onClick={() => window.location.href = "/"}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 flex items-center justify-center gap-2"
              >
                <Home size={20} />
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Nueva Visita</h1>
            <button
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              Cancelar
            </button>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step < currentStep
                      ? "bg-green-600 text-white"
                      : step === currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step < currentStep ? <Check size={20} /> : step}
                </div>
                {step < 5 && (
                  <div
                    className={`w-8 h-1 ${
                      step < currentStep ? "bg-green-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-center text-gray-600">
            Paso {currentStep} de 5
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Paso 1: Datos Básicos */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Datos de la Visita
            </h2>
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cliente / Tienda *
                </label>
                <div className="relative">
                  <input
                    ref={clientInputRef}
                    type="text"
                    value={visitData.cliente}
                    onChange={(e) => {
                      setVisitData({ ...visitData, cliente: e.target.value });
                      setShowClientDropdown(true);
                    }}
                    onFocus={() => {
                      if (visitData.cliente.trim() && filteredClients.length > 0) {
                        setShowClientDropdown(true);
                      }
                    }}
                    placeholder="Busca o ingresa un cliente"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500 pr-10"
                  />
                  {isLoadingClients ? (
                    <div className="absolute right-3 top-3">
                      <Loader2 className="animate-spin text-gray-400" size={20} />
                    </div>
                  ) : (
                    <Search className="absolute right-3 top-3 text-gray-400" size={20} />
                  )}
                </div>
                
                {/* Dropdown de clientes */}
                {showClientDropdown && filteredClients.length > 0 && (
                  <div
                    ref={dropdownRef}
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                  >
                    {filteredClients.map((client) => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => selectClient(client)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                      >
                        <User className="text-gray-400" size={18} />
                        <div>
                          <p className="font-medium text-gray-900">{client.name}</p>
                          <p className="text-xs text-gray-500">
                            ID: {client.id}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Mensaje cuando no hay resultados */}
                {showClientDropdown && visitData.cliente.trim() && filteredClients.length === 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4">
                    <p className="text-gray-600 text-center">
                      No se encontraron clientes. Puedes ingresar un nuevo cliente.
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (Opcional)
                </label>
                <textarea
                  value={visitData.notas}
                  onChange={(e) =>
                    setVisitData({ ...visitData, notas: e.target.value })
                  }
                  placeholder="Agrega notas adicionales sobre la visita"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Paso 2: Ubicación GPS */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MapPin className="text-blue-600" size={28} />
              Ubicación GPS
            </h2>
            {isLoadingLocation ? (
              <div className="text-center py-12">
                <Loader2 className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
                <p className="text-gray-600">Obteniendo tu ubicación...</p>
              </div>
            ) : visitData.location ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center justify-center mb-4">
                  <CheckCircle className="text-green-600" size={48} />
                </div>
                <h3 className="text-center font-bold text-gray-900 mb-4">
                  Ubicación Obtenida
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Latitud</p>
                    <p className="font-mono font-bold text-gray-900">
                      {visitData.location.lat.toFixed(6)}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Longitud</p>
                    <p className="font-mono font-bold text-gray-900">
                      {visitData.location.lng.toFixed(6)}
                    </p>
                  </div>
                  <div className="col-span-2 bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Precisión</p>
                    <p className="font-mono font-bold text-gray-900">
                      {visitData.location.accuracy.toFixed(2)} metros
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <MapPin className="mx-auto mb-4 text-gray-300" size={64} />
                <p className="text-gray-600 mb-6">
                  No se pudo obtener la ubicación
                </p>
                <button
                  onClick={getLocation}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 inline-flex items-center gap-2"
                >
                  <RotateCcw size={20} />
                  Intentar de Nuevo
                </button>
              </div>
            )}
          </div>
        )}

        {/* Paso 3: Foto ANTES */}
        {currentStep === 3 && (
          <CameraCapture
            onCapture={handleFotoAntesCapture}
            label="Foto ANTES"
            required={true}
            initialImage={visitData.fotoAntes?.base64 || null}
          />
        )}

        {/* Paso 4: Foto DESPUÉS */}
        {currentStep === 4 && (
          <CameraCapture
            onCapture={handleFotoDespuesCapture}
            label="Foto DESPUÉS"
            required={true}
            initialImage={visitData.fotoDespues?.base64 || null}
          />
        )}

        {/* Paso 5: Resumen */}
        {currentStep === 5 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Resumen de la Visita
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Cliente</h3>
                <p className="text-lg font-bold text-gray-900">{visitData.cliente}</p>
              </div>

              {visitData.notas && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Notas</h3>
                  <p className="text-gray-900">{visitData.notas}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Ubicación GPS</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-mono text-gray-900">
                    {visitData.location?.lat.toFixed(6)}, {visitData.location?.lng.toFixed(6)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Foto ANTES</h3>
                  {visitData.fotoAntes && (
                    <img
                      src={visitData.fotoAntes.url}
                      alt="Foto Antes"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Foto DESPUÉS</h3>
                  {visitData.fotoDespues && (
                    <img
                      src={visitData.fotoDespues.url}
                      alt="Foto Después"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex gap-4">
          {currentStep > 1 && (
            <button
              onClick={() => goToStep((currentStep - 1) as Step)}
              className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-medium hover:bg-gray-200 flex items-center justify-center gap-2"
            >
              <ChevronLeft size={20} />
              Anterior
            </button>
          )}
          
          {currentStep < 5 ? (
            <button
              onClick={() => goToStep((currentStep + 1) as Step)}
              disabled={!canGoNext()}
              className={`flex-1 py-4 rounded-xl font-medium flex items-center justify-center gap-2 ${
                canGoNext()
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Siguiente
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSending}
              className={`flex-1 py-4 rounded-xl font-medium flex items-center justify-center gap-2 ${
                isSending
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {isSending ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Enviar Visita
                </>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
