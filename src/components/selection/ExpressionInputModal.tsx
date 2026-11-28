import React, { useEffect, useRef, useState } from "react";
import { Camera, MapPin, RefreshCw, X } from "lucide-react";
import { Button } from "../ui/Button";
import { useExperienceStore } from "../../store/experienceStore";
import { IdentityData } from "../../types";

interface ExpressionInputModalProps {
  expressionId: string | null;
  onClose: () => void;
}

export const ExpressionInputModal: React.FC<ExpressionInputModalProps> = ({
  expressionId,
  onClose,
}) => {
  const { expressionInputs, updateExpressionInputs } = useExperienceStore();

  // Camera state for share-face
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Local form states
  const [mindText, setMindText] = useState(expressionInputs.mindText || "");
  const [lifeText, setLifeText] = useState(expressionInputs.lifeText || "");
  const [locationText, setLocationText] = useState(expressionInputs.locationText || "");
  const [locationMode, setLocationMode] = useState<"gps" | "search">("gps");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    { display_name: string; lat: string; lon: string }[]
  >([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [identity, setIdentity] = useState<IdentityData>(
    expressionInputs.identity || {
      name: "",
      birthPlaceDate: "",
      address: "",
      school: "",
      graduation: "",
    }
  );

  // Stop camera helper
  const stopCamera = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Start camera when share-face is opened and no photo is taken yet
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraError("Unable to access camera. Please allow camera permission.");
    }
  };

  useEffect(() => {
    if (expressionId === "share-face" && !expressionInputs.facePhoto) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [expressionId, expressionInputs.facePhoto]);

  // Auto-detect location when share-location is opened
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
        setLocationText(coords);
        updateExpressionInputs({ locationText: coords });
        setLocating(false);
      },
      () => {
        setLocationError("Location access denied. You can enter your city/location manually.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (expressionId === "share-location" && !expressionInputs.locationText && locationMode === "gps") {
      detectLocation();
    }
  }, [expressionId]);

  // Debounced Nominatim location autocomplete
  useEffect(() => {
    if (expressionId !== "share-location" || locationMode !== "search") return;
    const q = searchQuery.trim();
    if (q.length < 3) {
      setSearchResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(Array.isArray(data) ? data : []);
        }
      } catch {
        // ignore abort / network error
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, locationMode, expressionId]);

  if (!expressionId) return null;

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Un-mirror front-facing camera capture
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      updateExpressionInputs({ facePhoto: dataUrl });
      stopCamera();
    }
  };

  const handleStartCountdown = () => {
    if (countdown !== null) return;
    let remaining = 5;
    setCountdown(remaining);
    countdownTimerRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
        setCountdown(null);
        handleCapturePhoto();
      } else {
        setCountdown(remaining);
      }
    }, 1000);
  };

  const handleRetakePhoto = () => {
    updateExpressionInputs({ facePhoto: undefined });
    startCamera();
  };

  const handleSaveAndClose = () => {
    if (expressionId === "speak-mind") {
      updateExpressionInputs({ mindText: mindText.trim() });
    } else if (expressionId === "share-life") {
      updateExpressionInputs({ lifeText: lifeText.trim() });
    } else if (expressionId === "share-location") {
      updateExpressionInputs({ locationText: locationText.trim() });
    } else if (expressionId === "share-identity") {
      updateExpressionInputs({ identity });
    }
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-nordic-border rounded-2xl max-w-lg w-full p-6 shadow-xl text-nordic-ink">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-nordic-border/50">
          <h3 className="text-lg font-semibold tracking-tight">
            {expressionId === "share-face" && "Share My Face"}
            {expressionId === "speak-mind" && "Speak My Mind"}
            {expressionId === "share-location" && "Share My Location"}
            {expressionId === "share-life" && "Share My Life"}
            {expressionId === "share-identity" && "Share My Identity"}
          </h3>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-lg text-nordic-muted hover:text-nordic-ink hover:bg-nordic-bg cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="py-5 space-y-4">
          {expressionId === "share-face" && (
            <div className="space-y-4">
              {cameraError ? (
                <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">{cameraError}</div>
              ) : expressionInputs.facePhoto ? (
                <div className="space-y-3">
                  <img
                    src={expressionInputs.facePhoto}
                    alt="Captured face"
                    className="w-full max-h-72 object-cover rounded-xl border border-nordic-border"
                  />
                  <Button
                    variant="secondary"
                    size="md"
                    icon={<RefreshCw size={16} />}
                    onClick={handleRetakePhoto}
                  >
                    Retake Photo
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full max-h-72 object-cover rounded-xl bg-black border border-nordic-border -scale-x-100"
                    />
                    {countdown !== null && (
                      <div className="absolute inset-0 rounded-xl bg-black/45 flex items-center justify-center">
                        <span className="text-7xl font-bold text-white drop-shadow-lg animate-pulse">
                          {countdown}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    disabled={countdown !== null}
                    icon={<Camera size={16} />}
                    onClick={handleStartCountdown}
                  >
                    {countdown !== null ? `Taking photo in ${countdown}...` : "Take Photo (5s)"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {expressionId === "speak-mind" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-nordic-ink">
                Apa yang ingin diutarakan?
              </label>
              <textarea
                rows={4}
                value={mindText}
                onChange={(e) => setMindText(e.target.value)}
                placeholder="Write your thoughts, opinions, or message..."
                className="w-full rounded-xl border border-nordic-border p-3 text-sm focus:outline-none focus:border-nordic-ink"
              />
            </div>
          )}

          {expressionId === "share-location" && (
            <div className="space-y-3">
              {/* Mode selector: GPS vs Autocomplete Search */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-nordic-bg border border-nordic-border/60">
                <button
                  type="button"
                  onClick={() => {
                    setLocationMode("gps");
                    if (!locationText) detectLocation();
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    locationMode === "gps"
                      ? "bg-nordic-ink text-[#FAF8F5]"
                      : "text-nordic-muted hover:text-nordic-ink"
                  }`}
                >
                  Koordinat Saat Ini
                </button>
                <button
                  type="button"
                  onClick={() => setLocationMode("search")}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    locationMode === "search"
                      ? "bg-nordic-ink text-[#FAF8F5]"
                      : "text-nordic-muted hover:text-nordic-ink"
                  }`}
                >
                  Cari Lokasi
                </button>
              </div>

              {locationMode === "gps" ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-nordic-ink flex items-center gap-1.5">
                      <MapPin size={16} /> Detected Location
                    </span>
                    <button
                      type="button"
                      onClick={detectLocation}
                      disabled={locating}
                      className="text-xs underline text-nordic-muted hover:text-nordic-ink cursor-pointer"
                    >
                      {locating ? "Detecting..." : "Refresh GPS"}
                    </button>
                  </div>
                  {locationError && <p className="text-xs text-amber-700">{locationError}</p>}
                  <input
                    type="text"
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                    placeholder={locating ? "Detecting coordinates..." : "e.g. -6.20880, 106.84560"}
                    className="w-full rounded-xl border border-nordic-border p-3 text-sm focus:outline-none focus:border-nordic-ink"
                  />
                </>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ketik nama tempat / alamat (min. 3 huruf)..."
                    className="w-full rounded-xl border border-nordic-border p-3 text-sm focus:outline-none focus:border-nordic-ink"
                  />
                  {searching && <p className="text-xs text-nordic-muted">Mencari lokasi...</p>}
                  {searchResults.length > 0 && (
                    <div className="max-h-44 overflow-y-auto rounded-xl border border-nordic-border divide-y divide-nordic-border/50 bg-white">
                      {searchResults.map((item, idx) => {
                        const lat = parseFloat(item.lat).toFixed(5);
                        const lon = parseFloat(item.lon).toFixed(5);
                        const shortLabel = item.display_name.split(",").slice(0, 2).join(",").trim();
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              const formatted = `${shortLabel} (${lat}, ${lon})`;
                              setLocationText(formatted);
                              setSearchQuery(shortLabel);
                              setSearchResults([]);
                              updateExpressionInputs({ locationText: formatted });
                            }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-nordic-bg transition-colors cursor-pointer"
                          >
                            <div className="font-medium text-nordic-ink">{shortLabel}</div>
                            <div className="text-[11px] text-nordic-muted truncate">
                              {item.display_name}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {locationText && (
                    <p className="text-xs text-nordic-muted">
                      Dipilih: <span className="font-medium text-nordic-ink">{locationText}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {expressionId === "share-life" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-nordic-ink">
                Ceritakan kehidupanmu secara singkat atau panjang juga boleh
              </label>
              <textarea
                rows={5}
                value={lifeText}
                onChange={(e) => setLifeText(e.target.value)}
                placeholder="Tell your story..."
                className="w-full rounded-xl border border-nordic-border p-3 text-sm focus:outline-none focus:border-nordic-ink"
              />
            </div>
          )}

          {expressionId === "share-identity" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-nordic-muted mb-1">Nama</label>
                <input
                  type="text"
                  value={identity.name}
                  onChange={(e) => setIdentity({ ...identity, name: e.target.value })}
                  placeholder="Full name"
                  className="w-full rounded-lg border border-nordic-border px-3 py-2 text-sm focus:outline-none focus:border-nordic-ink"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-nordic-muted mb-1">
                  Tempat, Tanggal Lahir
                </label>
                <input
                  type="text"
                  value={identity.birthPlaceDate}
                  onChange={(e) => setIdentity({ ...identity, birthPlaceDate: e.target.value })}
                  placeholder="e.g. Jakarta, 12 Mei 2000"
                  className="w-full rounded-lg border border-nordic-border px-3 py-2 text-sm focus:outline-none focus:border-nordic-ink"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-nordic-muted mb-1">Alamat</label>
                <input
                  type="text"
                  value={identity.address}
                  onChange={(e) => setIdentity({ ...identity, address: e.target.value })}
                  placeholder="Current address"
                  className="w-full rounded-lg border border-nordic-border px-3 py-2 text-sm focus:outline-none focus:border-nordic-ink"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-nordic-border/50 flex justify-end">
          <Button variant="primary" size="md" onClick={handleSaveAndClose}>
            Save &amp; Done
          </Button>
        </div>
      </div>
    </div>
  );
};
