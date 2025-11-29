export interface ItemTemplate {
  id: number;
  name: string;
  type: string;
  value: string | null;
  image_path: string | null;
  quantity: number | null;
  name_in_kit: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateItemTemplateDto {
  name: string;
  type: string;
  value?: string;
  quantity?: number;
  name_in_kit?: string;
}

export interface UpdateItemTemplateDto {
  name?: string;
  type?: string;
  value?: string;
  quantity?: number;
  name_in_kit?: string;
  image_path?: string;
}
