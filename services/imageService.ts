import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface ImageUploadResult {
  url: string;
  path: string;
  success: boolean;
  message?: string;
}

export const imageService = {
  /**
   * Sube una imagen directamente al bucket 'product-images' de Supabase
   */
  uploadProductImage: async (file: File): Promise<ImageUploadResult> => {
    try {
      // Validaciones del archivo
      if (!file) {
        throw new Error('No se proporcionó ningún archivo');
      }

      // Validar tamaño (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('El archivo es demasiado grande. Máximo 5MB permitido.');
      }

      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Formato de archivo no válido. Use JPEG, PNG, GIF o WEBP.');
      }

      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      console.log('📤 Subiendo imagen a Supabase Storage:', {
        bucket: 'product-images',
        path: filePath,
        size: file.size,
        type: file.type
      });

      // Verificar conexión con Supabase
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        console.error('❌ Error al conectar con Supabase Storage:', bucketsError);
        throw new Error(`Error de conexión con Storage: ${bucketsError.message}`);
      }
      
      console.log('🪣 Buckets disponibles:', buckets?.map(b => b.name));
      
      const productBucket = buckets?.find(b => b.name === 'product-images');
      if (!productBucket) {
        throw new Error('El bucket "product-images" no existe. Verifica la configuración en Supabase.');
      }

      // Subir archivo a Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false, // No sobrescribir si ya existe
        });

      if (error) {
        console.error('❌ Error al subir archivo:', error);
        throw new Error(`Error al subir imagen: ${error.message}`);
      }

      if (!data) {
        throw new Error('No se recibieron datos de la subida');
      }

      console.log('✅ Archivo subido exitosamente:', data);

      // Obtener URL pública (bucket público)
      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        throw new Error('No se pudo obtener la URL pública de la imagen');
      }

      console.log('🔗 URL pública generada:', publicUrlData.publicUrl);

      return {
        url: publicUrlData.publicUrl,
        path: filePath,
        success: true,
        message: 'Imagen subida correctamente'
      };

    } catch (error) {
      console.error('💥 Error en uploadProductImage:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al subir imagen';
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Elimina una imagen del bucket 'product-images' de Supabase
   */
  deleteProductImage: async (imagePath: string): Promise<{ success: boolean; message: string }> => {
    try {
      if (!imagePath) {
        throw new Error('No se proporcionó la ruta de la imagen');
      }

      console.log('🗑️ Eliminando imagen de Supabase Storage:', imagePath);

      const { error } = await supabase.storage
        .from('product-images')
        .remove([imagePath]);

      if (error) {
        console.error('❌ Error al eliminar imagen:', error);
        throw new Error(`Error al eliminar imagen: ${error.message}`);
      }

      console.log('✅ Imagen eliminada exitosamente');

      return {
        success: true,
        message: 'Imagen eliminada correctamente'
      };

    } catch (error) {
      console.error('💥 Error en deleteProductImage:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al eliminar imagen';
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Lista todas las imágenes en el bucket 'product-images'
   */
  listProductImages: async (): Promise<string[]> => {
    try {
      const { data, error } = await supabase.storage
        .from('product-images')
        .list('products', {
          limit: 100,
          offset: 0,
        });

      if (error) {
        throw new Error(`Error al listar imágenes: ${error.message}`);
      }

      return data?.map(file => `products/${file.name}`) || [];

    } catch (error) {
      console.error('Error al listar imágenes:', error);
      throw error;
    }
  }
};