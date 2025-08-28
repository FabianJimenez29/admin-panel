// Tipo para categorías
export type Category = {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
};

// Tipo para productos
export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category_id?: string;
  image_url?: string;
  image_path?: string; // Ruta de la imagen en Supabase
  created_at?: string;
  updated_at?: string;
  category?: Category;
};

// Tipo para citas
export type Cita = {
  id: number;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_provincia?: string;
  client_canton?: string;
  client_distrito?: string;
  sucursal: string;
  servicio: string;
  fecha: string;
  hora: string;
  tipo_placa?: string;
  numero_placa?: string;
  marca?: string;
  modelo?: string;
  problema?: string;
  status: string;
  created_at?: string;
  tecnico?: string;
  observaciones?: string;
  reparaciones_list?: string;
};
