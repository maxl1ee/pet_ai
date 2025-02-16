import React, { useState, useCallback } from 'react';
import DogModelViewer from './DogModelViewer';
import BoneAnimationController from './BoneAnimationController';

const DogAnimationApp = () => {
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [animationController, setAnimationController] = useState(null);

  const handleModelLoad = useCallback((bones, mixer) => {
    console.log('Model loaded, creating animation controller');
    setAnimationController(new BoneAnimationController(bones, mixer));
  }, []);

  const handleCommandSubmit = async (e) => {
    e.preventDefault();
    if (!animationController || isProcessing) return;

    setIsProcessing(true);
    try {
      await animationController.parseCommand(command);
    } catch (error) {
      console.error('Animation error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1">
        <DogModelViewer onLoad={handleModelLoad} />
      </div>
      
      <div className="p-4 bg-white shadow-lg">
        <form onSubmit={handleCommandSubmit} className="flex gap-2">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="輸入動作指令（例如：開心地搖尾巴）"
            className="flex-1 p-2 border rounded"
            disabled={isProcessing || !animationController}
          />
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
            disabled={isProcessing || !animationController}
          >
            {isProcessing ? '執行中...' : '執行動作'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DogAnimationApp;