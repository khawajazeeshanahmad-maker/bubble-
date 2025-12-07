import React, { useState } from 'react';
import { Layers, Zap } from 'lucide-react';
import { AppState } from './types';
import { StepUpload } from './components/StepUpload';
import { StepConfigure } from './components/StepConfigure';
import { StepResult } from './components/StepResult';
import { processImageWithGemini } from './services/geminiService';
import { resizeImage } from './utils/imageUtils';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    step: 'upload',
    image: null,
    targetWidth: 4,
    targetHeight: 6,
    backgroundColor: '#FFFFFF',
    processedImage: null,
    error: null,
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageSelect = (base64: string) => {
    setState(prev => ({ ...prev, image: base64, step: 'configure', error: null }));
  };

  const handleConvert = async (width: number, height: number, color: string) => {
    if (!state.image) return;

    setIsProcessing(true);
    setState(prev => ({ ...prev, error: null }));

    try {
      // 1. Send to Gemini for Visual Processing (Background Removal + Enhancement)
      console.log('Sending to Gemini...');
      const geminiResultBase64 = await processImageWithGemini(state.image, color);

      // 2. Resize to exact inches locally (Canvas)
      console.log('Resizing...');
      const finalImage = await resizeImage(geminiResultBase64, width, height);

      setState(prev => ({
        ...prev,
        processedImage: finalImage,
        targetWidth: width,
        targetHeight: height,
        backgroundColor: color,
        step: 'result'
      }));
    } catch (err: any) {
      console.error(err);
      setState(prev => ({ ...prev, error: err.message || "Something went wrong during processing." }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setState({
      step: 'upload',
      image: null,
      targetWidth: 4,
      targetHeight: 6,
      backgroundColor: '#FFFFFF',
      processedImage: null,
      error: null,
    });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="font-bold text-xl tracking-tight">Gemini Photo Studio</h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
            <Zap className="w-3 h-3 fill-current" />
            Powered by Gemini Nano
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Error Message */}
        {state.error && (
          <div className="mb-8 bg-red-500/10 border border-red-500/20 text-red-200 px-6 py-4 rounded-xl max-w-lg text-center animate-fade-in">
            <p className="font-medium">Processing Error</p>
            <p className="text-sm opacity-80 mt-1">{state.error}</p>
            <button 
              onClick={() => setState(s => ({ ...s, error: null }))} 
              className="text-xs underline mt-2 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dynamic Content based on Step */}
        <div className="w-full z-10">
          {state.step === 'upload' && (
            <StepUpload onImageSelect={handleImageSelect} />
          )}

          {state.step === 'configure' && state.image && (
            <StepConfigure 
              image={state.image} 
              onConvert={handleConvert} 
              onBack={() => setState(s => ({ ...s, step: 'upload' }))}
              isProcessing={isProcessing}
            />
          )}

          {state.step === 'result' && state.processedImage && (
            <StepResult 
              processedImage={state.processedImage} 
              onReset={handleReset}
              width={state.targetWidth}
              height={state.targetHeight}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-600 text-sm">
        <p>&copy; {new Date().getFullYear()} Gemini Photo Studio. Built with Google GenAI SDK.</p>
      </footer>
    </div>
  );
};

export default App;