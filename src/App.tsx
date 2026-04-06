/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Camera, 
  Sparkles, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  ArrowRight,
  User,
  Briefcase,
  Building2,
  Trees,
  Star
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Types ---

interface HeadshotStyle {
  id: string;
  name: string;
  description: string;
  prompt: string;
  icon: React.ReactNode;
  previewColor: string;
}

const STYLES: HeadshotStyle[] = [
  {
    id: 'corporate-grey',
    name: 'Corporate Studio',
    description: 'Neutral grey backdrop with professional studio lighting.',
    prompt: 'A high-end professional corporate thumbnail. The person is wearing a sharp, well-tailored business suit. Background is a clean, neutral grey studio backdrop with professional three-point lighting. High resolution, 8k, sharp focus, professional photography.',
    icon: <Briefcase className="w-5 h-5" />,
    previewColor: 'bg-slate-500'
  },
  {
    id: 'tech-office',
    name: 'Modern Tech',
    description: 'Bright office setting with a soft, professional bokeh.',
    prompt: 'A modern professional thumbnail in a bright, airy tech office. Soft bokeh background with hints of glass and plants. The person is wearing smart casual professional attire. Natural, clean lighting. High resolution, professional DSLR quality.',
    icon: <Building2 className="w-5 h-5" />,
    previewColor: 'bg-blue-400'
  },
  {
    id: 'outdoor-natural',
    name: 'Natural Light',
    description: 'Warm, approachable look in a soft outdoor setting.',
    prompt: 'A professional thumbnail in soft, golden-hour outdoor light. Background is a lush, out-of-focus garden or park. The person looks warm and approachable. High-end portrait photography, natural skin tones, sharp eyes.',
    icon: <Trees className="w-5 h-5" />,
    previewColor: 'bg-emerald-400'
  },
  {
    id: 'executive-dark',
    name: 'Executive Noir',
    description: 'Dramatic lighting with a dark, textured background.',
    prompt: 'A powerful executive thumbnail with dramatic chiaroscuro lighting. Dark textured studio background. The person looks confident and authoritative. High contrast, professional editorial style, 8k resolution.',
    icon: <Star className="w-5 h-5" />,
    previewColor: 'bg-zinc-800'
  }
];

