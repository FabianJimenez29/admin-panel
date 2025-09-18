// Servicio para manejo de imágenes usando el backend
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface ImageUploadResult {
  url: string;
  path: string;
  success: boolean;
  message?: string;
}

export const imageService = {
  /**
   * Sube una imagen al backend que la procesará y la subirá a Supabase
   */
  uploadProductImage: async (file: File): Promise<ImageUploadResult> => {
    try {
      console.log('📤 Subiendo imagen al backend...');
      
      // Validaciones del lado del cliente
      if (!file) {
        throw new Error('No se proporcionó ningún archivo');
      }

      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de archivo no válido. Solo se permiten imágenes JPEG, PNG y WebP');
      }

      // Validar tamaño (5MB máximo)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('El archivo es demasiado grande. Máximo 5MB');
      }

      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('image', file);

      console.log('� Enviando archivo al servidor...', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Enviar al backend
      const response = await fetch(`${API_URL}/upload-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error de red' }));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Imagen subida exitosamente:', result);

      if (!result.success) {
        throw new Error(result.message || 'Error al subir imagen');
      }

      return {
        url: result.url,
        path: result.path,
        success: true,
        message: result.message || 'Imagen subida exitosamente'
      };

    } catch (error) {
      console.error('💥 Error en uploadProductImage:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      throw new Error(`Error al subir imagen: ${errorMessage}`);
    }
  },

  /**
   * Elimina una imagen del backend que la eliminará de Supabase
   */
  deleteProductImage: async (imagePath: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('🗑️ Eliminando imagen del backend:', imagePath);
      
      if (!imagePath) {
        throw new Error('No se proporcionó la ruta de la imagen');
      }

      const response = await fetch(`${API_URL}/upload-image`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imagePath }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error de red' }));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Imagen eliminada exitosamente:', result);

      return {
        success: true,
        message: result.message || 'Imagen eliminada exitosamente'
      };

    } catch (error) {
      console.error('💥 Error al eliminar imagen:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      throw new Error(`Error al eliminar imagen: ${errorMessage}`);
    }
  }
};