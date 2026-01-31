import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import jsQR from 'jsqr';
import {
    Shield, Camera, QrCode, ArrowLeft,
    AlertCircle, Loader2
} from 'lucide-react';
import { qrLogin } from '../store/authSlice';
import Swal from 'sweetalert2';

/**
 * HIGH-PERFORMANCE INTELLIGENCE-GRADE QR SCANNER
 * 
 * Optimized for:
 * 1. Mobile screen reflection & moiré patterns
 * 2. 1:1 Pixel accuracy (no CSS scaling distortion)
 * 3. Low latency (< 300ms decode target)
 * 4. Single-trigger login safety
 */
const QRLogin = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading } = useSelector((state) => state.auth);

    // Refs for non-React managed resources
    const videoRef = useRef(null);
    const canvasRef = useRef(null); // Offscreen canvas for decoding
    const streamRef = useRef(null);
    const requestRef = useRef(null);
    const isProcessingRef = useRef(false);
    const frameCountRef = useRef(0);

    const [error, setError] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [isEngaging, setIsEngaging] = useState(false);
    const [scannedImage, setScannedImage] = useState(null);

    // --- 1. Camera Initialization ---
    const startCamera = async () => {
        if (isEngaging || cameraActive) return;
        setIsEngaging(true);
        setError(null);

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setError("Secure connection (HTTPS) or browser support missing.");
            setIsEngaging(false);
            return;
        }

        try {
            console.log("CRMS_SCANNER: Requesting camera stream...");
            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log("CRMS_SCANNER: Stream acquired.");
            streamRef.current = stream;

            // Activate component view first so videoRef captures the element
            setCameraActive(true);
            setIsEngaging(false);
        } catch (err) {
            console.error("Camera Init Error:", err);
            setError(err.name === 'NotAllowedError' ? "Camera permission denied." : "Critical hardware sensor failure.");
            setIsEngaging(false);
            setCameraActive(false);
        }
    };

    /**
     * CRITICAL BUG FIX: Attachment Effect
     * This effect runs once the video element is rendered and handles the
     * attachment of the stream to the DOM element.
     */
    useEffect(() => {
        if (cameraActive && streamRef.current && videoRef.current) {
            console.log("CRMS_SCANNER: Attaching stream to video element...");
            const video = videoRef.current;

            // Reset any existing source
            video.srcObject = streamRef.current;

            const handlePlay = async () => {
                try {
                    await video.play();
                    console.log("CRMS_SCANNER: Playback started successfully.");
                    startScanLoop();
                } catch (playErr) {
                    console.error("Playback failed:", playErr);
                    // Safari/Mobile Chrome sometimes require explicit user gesture for play()
                    // even if muted, but muted should generally work.
                }
            };

            video.onloadedmetadata = handlePlay;
            // Fallback for some browsers where metadata event is flaky
            handlePlay();
        }
    }, [cameraActive]);

    // --- 2. Intelligent Scan Loop (Offscreen) ---
    const startScanLoop = () => {
        if (requestRef.current) return;
        console.log("CRMS_SCANNER: Starting intelligent scan loop...");

        const tick = () => {
            const video = videoRef.current;
            const canvas = canvasRef.current || document.createElement('canvas'); // Use offscreen canvas

            if (video && video.readyState === video.HAVE_ENOUGH_DATA && !isProcessingRef.current) {
                // Throttled decoding (7.5 times/sec)
                frameCountRef.current++;
                if (frameCountRef.current % 4 === 0) {
                    processFrame(video, canvas);
                }
            }
            requestRef.current = requestAnimationFrame(tick);
        };
        requestRef.current = requestAnimationFrame(tick);
    };

    const processFrame = (video, canvas) => {
        const width = video.videoWidth;
        const height = video.videoHeight;

        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(video, 0, 0, width, height);

        const scanWidth = Math.floor(width * 0.7);
        const scanHeight = Math.floor(height * 0.7);
        const sx = (width - scanWidth) / 2;
        const sy = (height - scanHeight) / 2;

        const imageData = ctx.getImageData(sx, sy, scanWidth, scanHeight);

        // Manual Preprocessing (Grayscale + Contrast)
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const contrast = 1.3;
            const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
            data[i] = data[i + 1] = data[i + 2] = factor * (avg - 128) + 128;
        }

        const code = jsQR(data, scanWidth, scanHeight, { inversionAttempts: "dontInvert" });

        if (code) {
            // Capture the successful frame
            const snapshot = canvas.toDataURL('image/jpeg', 0.8);
            setScannedImage(snapshot);
            handleSuccess(code.data, snapshot);
        }
    };

    const handleSuccess = async (decodedData, snapshot) => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;
        stopCamera();

        try {
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            const payload = JSON.parse(decodedData);
            const result = await dispatch(qrLogin({
                userId: payload.userId,
                token: payload.token,
                deviceInfo: navigator.userAgent
            })).unwrap();

            if (result.user) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Portal Initialized',
                    text: `Authorized as ${result.user.fullName}`,
                    imageUrl: snapshot,
                    imageWidth: 200,
                    imageHeight: 200,
                    imageAlt: 'Scanned QR Code',
                    background: '#0a0e1a',
                    color: '#fff',
                    timer: 15000,
                    showConfirmButton: true,
                    confirmButtonColor: '#00d4ff',
                    backdrop: `rgba(0,212,255,0.4)`
                });
                navigate(result.user.role === 'analyst' ? '/analyst-dashboard' : '/dashboard');
            }
        } catch (err) {
            console.error("QR Auth Failed:", err);
            setError(err.message || "Credential authentication failed.");
            isProcessingRef.current = false;
        }
    };

    const stopCamera = () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
        if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        setCameraActive(false);
    };

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const resetScanner = () => {
        isProcessingRef.current = false;
        setScannedImage(null);
        setError(null);
        startCamera();
    };

    return (
        <div className="min-h-screen bg-[#020408] text-white flex flex-col font-sans relative overflow-hidden">
            {/* Cybernetic Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#00d4ff22_0%,transparent_70%)]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            </div>

            <header className="relative z-10 px-8 h-16 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl">
                <Link to="/" className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-cyan-500 flex items-center justify-center rounded-lg shadow-lg">
                        <Shield className="text-black" size={18} />
                    </div>
                    <span className="text-lg font-black tracking-tighter italic">CRMS ACCESS</span>
                </Link>
                <Link to="/login" className="text-[10px] font-bold text-gray-500 hover:text-cyan-400 uppercase tracking-widest">Traditional PIN</Link>
            </header>

            <main className="relative z-10 flex-1 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0a0c12]/90 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl text-center relative overflow-hidden"
                    >
                        <div className="mb-6">
                            <h2 className="text-xl font-bold uppercase tracking-tight">Identity Verification</h2>
                            <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">Instant Biometric Sync Active</p>
                        </div>

                        <div className="relative aspect-square w-full max-w-[280px] mx-auto group">
                            <AnimatePresence mode="wait">
                                {!cameraActive && !error && !isLoading && (
                                    <motion.button
                                        key="init"
                                        onClick={startCamera}
                                        disabled={isEngaging}
                                        className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-cyan-500/5 hover:bg-cyan-500/10 border-2 border-dashed border-cyan-500/30 rounded-[2rem] transition-all"
                                    >
                                        {isEngaging ? (
                                            <Loader2 className="text-cyan-400 animate-spin" size={40} />
                                        ) : (
                                            <Camera className="text-cyan-400" size={40} />
                                        )}
                                        <span className="text-[10px] font-black tracking-[0.3em] text-cyan-400 uppercase">
                                            {isEngaging ? 'Engaging Sensor...' : 'Initialize Portal'}
                                        </span>
                                    </motion.button>
                                )}

                                {cameraActive && (
                                    <motion.div
                                        key="viewport"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="relative w-full h-full rounded-[2rem] overflow-hidden border border-cyan-500/30 bg-black"
                                    >
                                        {/* DIRECT VIDEO PREVIEW - Best for compatibility */}
                                        <video
                                            ref={videoRef}
                                            playsInline
                                            autoPlay
                                            muted
                                            className="w-full h-full object-cover"
                                        />

                                        {/* AR HUD */}
                                        <div className="absolute inset-0 pointer-events-none">
                                            <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-cyan-400/50" />
                                            <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-cyan-400/50" />
                                            <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-cyan-400/50" />
                                            <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-cyan-400/50" />

                                            <motion.div
                                                animate={{ top: ['15%', '85%', '15%'] }}
                                                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                                className="absolute inset-x-6 h-[1px] bg-cyan-400/30 shadow-[0_0_8px_#00d4ff] z-10"
                                            />
                                        </div>

                                        {/* Captured Frame Overlay */}
                                        {scannedImage && (
                                            <div className="absolute inset-0 z-20 bg-black">
                                                <img
                                                    src={scannedImage}
                                                    alt="Scanned Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {isLoading && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 backdrop-blur-md rounded-[2rem] z-50">
                                        <Loader2 className="text-cyan-400 animate-spin" size={48} />
                                        <span className="text-[9px] font-black tracking-[0.5em] text-cyan-400 uppercase">Authenticating...</span>
                                    </div>
                                )}

                                {error && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-red-500/10 rounded-[2rem] z-50">
                                        <AlertCircle className="text-red-500 mb-4" size={40} />
                                        <p className="text-xs font-bold text-red-400 mb-6 uppercase tracking-wider leading-relaxed">{error}</p>
                                        <button onClick={resetScanner} className="px-6 py-2 bg-red-500/20 text-red-400 rounded-full text-[9px] font-black tracking-widest uppercase">Retry Engagement</button>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-3">
                            <Shield className="text-cyan-500/50" size={12} />
                            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">End-to-End Encrypted Tunnel</span>
                        </div>
                    </motion.div>
                </div>
            </main>

            <footer className="p-6 text-center text-gray-700 text-[8px] uppercase tracking-[0.4em] font-bold">
                CRMS Intelligence Node • Authorized Access Only
            </footer>
        </div>
    );
};

export default QRLogin;
