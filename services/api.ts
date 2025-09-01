import axios from 'axios';
import toast from 'react-hot-toast';

// Usamos la variable de entorno para obtener la URL del backend
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout for cold starts
});

// Interceptor para añadir el token a las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Asegurar que config.headers exista
    config.headers = config.headers || {};
    // Añadir el token como Bearer token
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    // Cualquier código de estado que esté dentro del rango de 2xx causa la ejecución de esta función
    return response;
  },
  (error) => {
    // Cualquier código de estado que esté fuera del rango de 2xx causa la ejecución de esta función
    console.error("API Error:", error);
    
    if (error.code === 'ECONNABORTED') {
      // Error de timeout - no mostrar toast para evitar spam
      console.error('Timeout error - request took too long');
      return Promise.reject(error);
    }
    
    if (error.response) {
      // La solicitud se hizo y el servidor respondió con un código de estado
      // que cae fuera del rango 2xx
      const status = error.response.status;
      
      if (status === 401 || status === 403) {
        // Problema de autenticación o autorización
        toast.error('Sesión expirada o no autorizada');
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        window.location.href = '/login';
      } else if (status === 404) {
        toast.error('Recurso no encontrado');
      } else if (status >= 500) {
        toast.error('Error del servidor. Inténtalo más tarde');
      }
    } else if (error.request) {
      // La solicitud se hizo pero no se recibió respuesta
      console.error('No response received from server');
      // No mostrar toast para evitar spam en timeouts
    } else {
      // Algo sucedió en la configuración de la solicitud que desencadenó un error
      console.error('Request configuration error');
    }
    
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },
};

export const appointmentService = {
  getAppointments: async () => {
    try {
      const response = await api.get('/quotes');
      return response.data;
    } catch (error) {
      console.error('Error en getAppointments:', error);
      throw error;
    }
  },
  
  getAppointmentsByDate: async (date: string) => {
    try {
      const response = await api.get(`/quotes?date=${date}`);
      return response.data;
    } catch (error) {
      console.error('Error en getAppointmentsByDate:', error);
      throw error;
    }
  },
  
  updateAppointmentStatus: async (id: number, status: string, tecnico?: string, observaciones?: string) => {
    try {
      // Usar método PATCH para actualización parcial
      const response = await api.patch(`/quotes/${id}`, { status, tecnico, observaciones });
      return response.data;
    } catch (error) {
      console.error('Error en updateAppointmentStatus:', error);
      throw error;
    }
  },
};

