"use client";

import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';
import { Product, Category } from '@/types';
import { productService, categoryService } from '@/services/api';
import toast from 'react-hot-toast';
import Image from 'next/image';

// Datos de muestra para usar cuando la API no está disponible
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Proteína Whey 1kg',
    description: 'Proteína de suero de alta calidad para deportistas',
    price: 49.99,
    stock: 25,
    category_id: '1',
    image_url: 'https://images.unsplash.com/photo-1593095948071-474c5cc2589d?q=80&w=200&auto=format'
  },
  {
    id: '2',
    name: 'Mancuernas 5kg (par)',
    description: 'Par de mancuernas para entrenamiento de fuerza',
    price: 35.50,
    stock: 12,
    category_id: '2',
    image_url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=200&auto=format'
  },
  {
    id: '3',
    name: 'Cuerda para saltar',
    description: 'Cuerda para entrenamiento cardiovascular',
    price: 15.99,
    stock: 30,
    category_id: '3',
    image_url: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?q=80&w=200&auto=format'
  },
  {
    id: '4',
    name: 'Guantes de entrenamiento',
    description: 'Guantes para proteger las manos durante el entrenamiento',
    price: 22.50,
    stock: 15,
    category_id: '3',
    image_url: 'https://images.unsplash.com/photo-1516846235361-7a332bc5664c?q=80&w=200&auto=format'
  }
];

const sampleCategories: Category[] = [
  {
    id: '1',
    name: 'Suplementos',
    description: 'Productos para nutrición deportiva'
  },
  {
    id: '2',
    name: 'Equipamiento',
    description: 'Equipamiento para gimnasio'
  },
  {
    id: '3',
    name: 'Accesorios',
    description: 'Accesorios para entrenamiento'
  }
];

