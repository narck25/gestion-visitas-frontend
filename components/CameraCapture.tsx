"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, X, RotateCw, AlertCircle, CheckCircle } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (imageBase64: string) => void;
  label?: string;
  required?: boolean;
  initialImage?: string | null;
}

export default function CameraCapture({
  onCapture,
  label = "Captura de Foto",
  required = false,
  initialImage = null,
}: CameraCaptureProps) {
  const [photo, setPhoto] = useState<string | null>(initialImage);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Limpiar stream al desmontar
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    console.log("Intentando activar cámara...");
    
    if (!navigator.mediaDevices?.getUserMedia) {
      const errorMsg = "Tu navegador no soporta acceso a la cámara";
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    setIsLoadingCamera(true);
    setError(null);
    setSuccess(null);

    try {
      console.log("Solicitando permisos de cámara...");
      
      // Primero detener cualquier cámara activa
      stopCamera();
      
      // Solicitar acceso a la cámara
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Cámara trasera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      console.log("Cámara accedida exitosamente, stream:", stream);

      if (videoRef.current) {
        console.log("Configurando elemento video...");
        videoRef.current.srcObject = stream;
        
        // Esperar a que el video esté listo
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata cargada, reproduciendo...");
          videoRef.current?.play().then(() => {
            console.log("Video reproduciéndose exitosamente");
            setIsLoadingCamera(false);
            setIsCameraActive(true);
            setSuccess("📸 Cámara activada. Presiona 'Capturar Foto' para tomar una imagen.");
          }).catch((playError) => {
            console.error("Error reproduciendo video:", playError);
            setError("Error al reproducir video de la cámara");
            setIsLoadingCamera(false);
            setIsCameraActive(false);
          });
        };
        
        videoRef.current.onerror = (error) => {
          console.error("Error en elemento video:", error);
          setError("Error en el elemento de video");
          setIsLoadingCamera(false);
          setIsCameraActive(false);
        };
      } else {
        console.error("Elemento video no encontrado");
        setError("Elemento de video no disponible");
        setIsLoadingCamera(false);
        setIsCameraActive(false);
      }
    } catch (err: any) {
      console.error("Error accediendo a la cámara:", err);
      
      let errorMessage = "No se pudo acceder a la cámara";
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = "Permiso de cámara denegado. Por favor habilita el acceso a la cámara en la configuración de tu navegador.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = "No se encontró ninguna cámara disponible en el dispositivo.";
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = "La cámara está siendo usada por otra aplicación o no está disponible.";
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = "No se puede cumplir con las restricciones de la cámara solicitada.";
      } else if (err.name === 'SecurityError') {
        errorMessage = "Acceso a la cámara bloqueado por razones de seguridad. Asegúrate de usar HTTPS.";
      }
      
      setError(errorMessage);
      setIsLoadingCamera(false);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir a base64
    const imageBase64 = canvas.toDataURL("image/jpeg", 0.9);
    
    setPhoto(imageBase64);
    onCapture(imageBase64);
    setSuccess("✅ Foto capturada exitosamente");
    stopCamera();
  };

  const selectFromGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Por favor selecciona un archivo de imagen válido");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("La imagen es demasiado grande. Máximo 10MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageBase64 = e.target?.result as string;
        setPhoto(imageBase64);
        onCapture(imageBase64);
        setSuccess("✅ Foto seleccionada exitosamente");
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setError(null);
    setSuccess(null);
    stopCamera();
  };

  const retakePhoto = () => {
    removePhoto();
    startCamera();
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Camera className="text-green-600" size={24} />
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </h2>
        <div className="flex gap-2">
          {!photo && (
            <>
              <button
                onClick={startCamera}
                disabled={isLoadingCamera}
                className={`px-4 py-2 rounded-lg font-medium ${
                  isLoadingCamera
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isLoadingCamera ? (
                  <>
                    <RotateCw className="animate-spin inline mr-2" size={16} />
                    Iniciando...
                  </>
                ) : (
                  "Activar Cámara"
                )}
              </button>
              <button
                onClick={selectFromGallery}
                className="px-4 py-2 rounded-lg font-medium bg-purple-600 text-white hover:bg-purple-700"
              >
                Galería
              </button>
            </>
          )}
          {photo && (
            <button
              onClick={retakePhoto}
              className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700"
            >
              Volver a Capturar
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </div>

      {!photo && (
        <div className="relative bg-black rounded-xl overflow-hidden mb-4">
          <video
            ref={videoRef}
            className="w-full h-64 object-cover"
            playsInline
            muted
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <button
              onClick={capturePhoto}
              disabled={!isCameraActive}
              className={`px-6 py-3 rounded-full font-bold ${
                !isCameraActive
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-900 hover:bg-gray-100"
              }`}
            >
              📸 Capturar Foto
            </button>
          </div>
          {!isCameraActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center text-white">
                <Camera size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-lg font-medium">Cámara no activa</p>
                <p className="text-sm opacity-75">Presiona "Activar Cámara" para comenzar</p>
              </div>
            </div>
          )}
        </div>
      )}

      {photo && (
        <div className="relative bg-gray-100 rounded-xl overflow-hidden mb-4">
          <img
            src={photo}
            alt="Foto capturada"
            className="w-full h-64 object-contain"
          />
          <button
            onClick={removePhoto}
            className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
          >
            <X size={20} />
          </button>
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            Foto capturada
          </div>
        </div>
      )}

      <div className="text-sm text-gray-600 space-y-2">
        <p>💡 <strong>Instrucciones:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Presiona "Activar Cámara" para activar la cámara trasera</li>
          <li>Presiona "Capturar Foto" para tomar la imagen</li>
          <li>O usa "Galería" para seleccionar una foto existente</li>
          <li>La foto se mostrará en preview</li>
        </ul>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {(error || success) && (
        <div className={`mt-4 p-4 rounded-xl ${error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
          <div className="flex items-start gap-3">
            {error ? (
              <AlertCircle className="text-red-600 mt-0.5" size={20} />
            ) : (
              <CheckCircle className="text-green-600 mt-0.5" size={20} />
            )}
            <div>
              <p className={`font-medium ${error ? 'text-red-800' : 'text-green-800'}`}>
                {error || success}
              </p>
              {error && (
                <p className="text-sm text-red-600 mt-1">
                  Por favor corrige el error e intenta nuevamente.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {required && !photo && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            ⚠️ Este campo es requerido. Por favor captura o selecciona una foto.
          </p>
        </div>
      )}
    </div>
  );
}