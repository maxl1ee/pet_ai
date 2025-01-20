import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.tsx';
import { Input } from './ui/input.tsx';
import { Button } from './ui/button.tsx';


const PetSimulator = () => {
  const [petStatus, setPetStatus] = useState(null);
  const [interaction, setInteraction] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPetImage, setCurrentPetImage] = useState("https://t3.ftcdn.net/jpg/00/15/59/70/360_F_15597098_JrRcwScsZ9h3bi2WmStErDqdigWTF6yO.jpg");
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    fetchPetStatus();
    const interval = setInterval(fetchPetStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const generateNewPetImage = async (emotion, movement, baseImageUrl) => {
    setImageLoading(true);
    try {
      console.log('Sending request with:', { emotion, movement, baseImageUrl,  }, JSON.stringify({
        emotion: emotion,
        movement: movement,
        base_image_url: baseImageUrl
      })); // Debug log
      
      const response = await fetch('http://localhost:8000/pet/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emotion: emotion,
          movement: movement,
          base_image_url: baseImageUrl
        }),
      });
  
      const data = await response.json();
      console.log("cp1", data.output);

      if (!response.ok) {
        console.error('API Error:', data);
        throw new Error(data.detail || 'Failed to generate image');
      }
      
      setCurrentPetImage(data.output);
    } catch (err) {
      console.error('Failed to generate new pet image:', err);
      setCurrentPetImage(baseImageUrl);
      setError(`Image generation failed: ${err.message}`);
    } finally {
      setImageLoading(false);
    }
  };

  const fetchPetStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/pet/status');
      const data = await response.json();
      setPetStatus(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch pet status');
      console.error('Error:', err);
    }
  };

  const handleInteraction = async (e) => {
    e.preventDefault();
    if (!interaction.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/pet/interact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interaction }),
      });
      
      if (!response.ok) throw new Error('Interaction failed');
      
      const result = await response.json();
      await fetchPetStatus();
      
      // Generate new image based on the interaction result
      await generateNewPetImage(
        result.emotion,
        result.movement,
        currentPetImage
      );
      
      setInteraction('');
      setError(null);
    } catch (err) {
      setError('Failed to interact with pet');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!petStatus) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Virtual Pet Simulator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-64 h-64 mx-auto mb-8">
            {imageLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <img
                src={currentPetImage}
                alt="Virtual Pet"
                className="w-full h-full object-contain transition-all duration-500"
              />
            )}
          </div>

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Gender:</p>
                <p>{petStatus.gender}</p>
              </div>
              <div>
                <p className="font-semibold">Age:</p>
                <p>{petStatus.age} years</p>
              </div>
            </div>

            <div>
              <p className="font-semibold">Personalities:</p>
              <div className="flex flex-wrap gap-2">
                {petStatus.personalities.map((trait, index) => (
                  <span key={index} className="bg-primary/10 px-2 py-1 rounded-full text-sm">
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold">Current Status:</p>
              <p>Physical: {petStatus.physical_status}</p>
              <p>Mental: {petStatus.mental_status}</p>
              <p>Reaction: {petStatus.current_react}</p>
            </div>
          </div>

          <form onSubmit={handleInteraction} className="flex gap-2">
            <Input
              type="text"
              value={interaction}
              onChange={(e) => setInteraction(e.target.value)}
              placeholder="What would you like to do with the pet?"
              disabled={loading || imageLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || imageLoading}>
              {loading || imageLoading ? 'Processing...' : 'Interact'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PetSimulator;