export default function Productos() {
  // Estado para productos y categorías
  const [productos, setProductos] = useState<Product[]>([]);
  const [categorias, setCategorias] = useState<Category[]>([]);
  
  // Estado para filtros
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [busqueda, setBusqueda] = useState<string>('');
  
  // Estado de carga y error
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para modales
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Estado para formularios
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    image_url: '',
    image_path: '' // Almacenar la ruta de la imagen en Supabase
  });
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });
  
  // Estado para manejo de archivos de imagen
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Estado para indicar operaciones en curso
  const [saving, setSaving] = useState<boolean>(false);
  const [showCategoriesSection, setShowCategoriesSection] = useState<boolean>(false);
  
    // Cargar productos y categorías al montar el componente
  useEffect(() => {
    const loadData = async () => {
      console.log('🚀 Iniciando carga de datos...');
      setLoading(true);
      setError(null);
      
      try {
        // Cargar categorías primero
        let categoriasData;
        try {
          console.log('📂 Cargando categorías...');
          categoriasData = await categoryService.getCategories();
          console.log('✅ Categorías obtenidas:', categoriasData);
        } catch (error: unknown) {
          console.error('❌ Error al cargar categorías:', error);
          if (error instanceof Error && 'code' in error && error.code === 'ECONNABORTED') {
            console.warn('⏰ Timeout al cargar categorías - usando datos de muestra');
            categoriasData = null;
          } else {
            throw error;
          }
        }
        
        if (categoriasData && Array.isArray(categoriasData)) {
          setCategorias(categoriasData);
          console.log('✅ Categorías establecidas en estado');
        } else {
          console.warn("⚠️ Usando categorías de muestra");
          setCategorias(sampleCategories);
        }
        
        // Cargar productos
        let productsData;
        try {
          console.log('📦 Cargando productos...');
          productsData = await productService.getProducts();
          console.log('✅ Productos obtenidos:', productsData);
        } catch (error: unknown) {
          console.error('❌ Error al cargar productos:', error);
          if (error instanceof Error && 'code' in error && error.code === 'ECONNABORTED') {
            console.warn('⏰ Timeout al cargar productos - usando datos de muestra');
            productsData = null;
          } else {
            throw error;
          }
        }
        
        // Verificar si los datos son válidos
        if (productsData && Array.isArray(productsData)) {
          setProductos(productsData);
          console.log('✅ Productos establecidos en estado:', productsData.length, 'productos');
        } else {
          // Si no hay datos o no son válidos, usar datos de muestra
          console.warn('⚠️ Usando productos de muestra');
          setProductos(sampleProducts);
          toast.custom(() => (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-md">
              <div className="flex items-center">
                <div className="text-yellow-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    {productsData === null ? 'Timeout al cargar productos - usando datos de muestra' : 'Usando datos de productos de muestra'}
                  </p>
                </div>
              </div>
            </div>
          ), { id: 'sample-products-warning', duration: 5000 });
        }
        
      } catch (error: unknown) {
        console.error('💥 Error general al cargar datos:', error);
        
        // Solo mostrar error si no es timeout
        if (error instanceof Error && 'code' in error && error.code !== 'ECONNABORTED') {
          setError('Error al cargar datos. Utilizando datos de muestra.');
        }
        
        // En caso de error, usar datos de muestra
        console.warn('⚠️ Usando datos de muestra por error');
        setProductos(sampleProducts);
        setCategorias(sampleCategories);
      } finally {
        setLoading(false);
        console.log('🏁 Carga de datos completada');
      }
    };
    
    loadData();
  }, []); // Sin dependencias para evitar loops infinitos
  
  // Filtrar productos por categoría y búsqueda
  const productosFiltrados = productos.filter(producto => {
    const coincideCategoria = filtroCategoria === 'todas' || producto.category_id === filtroCategoria;
    const coincideBusqueda = producto.name.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  // Funciones para manejar productos
  const handleOpenProductModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        stock: product.stock.toString(),
        category_id: product.category_id || '',
        image_url: product.image_url || '',
        image_path: product.image_path || '' // Puede ser undefined en productos existentes
      });
      if (product.image_url) {
        setImagePreview(product.image_url);
      }
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        image_url: '',
        image_path: ''
      });
      setImagePreview(null);
    }
    setShowProductModal(true);
  };

  const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validaciones básicas en el lado del cliente
      // Verificar tamaño máximo (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen es demasiado grande. El tamaño máximo es 5MB');
        e.target.value = ''; // Limpiar el input
        return;
      }
      
      // Verificar tipo de archivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Formato de archivo no soportado. Use JPEG, PNG, GIF o WEBP');
        e.target.value = ''; // Limpiar el input
        return;
      }
      
      setSelectedImage(file);
      
      // Crear una vista previa de la imagen
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.onerror = () => {
        toast.error('Error al leer el archivo de imagen');
      };
      reader.readAsDataURL(file);
    }
  };

  // Guardar producto
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      let imageUrl = productForm.image_url;
      
      // Si hay una imagen seleccionada, subirla primero
      if (selectedImage) {
        try {
          // Verificar tamaño de archivo (máximo 5MB)
          if (selectedImage.size > 5 * 1024 * 1024) {
            toast.error('La imagen es demasiado grande. Máximo 5MB permitido.');
            setSaving(false);
            return;
          }
          
          // Verificar tipo de archivo
          const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
          if (!validTypes.includes(selectedImage.type)) {
            toast.error('Formato de imagen no válido. Use JPEG, PNG, GIF o WEBP.');
            setSaving(false);
            return;
          }
          
          // Si estamos actualizando un producto y ya tiene una imagen, eliminar la anterior
          if (editingProduct && editingProduct.image_path && productForm.image_path) {
            try {
              await productService.deleteProductImage(productForm.image_path);
              console.log('Imagen anterior eliminada correctamente');
            } catch (error) {
              console.error('Error al eliminar imagen anterior:', error);
              // No bloqueamos el proceso si falla la eliminación de la imagen anterior
            }
          }
          
          toast.loading('Subiendo imagen...', { id: 'uploading' });
          try {
            const uploadResult = await productService.uploadProductImage(selectedImage);
            
            if (uploadResult && uploadResult.url) {
              imageUrl = uploadResult.url; // Usar la URL devuelta por la API
              
              // Guardar la ruta de la imagen para posibles operaciones futuras
              if (uploadResult.path) {
                productForm.image_path = uploadResult.path;
              }
              
              toast.success('Imagen subida correctamente', { id: 'uploading' });
              console.log('Imagen subida exitosamente:', uploadResult);
            } else {
              console.warn('Respuesta inesperada al subir imagen:', uploadResult);
              toast.error('Error al subir la imagen: Respuesta inválida del servidor', { id: 'uploading' });
              setSaving(false);
              return;
            }
          } catch (uploadError) {
            console.error('Error al intentar subir imagen:', uploadError);
            toast.error('Error al subir imagen. Usando imagen temporal para desarrollo', { id: 'uploading' });
            
            // En desarrollo, usar una imagen de muestra
            if (process.env.NODE_ENV === 'development') {
              imageUrl = `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/300/300`;
              productForm.image_path = 'sample/image.jpg';
            } else {
              setSaving(false);
              return;
            }
          }
        } catch (err) {
          const error = err instanceof Error ? err : new Error(
            typeof err === 'string' ? err : 'Error desconocido al subir la imagen'
          );
          console.error('Error al subir imagen:', error);
          toast.error(`Error al subir la imagen: ${error.message}`, { id: 'uploading' });
          setSaving(false);
          return;
        }
      }
      
      const productData = {
        ...productForm,
        image_url: imageUrl,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock, 10)
      };
      
      let result: Product;
      
      if (editingProduct) {
        // Actualizar producto existente
        result = await productService.updateProduct(editingProduct.id, productData);
        setProductos(prev => prev.map(p => p.id === editingProduct.id ? result : p));
        toast.success('Producto actualizado correctamente');
      } else {
        // Crear nuevo producto
        result = await productService.createProduct(productData);
        setProductos(prev => [...prev, result]);
        toast.success('Producto creado correctamente');
      }
      
      // Restablecer formulario
      setProductForm({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        image_url: '',
        image_path: ''
      });
      setSelectedImage(null);
      setImagePreview(null);
      setEditingProduct(null);
      setShowProductModal(false);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      console.error('Error al guardar producto:', error);
      toast.error(`Error al guardar el producto: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`¿Estás seguro que deseas eliminar el producto "${product.name}"?`)) {
      return;
    }
    
    try {
      await productService.deleteProduct(product.id);
      setProductos(prev => prev.filter(p => p.id !== product.id));
      toast.success('Producto eliminado correctamente');
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      toast.error('Error al eliminar el producto');
    }
  };

  // Funciones para manejar categorías
  const handleOpenCategoryModal = (category: Category | null = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description || ''
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        description: ''
      });
    }
    setShowCategoryModal(true);
  };

  const handleCategoryFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const categoryData = {
        name: categoryForm.name,
        description: categoryForm.description
      };
      
      let result: Category;
      if (editingCategory) {
        // Actualizar categoría existente
        result = await categoryService.updateCategory(editingCategory.id, categoryData);
        setCategorias(prev => prev.map(c => c.id === editingCategory.id ? result : c));
        toast.success('Categoría actualizada correctamente');
      } else {
        // Crear nueva categoría
        result = await categoryService.createCategory(categoryData);
        setCategorias(prev => [...prev, result]);
        toast.success('Categoría creada correctamente');
      }
      
      setShowCategoryModal(false);
      setEditingCategory(null);
    } catch (err) {
      console.error('Error al guardar categoría:', err);
      toast.error('Error al guardar la categoría');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    // Verificar si hay productos con esta categoría
    const productsWithCategory = productos.filter(p => p.category_id === category.id);
    if (productsWithCategory.length > 0) {
      toast.error(`No se puede eliminar la categoría porque tiene ${productsWithCategory.length} productos asociados`);
      return;
    }
    
    if (!confirm(`¿Estás seguro que deseas eliminar la categoría "${category.name}"?`)) {
      return;
    }
    
    try {
      await categoryService.deleteCategory(category.id);
      setCategorias(prev => prev.filter(c => c.id !== category.id));
      toast.success('Categoría eliminada correctamente');
    } catch (err) {
      console.error('Error al eliminar categoría:', err);
      toast.error('Error al eliminar la categoría');
    }
  };

  // Obtener nombre de categoría por ID
  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'Sin categoría';
    const category = categorias.find(c => c.id === categoryId);
    return category ? category.name : 'Categoría desconocida';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Cabecera con botones de acción */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Gestión de Productos</h1>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowCategoriesSection(!showCategoriesSection)}
              className="bg-white text-indigo-600 border border-indigo-300 hover:bg-indigo-50 px-4 py-2 rounded-md text-sm font-medium"
            >
              {showCategoriesSection ? 'Ver Productos' : 'Gestionar Categorías'}
            </button>
            <button 
              onClick={showCategoriesSection ? () => handleOpenCategoryModal() : () => handleOpenProductModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {showCategoriesSection ? '+ Nueva Categoría' : '+ Nuevo Producto'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Sección de Categorías */}
        {showCategoriesSection && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Categorías</h3>
              <p className="mt-1 text-sm text-gray-500">
                Administra las categorías de productos disponibles.
              </p>
            </div>
            
            {loading ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">Cargando categorías...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productos</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categorias.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                          No hay categorías registradas
                        </td>
                      </tr>
                    ) : (
                      categorias.map(categoria => {
                        const productCount = productos.filter(p => p.category_id === categoria.id).length;
                        return (
                          <tr key={categoria.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {categoria.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {categoria.description || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {productCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => handleOpenCategoryModal(categoria)}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  Editar
                                </button>
                                <button 
                                  onClick={() => handleDeleteCategory(categoria)}
                                  className="text-red-600 hover:text-red-900"
                                  disabled={productCount > 0}
                                >
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Sección de Productos */}
        {!showCategoriesSection && (
          <>
            {/* Filtros y búsqueda */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  key="todas"
                  onClick={() => setFiltroCategoria('todas')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    filtroCategoria === 'todas' 
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Todas
                </button>
                {categorias.map(categoria => (
                  <button
                    key={categoria.id}
                    onClick={() => setFiltroCategoria(categoria.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      filtroCategoria === categoria.id 
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {categoria.name}
                  </button>
                ))}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-10">
                <p className="text-gray-500 text-lg">Cargando productos...</p>
              </div>
            ) : (
              <>
                {/* Listado de productos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {productosFiltrados.length === 0 ? (
                    <div className="col-span-full text-center py-10">
                      <p className="text-gray-500 text-lg">No se encontraron productos</p>
                    </div>
                  ) : (
                    productosFiltrados.map(producto => (
                      <div key={producto.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                        <div className="p-5">
                          <div className="flex justify-between items-center">
                            {producto.image_url ? (
                              <div className="w-16 h-16 relative">
                                <Image 
                                  src={producto.image_url}
                                  alt={producto.name}
                                  fill
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  style={{objectFit: 'cover'}}
                                  className="rounded"
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded">
                                <span className="text-gray-500 text-2xl">📦</span>
                              </div>
                            )}
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-gray-500 mb-1">{getCategoryName(producto.category_id)}</span>
                              <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                Stock: {producto.stock}
                              </span>
                            </div>
                          </div>
                          <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">{producto.name}</h3>
                          {producto.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{producto.description}</p>
                          )}
                          <div className="flex justify-between items-end mt-4">
                            <p className="text-xl font-semibold text-gray-900">${producto.price.toFixed(2)}</p>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleOpenProductModal(producto)} 
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(producto)} 
                                className="text-red-600 hover:text-red-900"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </>
        )}
        
        {/* Modal para Productos */}
        {showProductModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h3>
              </div>
              
              <form onSubmit={handleSaveProduct}>
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={productForm.name}
                        onChange={handleProductFormChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        value={productForm.description}
                        onChange={handleProductFormChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      ></textarea>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Precio</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            id="price"
                            name="price"
                            value={productForm.price}
                            onChange={handleProductFormChange}
                            required
                            className="block w-full pl-7 pr-12 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock</label>
                        <input
                          type="number"
                          min="0"
                          id="stock"
                          name="stock"
                          value={productForm.stock}
                          onChange={handleProductFormChange}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">Categoría</label>
                      <select
                        id="category_id"
                        name="category_id"
                        value={productForm.category_id}
                        onChange={handleProductFormChange}
                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="">Sin categoría</option>
                        {categorias.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Imagen</label>
                      <div className="mt-1 flex items-center">
                        <span className="inline-block h-12 w-12 rounded-md overflow-hidden bg-gray-100">
                          {imagePreview ? (
                            <Image src={imagePreview} alt="Vista previa" width={48} height={48} className="h-full w-full object-cover" />
                          ) : (
                            <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          )}
                        </span>
                        <label htmlFor="image-upload" className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer">
                          Cambiar
                          <input
                            id="image-upload"
                            name="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="sr-only"
                          />
                        </label>
                        {(productForm.image_url || imagePreview) && (
                          <button
                            type="button"
                            onClick={async () => {
                              // Si hay una ruta de imagen en Supabase, intentar eliminarla
                              if (productForm.image_path) {
                                try {
                                  toast.loading('Eliminando imagen...', { id: 'deleting-image' });
                                  await productService.deleteProductImage(productForm.image_path);
                                  toast.success('Imagen eliminada correctamente', { id: 'deleting-image' });
                                } catch (error) {
                                  console.error('Error al eliminar imagen de Supabase:', error);
                                  toast.error('Error al eliminar la imagen del servidor', { id: 'deleting-image' });
                                }
                              }
                              
                              // Limpiar la imagen localmente
                              setProductForm(prev => ({ 
                                ...prev, 
                                image_url: '',
                                image_path: '' 
                              }));
                              setImagePreview(null);
                              setSelectedImage(null);
                            }}
                            className="ml-3 text-sm text-red-600 hover:text-red-500"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-3 bg-gray-50 flex justify-end gap-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Modal para Categorías */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                </h3>
              </div>
              
              <form onSubmit={handleSaveCategory}>
                <div className="px-6 py-4">
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="cat-name" className="block text-sm font-medium text-gray-700">Nombre</label>
                      <input
                        type="text"
                        id="cat-name"
                        name="name"
                        value={categoryForm.name}
                        onChange={handleCategoryFormChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="cat-description" className="block text-sm font-medium text-gray-700">Descripción</label>
                      <textarea
                        id="cat-description"
                        name="description"
                        rows={3}
                        value={categoryForm.description}
                        onChange={handleCategoryFormChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      ></textarea>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-3 bg-gray-50 flex justify-end gap-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