export const productService = {
  getProducts: async () => {
    try {
      const response = await api.get('/products');
      return response.data;
    } catch (error: unknown) {
      console.error('Error al obtener productos:', error);
      if (error instanceof Error && 'code' in error && error.code === 'ECONNABORTED') {
        console.warn('Timeout al obtener productos - usando datos de muestra');
        return null; // Retorna null para que use datos de muestra
      }
      throw error;
    }
  },
  
  getProductById: async (id: string) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener producto con id ${id}:`, error);
      throw error;
    }
  },
  
  createProduct: async (productData: {
    name: string;
    description?: string;
    price: number;
    stock: number;
    category_id?: string;
    image_url?: string;
  }) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  },
  
  updateProduct: async (id: string, productData: {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    category_id?: string;
    image_url?: string;
  }) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar producto con id ${id}:`, error);
      throw error;
    }
  },
  
  deleteProduct: async (id: string) => {
    try {
      // Usar query parameter para el ID
      const response = await api.delete(`/products?id=${id}`);
      return response.data;
    } catch (error: unknown) {
      console.error(`Error al eliminar producto con id ${id}:`, error);
      throw error;
    }
  },

  uploadProductImage: async (imageFile: File) => {
    try {
      // Usar la URL específica para subir imágenes definida en .env
      const uploadUrl = process.env.NEXT_PUBLIC_IMAGE_UPLOAD_URL || `${API_URL}/products/upload-image`;
      
      console.log('Uploading image to:', uploadUrl);
      
      const formData = new FormData();
      formData.append('image', imageFile);
      
      // Use a direct Axios instance for this request with specific CORS settings
      const response = await axios.post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Add a longer timeout for file uploads
        timeout: 30000,
      });
      
      // Handle both formats of responses (for backward compatibility)
      if (!response.data && response.data.url === undefined) {
        throw new Error('El servidor no devolvió una URL para la imagen');
      }
      
      // If image upload fails, provide a fallback (for demo/development purposes)
      if (process.env.NODE_ENV === 'development' && !response.data.url) {
        console.warn('Usando URL de imagen de muestra para desarrollo');
        return {
          url: `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/300/300`,
          path: 'sample/image.jpg'
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error al subir imagen:', error);
      
      // In development mode, provide a fallback image
      if (process.env.NODE_ENV === 'development') {
        console.warn('Error al subir imagen. Usando imagen de muestra para desarrollo');
        return {
          url: `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/300/300`,
          path: 'sample/image.jpg'
        };
      }
      
      throw error;
    }
  },
  
  deleteProductImage: async (imagePath: string) => {
    try {
      // Usar la URL del backend definida en variables de entorno
      const deleteUrl = `${API_URL}/products/delete-image`;
      
      console.log('Deleting image at path:', imagePath);
      
      const response = await axios.delete(deleteUrl, {
        data: { path: imagePath },
        withCredentials: false
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      
      // In development mode, just pretend it worked
      if (process.env.NODE_ENV === 'development') {
        console.warn('Error al eliminar imagen. En modo desarrollo, simulamos éxito.');
        return { success: true, message: 'Imagen eliminada (simulado)' };
      }
      
      throw error;
    }
  }
};

export const categoryService = {
  getCategories: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error: unknown) {
      console.error('Error al obtener categorías:', error);
      if (error instanceof Error && 'code' in error && error.code === 'ECONNABORTED') {
        console.warn('Timeout al obtener categorías - usando datos de muestra');
        return null; // Retorna null para que use datos de muestra
      }
      throw error;
    }
  },
  
  getCategoryById: async (id: string) => {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener categoría con id ${id}:`, error);
      throw error;
    }
  },
  
  createCategory: async (categoryData: {
    name: string;
    description?: string;
  }) => {
    try {
      const response = await api.post('/categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Error al crear categoría:', error);
      throw error;
    }
  },
  
  updateCategory: async (id: string, categoryData: {
    name?: string;
    description?: string;
  }) => {
    try {
      const response = await api.put(`/categories?id=${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar categoría con id ${id}:`, error);
      throw error;
    }
  },
  
  deleteCategory: async (id: string) => {
    try {
      const response = await api.delete(`/categories?id=${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar categoría con id ${id}:`, error);
      throw error;
    }
  },
};

export const adminService = {
  getAdmins: async () => {
    try {
      const response = await api.get('/admins');
      return response.data;
    } catch (error) {
      console.error('Error al obtener administradores:', error);
      throw error;
    }
  },
  
  createAdmin: async (adminData: {
    nombre: string;
    email: string;
    password: string;
    telefono?: string;
    provincia?: string;
    canton?: string;
    distrito?: string;
  }) => {
    try {
      const response = await api.post('/admins', adminData);
      return response.data;
    } catch (error) {
      console.error('Error al crear administrador:', error);
      throw error;
    }
  },
  
  updateAdmin: async (id: number, adminData: {
    nombre?: string;
    email?: string;
    password?: string;
    telefono?: string;
    provincia?: string;
    canton?: string;
    distrito?: string;
  }) => {
    try {
      const response = await api.put(`/admins?id=${id}`, adminData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar administrador:', error);
      throw error;
    }
  },
  
  deleteAdmin: async (id: number) => {
    try {
      const response = await api.delete(`/admins?id=${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar administrador:', error);
      throw error;
    }
  },
};

export default api;
