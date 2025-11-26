import api from './api';

export interface Giveaway {
  id: number;
  description: string;
  url: string;
  image_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateGiveawayDto {
  description: string;
  url: string;
}

export interface UpdateGiveawayDto {
  description?: string;
  url?: string;
}

export const giveawaysApi = {
  getOne: async (): Promise<Giveaway | null> => {
    const response = await api.get('/giveaways');
    return response.data;
  },

  create: async (data: CreateGiveawayDto, image?: File): Promise<Giveaway> => {
    const formData = new FormData();
    if (data.description) formData.append('description', data.description);
    if (data.url) formData.append('url', data.url);
    if (image) {
      formData.append('image', image);
    }
    const response = await api.post('/giveaways', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id: number, data: UpdateGiveawayDto, image?: File): Promise<Giveaway> => {
    const formData = new FormData();
    if (data.description) formData.append('description', data.description);
    if (data.url) formData.append('url', data.url);
    if (image) {
      formData.append('image', image);
    }
    const response = await api.patch(`/giveaways/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/giveaways/${id}`);
  },
};