// --- Components ---

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<HeadshotStyle>(STYLES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setResultImage(null);
      setError(null);
    }
  };

  const generateHeadshot = async () => {
    if (!preview) return;

    setIsGenerating(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Data = preview.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: file?.type || 'image/jpeg',
              },
            },
            {
              text: `Transform this photo into a professional 4K thumbnail. ${selectedStyle.prompt}. Maintain the person's facial features and identity but enhance the lighting, background, and attire to match the style.`,
            },
          ],
        },
      });

      let foundImage = false;
      const candidates = response.candidates;
      if (candidates && candidates.length > 0 && candidates[0].content.parts) {
        for (const part of candidates[0].content.parts) {
          if (part.inlineData) {
            setResultImage(`data:image/png;base64,${part.inlineData.data}`);
            foundImage = true;
            break;
          }
        }
      }

      if (!foundImage) {
        throw new Error("No image was generated. Please try a different style or photo.");
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "An unexpected error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `headshot-${selectedStyle.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResultImage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-8 flex justify-between items-center mix-blend-difference">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <Camera className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-light tracking-tighter uppercase">Lumina Thumbnails</span>
        </div>
        <div className="hidden md:flex gap-8 text-[11px] uppercase tracking-[0.2em] font-medium opacity-60">
          <a href="#" className="hover:opacity-100 transition-opacity">Showcase</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Pricing</a>
          <a href="#" className="hover:opacity-100 transition-opacity">About</a>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* Left Column: Controls */}
          <div className="space-y-12">
            <header className="space-y-4">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-6xl md:text-8xl font-light leading-[0.9] tracking-tighter"
              >
                Create Your <br />
                <span className="italic font-serif">Thumbnail with AI</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-zinc-400 text-lg max-w-md font-light leading-relaxed"
              >
                Transform your photos into high-impact, professional thumbnails in seconds using advanced neural imaging.
              </motion.p>
            </header>

            <section className="space-y-8">
              {/* Step 1: Upload */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono py-1 px-2 border border-zinc-800 rounded text-zinc-500">01</span>
                  <h3 className="text-sm uppercase tracking-widest font-semibold">Upload Source</h3>
                </div>
                
                {!preview ? (
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative h-64 border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors hover:border-zinc-600"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Upload className="w-8 h-8 mb-4 text-zinc-500 group-hover:text-white transition-colors" />
                    <p className="text-zinc-500 group-hover:text-zinc-300 transition-colors text-sm">Drop your selfie here or click to browse</p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </motion.div>
                ) : (
                  <div className="relative group rounded-2xl overflow-hidden border border-zinc-800 aspect-square max-w-sm mx-auto lg:mx-0">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={reset}
                        className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"
                      >
                        <User className="w-5 h-5" />
                      </button>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                )}
              </div>

              {/* Step 2: Style */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono py-1 px-2 border border-zinc-800 rounded text-zinc-500">02</span>
                  <h3 className="text-sm uppercase tracking-widest font-semibold">Select Aesthetic</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {STYLES.map((style) => (
                    <motion.button
                      key={style.id}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedStyle(style)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        selectedStyle.id === style.id 
                          ? 'border-white bg-zinc-900' 
                          : 'border-zinc-800 bg-transparent hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2 rounded-lg ${style.previewColor} bg-opacity-20 text-white`}>
                          {style.icon}
                        </div>
                        {selectedStyle.id === style.id && (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <h4 className="font-medium text-sm mb-1">{style.name}</h4>
                      <p className="text-[11px] text-zinc-500 leading-tight">{style.description}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Action */}
              <motion.button
                disabled={!preview || isGenerating}
                onClick={generateHeadshot}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-5 rounded-full flex items-center justify-center gap-3 text-sm font-semibold tracking-widest uppercase transition-all ${
                  !preview || isGenerating
                    ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-zinc-200'
                }`}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Neural Processing...
                  </>
                ) : (
                  <>
                    Generate Thumbnail
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>

              {error && (
                <p className="text-red-400 text-xs text-center font-mono">{error}</p>
              )}
            </section>
          </div>

          {/* Right Column: Result */}
          <div className="lg:sticky lg:top-32">
            <div className="relative aspect-[4/5] bg-zinc-900 rounded-[2rem] overflow-hidden border border-zinc-800 shadow-2xl">
              <AnimatePresence mode="wait">
                {!resultImage && !isGenerating && (
                  <motion.div 
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center"
                  >
                    <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center mb-6">
                      <Sparkles className="w-10 h-10 text-zinc-600" />
                    </div>
                    <h3 className="text-xl font-light mb-2">Your Thumbnail Awaits</h3>
                    <p className="text-zinc-500 text-sm max-w-xs">Upload a photo and select a style to see your professional thumbnail here.</p>
                  </motion.div>
                )}

                {isGenerating && (
                  <motion.div 
                    key="generating"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center"
                  >
                    <div className="relative mb-8">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="w-32 h-32 border-t-2 border-r-2 border-white rounded-full"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-white animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium tracking-tight">Refining Identity</h3>
                      <p className="text-zinc-400 text-xs font-mono uppercase tracking-widest">Applying {selectedStyle.name} Layer</p>
                    </div>
                    
                    {/* Progress simulation */}
                    <div className="mt-12 w-48 h-[1px] bg-zinc-800 overflow-hidden">
                      <motion.div 
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-full h-full bg-white"
                      />
                    </div>
                  </motion.div>
                )}

                {resultImage && (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 group"
                  >
                    <img src={resultImage} alt="Generated Headshot" className="w-full h-full object-cover" />
                    
                    <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1">Generated Thumbnail</p>
                          <h4 className="text-lg font-medium">{selectedStyle.name}</h4>
                        </div>
                        <button 
                          onClick={downloadImage}
                          className="p-4 bg-white text-black rounded-full hover:scale-110 transition-transform shadow-xl"
                        >
                          <Download className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Features list */}
            <div className="mt-12 grid grid-cols-3 gap-8">
              <div className="text-center space-y-2">
                <div className="text-white font-medium text-lg">4K</div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">Resolution</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-white font-medium text-lg">AI</div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">Neural Engine</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-white font-medium text-lg">3s</div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">Processing</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-40">
            <Camera className="w-4 h-4" />
            <span className="text-xs tracking-tighter uppercase">Lumina AI © 2026</span>
          </div>
          <div className="flex gap-8 text-[10px] uppercase tracking-widest font-medium opacity-40">
            <a href="#" className="hover:opacity-100">Privacy</a>
            <a href="#" className="hover:opacity-100">Terms</a>
            <a href="#" className="hover:opacity-100">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
