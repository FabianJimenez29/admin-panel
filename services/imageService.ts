import { getSupabaseClient } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface ImageUploadResult {
  url: string;
  path: string;
  success: boolean;
  message?: string;
}

export const imageService = {
  uploadProductImage: async (file: File): Promise<ImageUploadResult> => {
    try {
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      if (!file) {
        throw new Error('No se proporcionó ningún archivo');
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('El archivo es demasiado grande. Máximo 5MB permitido.');
      }

      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Formato de archivo no válido. Use JPEG, PNG, GIF o WEBP.');
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw new Error(`Error al subir imagen: ${error.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return {
        url: publicUrlData.publicUrl,
        path: filePath,
        success: true,
        message: 'Imagen subida correctamente'
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(errorMessage);
    }
  },

  deleteProductImage: async (imagePath: string): Promise<{ success: boolean; message: string }> => {
    try {
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      if (!imagePath) {
        throw new Error('No se proporcionó la ruta de la imagen');
      }

      const { error } = await supabase.storage
        .from('product-images')
        .remove([imagePath]);

      if (error) {
        throw new Error(`Error al eliminar imagen: ${error.message}`);
      }

      return {
        success: true,
        message: 'Imagen eliminada correctamente'
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(errorMessage);
    }
  }
};