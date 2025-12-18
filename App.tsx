import React, { useState, useRef, useEffect } from 'react';
import { GameState, StoryTurn, World } from './types';
import { generateStoryTurn, generateSceneImage } from './services/geminiService';
import { Button } from './components/Button';
import { TextArea } from './components/Input';
import { Loader } from './components/Loader';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [userInput, setUserInput] = useState('');
  
  // Multi-world state
  const [worlds, setWorlds] = useState<World[]>([]);
  const [activeWorldId, setActiveWorldId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  // Load worlds on mount
  useEffect(() => {
    try {
      const savedWorlds = localStorage.getItem('dreamweaver_worlds');
      if (savedWorlds) {
        setWorlds(JSON.parse(savedWorlds));
      }
    } catch (e) {
      console.error("Failed to load worlds", e);
    }
  }, []);

  // Optimized Auto-save
  const saveWorlds = (updatedWorlds: World[]) => {
    try {
      setWorlds(updatedWorlds);
      localStorage.setItem('dreamweaver_worlds', JSON.stringify(updatedWorlds));
    } catch (e) {
      console.error("Storage limit reached", e);
      alert("Storage full! Older dreams might not be saving correctly. Consider deleting old dreams.");
    }
  };

  // Scroll to bottom on new turn
  useEffect(() => {
    if (bottomRef.current && (gameState === GameState.PLAYING || gameState === GameState.LOADING)) {
      // Small timeout to ensure DOM is rendered
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [worlds, activeWorldId, gameState]);

  // Get current active world data
  const activeWorld = worlds.find(w => w.id === activeWorldId);

  const handleStartDream = async () => {
    if (!userInput.trim()) return;
    
    setGameState(GameState.LOADING);
    const requestId = Date.now();
    requestRef.current = requestId;
    
    try {
      const storyData = await generateStoryTurn("New Dream Started", userInput);
      const imageBase64 = await generateSceneImage(storyData.imagePrompt);

      if (requestRef.current !== requestId) return;

      const newTurn: StoryTurn = {
        id: Date.now().toString(),
        sceneDescription: storyData.sceneDescription,
        imageBase64: imageBase64 || null,
        options: storyData.options,
      };

      // Create new world object
      const newWorld: World = {
        id: Date.now().toString(),
        title: userInput.length > 40 ? userInput.substring(0, 40) + '...' : userInput,
        createdAt: Date.now(),
        lastPlayedAt: Date.now(),
        history: [],
        currentTurn: newTurn,
        previewText: storyData.sceneDescription.substring(0, 100) + '...',
      };

      // Auto-save new world
      const newWorldsList = [newWorld, ...worlds];
      saveWorlds(newWorldsList);
      
      setActiveWorldId(newWorld.id);
      setGameState(GameState.PLAYING);
      setUserInput(''); // Clear input

    } catch (e) {
      if (requestRef.current !== requestId) return;
      console.error(e);
      setGameState(GameState.ERROR);
    }
  };

  const handleChoice = async (choice: string) => {
    if (!activeWorld || !activeWorld.currentTurn) return;

    setGameState(GameState.LOADING);
    const requestId = Date.now();
    requestRef.current = requestId;

    try {
      const context = `
        Current Situation: ${activeWorld.currentTurn.sceneDescription}
        Player Choice: ${choice}
      `;

      const storyData = await generateStoryTurn(context, choice);
      const imageBase64 = await generateSceneImage(storyData.imagePrompt);

      if (requestRef.current !== requestId) return;

      const newTurn: StoryTurn = {
        id: Date.now().toString(),
        sceneDescription: storyData.sceneDescription,
        imageBase64: imageBase64 || null,
        options: storyData.options,
      };

      // OPTIMIZATION: Clear image from the previous turn before moving to history
      const historicTurn: StoryTurn = { 
        ...activeWorld.currentTurn, 
        userChoice: choice,
        imageBase64: null 
      };
      
      const updatedWorld: World = {
        ...activeWorld,
        lastPlayedAt: Date.now(),
        history: [...activeWorld.history, historicTurn],
        currentTurn: newTurn,
        previewText: storyData.sceneDescription.substring(0, 100) + '...',
      };

      // Move updated world to top of list
      const otherWorlds = worlds.filter(w => w.id !== updatedWorld.id);
      const sortedWorlds = [updatedWorld, ...otherWorlds];
      
      saveWorlds(sortedWorlds);
      setGameState(GameState.PLAYING);

    } catch (e) {
      if (requestRef.current !== requestId) return;
      console.error(e);
      setGameState(GameState.ERROR);
    }
  };

  const loadWorld = (worldId: string) => {
    setActiveWorldId(worldId);
    setGameState(GameState.PLAYING);
    // Cancel any pending generation if we switch
    requestRef.current = 0;
  };

  const deleteWorld = (e: React.MouseEvent, worldId: string) => {
    e.stopPropagation();
    if (confirm("Dissolve this dream forever?")) {
      const remaining = worlds.filter(w => w.id !== worldId);
      saveWorlds(remaining);
      if (activeWorldId === worldId) {
        setActiveWorldId(null);
        setGameState(GameState.START);
      }
    }
  };

  const handleBackToLibrary = () => {
    setActiveWorldId(null);
    setGameState(GameState.START);
    requestRef.current = 0;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 selection:bg-white/20">
      <main className="max-w-2xl mx-auto px-6 py-12 min-h-[calc(100vh-4rem)] flex flex-col">
        
        {/* Header */}
        <header className="mb-12 flex items-center justify-between z-50 relative">
            <h1 className="text-xl font-semibold tracking-tight text-white/90 cursor-pointer" onClick={handleBackToLibrary}>
                DreamWeaver AI
            </h1>
            <div className="flex gap-4 items-center">
                {(gameState === GameState.PLAYING || gameState === GameState.LOADING || gameState === GameState.ERROR) && (
                    <button 
                        onClick={handleBackToLibrary}
                        className="text-xs text-zinc-500 hover:text-white transition-colors uppercase tracking-widest font-bold flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="4" height="16" x="6" y="4"/><rect width="4" height="16" x="14" y="4"/><path d="M2 4h20"/><path d="M2 20h20"/></svg>
                        Library
                    </button>
                )}
            </div>
        </header>

        {/* Start / Library Screen */}
        {gameState === GameState.START && (
          <div className="flex-1 flex flex-col animate-in fade-in duration-700">
            
            <section className="mb-16">
              <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                Dream a new world
              </h2>
              <TextArea 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Describe a setting, a character, or a moment..."
                rows={3}
                className="mb-4 text-lg"
                autoFocus
              />
              <Button onClick={handleStartDream} disabled={!userInput.trim()}>
                Begin Dream
              </Button>
            </section>

            {worlds.length > 0 && (
              <section className="flex-1">
                <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-2">
                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
                    Existing Dreams
                    </h3>
                    <span className="text-xs text-zinc-600">{worlds.length} worlds</span>
                </div>
                
                <div className="grid gap-4">
                  {worlds.map((world) => (
                    <div 
                      key={world.id}
                      onClick={() => loadWorld(world.id)}
                      className="group relative bg-zinc-900/40 border border-zinc-800/60 p-5 rounded-xl cursor-pointer hover:bg-zinc-900 hover:border-zinc-600 transition-all active:scale-[0.99] overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-2 relative z-10">
                        <h4 className="font-semibold text-zinc-200 group-hover:text-white truncate pr-8 text-lg">
                          {world.title}
                        </h4>
                        <span className="text-xs text-zinc-600 font-mono">
                          {new Date(world.lastPlayedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-500 line-clamp-2 mb-2 relative z-10 h-10">
                        {world.previewText}
                      </p>
                      
                      <button 
                        onClick={(e) => deleteWorld(e, world.id)}
                        className="absolute top-4 right-4 text-zinc-700 hover:text-red-500 transition-colors p-2 z-20 hover:bg-zinc-800 rounded-full"
                        title="Delete dream"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>

                      {/* Subtle hover gradient */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-800/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Initial Loading Screen (Creating first world) */}
        {gameState === GameState.LOADING && !activeWorld && (
           <div className="flex-1 flex flex-col justify-center items-center">
             <Loader />
           </div>
        )}

        {/* Game Area */}
        {/* We render this if playing OR if loading within an existing world */}
        {(gameState === GameState.PLAYING || (gameState === GameState.LOADING && activeWorld)) && activeWorld && (
          <div className="flex-1 flex flex-col gap-8 pb-12">
            
            {/* History of Moves */}
            {activeWorld.history.map((turn) => (
              <div key={turn.id} className="opacity-60 hover:opacity-100 transition-opacity duration-500 border-l-2 border-zinc-800 pl-4 py-2">
                <p className="text-zinc-400 mb-3 italic text-sm leading-relaxed">{turn.sceneDescription}</p>
                <div className="flex items-center gap-2 text-white text-sm font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
                    {turn.userChoice}
                </div>
              </div>
            ))}

            {/* Loading Indicator inside game (for next turn) */}
            {gameState === GameState.LOADING && (
              <Loader />
            )}

            {/* Active Turn (Hidden while loading next turn to avoid confusion, or keep visible? 
                Better to hide current active turn if we are generating a new one? 
                Actually, usually we keep seeing the old one until new one arrives, 
                but here the Loader takes up a lot of space. Let's stack them or hide.
                Given the design, let's keep showing the OLD turn until the NEW one arrives, 
                BUT append the loader at the bottom.
                
                However, to match the previous behavior requested:
                If loading, we just show the loader at the bottom.
            */}
            {gameState === GameState.PLAYING && activeWorld.currentTurn && (
              <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-700 fade-in">
                
                {/* Image Card */}
                <div className="relative group overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl border border-zinc-800/50">
                    <div className="aspect-video w-full bg-zinc-900 relative">
                        {activeWorld.currentTurn.imageBase64 ? (
                            <img 
                                src={`data:image/png;base64,${activeWorld.currentTurn.imageBase64}`} 
                                alt="Scene illustration" 
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-700 bg-zinc-900/50">
                                <span className="text-sm font-medium tracking-widest uppercase opacity-50">Visualizing...</span>
                            </div>
                        )}
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60"></div>
                    </div>
                </div>

                {/* Story Text */}
                <div className="prose prose-invert prose-lg max-w-none">
                  <p className="leading-relaxed text-zinc-100">
                    {activeWorld.currentTurn.sceneDescription}
                  </p>
                </div>

                {/* Divider */}
                <div className="h-px bg-zinc-800 w-full my-2"></div>

                {/* Options */}
                <div className="grid grid-cols-1 gap-3">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">What do you do?</span>
                  {activeWorld.currentTurn.options.map((option, idx) => (
                    <Button 
                      key={idx} 
                      variant="secondary" 
                      onClick={() => handleChoice(option)}
                      className="text-left justify-start h-auto py-4 px-5 text-base border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/80 transition-all"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            <div ref={bottomRef} className="h-4" />
          </div>
        )}

        {/* Error State */}
        {gameState === GameState.ERROR && (
           <div className="flex-1 flex flex-col justify-center items-center text-center animate-in fade-in">
             <div className="w-16 h-16 rounded-full bg-red-900/20 text-red-500 flex items-center justify-center mb-4 border border-red-900/50">
               !
             </div>
             <h3 className="text-xl font-bold text-white mb-2">Connection Lost</h3>
             <p className="text-zinc-400 mb-6 max-w-xs mx-auto">The neural link was severed. The dream could not be sustained.</p>
             <Button onClick={handleBackToLibrary}>Return to Library</Button>
           </div>
        )}

      </main>
    </div>
  );
};

export default App;