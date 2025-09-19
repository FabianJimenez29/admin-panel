"use client";

import { useState, useEffect } from 'react';
import { Product, Category } from '@/types';
import { productService, categoryService } from '@/services/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Image as ImageIcon,
  DollarSign,
  Package2,
  Filter,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    image_url: '',
    image_path: ''
  });

  // Cargar productos y categorías al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    console.log('🚀 Cargando datos de productos y categorías...');
    setLoading(true);
    
    try {
      // Cargar categorías
      try {
        const categoriasData = await categoryService.getCategories();
        if (categoriasData && Array.isArray(categoriasData)) {
          setCategories(categoriasData);
          console.log('✅ Categorías cargadas:', categoriasData.length);
        }
      } catch (error) {
        console.error('❌ Error al cargar categorías:', error);
        toast.error('Error al cargar categorías');
      }
      
      // Cargar productos
      try {
        const productsData = await productService.getProducts();
        if (productsData && Array.isArray(productsData)) {
          setProducts(productsData);
          console.log('✅ Productos cargados:', productsData.length);
        }
      } catch (error) {
        console.error('❌ Error al cargar productos:', error);
        toast.error('Error al cargar productos');
      }
    } catch (error) {
      console.error('❌ Error general:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateProduct = () => {
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
    setImagePreview('');
    setSelectedImageFile(null);
    setIsCreateModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      category_id: product.category_id || '',
      image_url: product.image_url || '',
      image_path: product.image_path || ''
    });
    setImagePreview(product.image_url || '');
    setIsCreateModalOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price) {
      toast.error('Nombre y precio son requeridos');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = productForm.image_url;
      let imagePath = productForm.image_path;

      // Si hay una nueva imagen seleccionada, subirla primero
      if (selectedImageFile) {
        try {
          console.log('📤 Subiendo nueva imagen...');
          const uploadResult = await productService.uploadProductImage(selectedImageFile);
          imageUrl = uploadResult.url;
          imagePath = uploadResult.path;
          console.log('✅ Imagen subida exitosamente:', imageUrl);
        } catch (imageError) {
          console.error('❌ Error al subir imagen:', imageError);
          const errorMsg = imageError instanceof Error ? imageError.message : 'Error desconocido al subir imagen';
          toast.error(`Error al subir la imagen: ${errorMsg}`);
          // No continuar si la imagen falla, devolver error
          return;
        }
      }

      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock) || 0,
        image_url: imageUrl,
        image_path: imagePath
      };

      let result: Product;

      if (editingProduct) {
        // Actualizar producto existente
        result = await productService.updateProduct(editingProduct.id, productData);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? result : p));
        toast.success('Producto actualizado exitosamente');
      } else {
        // Crear nuevo producto
        result = await productService.createProduct(productData);
        setProducts(prev => [...prev, result]);
        toast.success('Producto creado exitosamente');
      }

      setIsCreateModalOpen(false);
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
      setImagePreview('');
      setSelectedImageFile(null);
    } catch (error) {
      console.error('❌ Error al guardar producto:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al guardar el producto: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const productToDelete = products.find(p => p.id === productId);
    if (!productToDelete) return;

    if (!confirm(`¿Estás seguro que deseas eliminar el producto "${productToDelete.name}"?`)) {
      return;
    }

    try {
      // Eliminar el producto de la base de datos
      await productService.deleteProduct(productId);
      
      // Si tenemos un path de imagen, eliminarla de Supabase Storage
      if (productToDelete.image_path) {
        try {
          await productService.deleteProductImage(productToDelete.image_path);
          console.log('✅ Imagen del producto eliminada');
        } catch (imageError) {
          console.warn('⚠️ No se pudo eliminar la imagen:', imageError);
          // No fallar por esto, el producto ya fue eliminado de la BD
        }
      }
      
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Producto eliminado exitosamente');
    } catch (error) {
      console.error('❌ Error al eliminar producto:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al eliminar el producto: ${errorMessage}`);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Función de test para verificar conexión con Supabase
  const testSupabaseConnection = async () => {
    try {
      console.log('🧪 Iniciando test completo de Supabase...');
      toast.loading('Probando conexión con Supabase...');
      
      const { supabase } = await import('@/lib/supabase');
      
      // Test 1: Conectividad básica
      const { data: session, error: authError } = await supabase.auth.getSession();
      console.log('1. Sesión:', session ? '✅ Activa' : '❌ No activa', authError);

      // Test 2: Acceso a la tabla de productos
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .limit(1);
      console.log('2. Acceso a tabla products:', products ? '✅ OK' : '❌ Error', productsError);

      // Test 3: Verificar acceso directo al bucket product-images
      let bucketExists = false;
      try {
        const { data: bucketFiles, error: bucketError } = await supabase.storage
          .from('product-images')
          .list('', { limit: 1 });
        
        if (!bucketError) {
          bucketExists = true;
          console.log('3. Bucket product-images: ✅ Accesible');
          console.log('4. Archivos en bucket (muestra):', bucketFiles?.slice(0, 3));
        } else {
          console.log('3. Bucket product-images: ❌ Error de acceso:', bucketError);
        }
      } catch (bucketTestError) {
        console.log('3. Bucket product-images: ❌ No accesible:', bucketTestError);
      }

      // Test 4: Test de upload simulado si el bucket es accesible
      if (bucketExists) {
        const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const testPath = `test/test-${Date.now()}.txt`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(testPath, testFile);
        
        console.log('5. Test de upload:', uploadData ? '✅ OK' : '❌ Error', uploadError);
        
        // Limpiar archivo de test
        if (uploadData) {
          await supabase.storage.from('product-images').remove([uploadData.path]);
          console.log('6. Archivo test eliminado');
        }
      } else {
        console.log('5. Test de upload: ⏭️ Omitido (bucket no accesible)');
      }

      toast.dismiss();
      toast.success('Test completado. Revisa la consola para detalles.');
    } catch (error) {
      toast.dismiss();
      console.error('❌ Error en test:', error);
      toast.error(`Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Sin categoría';
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
              <p className="text-gray-600 mt-1">
                Administra el catálogo de productos del gimnasio
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm" onClick={testSupabaseConnection}>
                🧪 Test Supabase
              </Button>
              <Button onClick={handleCreateProduct}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Producto
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Productos</p>
                    <p className="text-2xl font-bold">{products.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Valor Total</p>
                    <p className="text-2xl font-bold">
                      ${products.reduce((sum, p) => sum + (p.price * p.stock), 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Package2 className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Stock Total</p>
                    <p className="text-2xl font-bold">
                      {products.reduce((sum, p) => sum + p.stock, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Filter className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Categorías</p>
                    <p className="text-2xl font-bold">{categories.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar productos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="all">Todas las categorías</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Productos</CardTitle>
              <CardDescription>
                {filteredProducts.length} productos encontrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imagen</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <span className="ml-2">Cargando productos...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <Package className="h-12 w-12 text-gray-400 mb-2" />
                          <p className="text-lg font-medium">No hay productos</p>
                          <p className="text-sm">
                            {searchTerm || selectedCategory !== 'all' 
                              ? 'No se encontraron productos con los filtros aplicados' 
                              : 'Aún no hay productos registrados en el sistema'
                            }
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500 max-w-xs truncate">
                            {product.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {getCategoryName(product.category_id || '')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${product.price.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.stock > 10 ? "success" : product.stock > 0 ? "warning" : "destructive"}>
                          {product.stock} unidades
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.stock > 0 ? "success" : "destructive"}>
                          {product.stock > 0 ? "Disponible" : "Agotado"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Create/Edit Product Modal */}
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
                </DialogTitle>
                <DialogDescription>
                  {editingProduct ? 'Modifica la información del producto' : 'Completa la información del nuevo producto'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre del Producto</Label>
                    <Input
                      id="name"
                      value={productForm.name}
                      onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ej: Proteína Whey 1kg"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <textarea
                      id="description"
                      value={productForm.description}
                      onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descripción del producto..."
                      className="w-full h-20 px-3 py-2 text-sm rounded-md border border-input bg-background resize-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="price">Precio ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={productForm.price}
                        onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock">Stock</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={productForm.stock}
                        onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <select
                      id="category"
                      value={productForm.category_id}
                      onChange={(e) => setProductForm(prev => ({ ...prev, category_id: e.target.value }))}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Seleccionar categoría</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="image">Imagen del Producto</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                  </div>
                  
                  {imagePreview && (
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={200}
                        height={200}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveProduct} disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingProduct ? 'Actualizando...' : 'Creando...'}
                    </>
                  ) : (
                    editingProduct ? 'Actualizar' : 'Crear'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}