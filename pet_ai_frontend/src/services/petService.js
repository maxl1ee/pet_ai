// src/services/petService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000';

class PetService {
    constructor() {
        this.api = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    async getPetStatus() {
        try {
            const response = await this.api.get('/pet/status');
            return response.data;
        } catch (error) {
            console.error('Error fetching pet status:', error);
            throw error;
        }
    }

    async interactWithPet(interaction) {
        try {
            const response = await this.api.post('/pet/interact', {
                interaction: interaction
            });
            return response.data;
        } catch (error) {
            console.error('Error during pet interaction:', error);
            throw error;
        }
    }

    async generatePetImage(emotion, movement, baseDescription) {
        try {
            const response = await this.api.post('/pet/generate-image', {
                emotion: emotion,
                movement: movement,
                base_description: baseDescription
            });
            return response.data;
        } catch (error) {
            console.error('Error generating pet image:', error);
            throw error;
        }
    }
}

export default new PetService();