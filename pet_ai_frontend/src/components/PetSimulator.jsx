import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.tsx';
import { Input } from './ui/input.tsx';
import { Button } from './ui/button.tsx';
import petService from '../services/petService';

const formatStatus = (status) => {
  if (typeof status === 'object' && status !== null) {
    if (status.description && status.level) {
      return `${status.description} (Level: ${status.level})`;
    }
    return JSON.stringify(status);
  }
  return status;
};


const PetSimulator = () => {
  const [petStatus, setPetStatus] = useState(null);
  const [interaction, setInteraction] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPetImage, setCurrentPetImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);

  const generatePetImage = async (emotion, movement, baseDescription) => {
    setImageLoading(true);
    try {
      const response = await fetch('http://localhost:8000/pet/67a9b0f6e1006741fdfefd25/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.predictions && data.predictions.length > 0) {
        const base64Image = data.predictions[0].bytesBase64Encoded;
        setCurrentPetImage(`data:image/png;base64,${base64Image}`);
      } else {
        throw new Error('No image generated');
      }
    } catch (err) {
      console.error('Failed to generate pet image:', err);
      setError(`Image generation failed: ${err.message}`);
    } finally {
      setImageLoading(false);
    }
  };

  const fetchPetStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/pet/67a9b0f6e1006741fdfefd25/status');
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
      const response = await fetch('http://localhost:8000/pet/67a9b0f6e1006741fdfefd25/interact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interaction }),
      });
      
      if (!response.ok) throw new Error('Interaction failed');
      
      // First get the updated status
      await fetchPetStatus();
      
      // Then generate new image based on the updated status
      if (petStatus) {
        await generatePetImage();
      }
      
      setInteraction('');
      setError(null);
    } catch (err) {
      setError('Failed to interact with pet');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize pet status and generate initial image when component first loads
  useEffect(() => {
    const initializePet = async () => {
      await fetchPetStatus();
      if (!currentPetImage) {
        console.log(petStatus);
        await generatePetImage();
      }
    };
    initializePet();
  }, []);
  
  
  

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
            ) : currentPetImage ? (
              <img
                src={currentPetImage}
                alt="Virtual Pet"
                className="w-full h-full object-contain transition-all duration-500"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                Generating pet image...
              </div>
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
                    {trait.description} (Level: {trait.level})
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold">Current Emotion:</p>
              <p>Physical: {petStatus.current_react.physical_status}</p>
              <p>Mental: {petStatus.current_react.mental_status}</p>
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