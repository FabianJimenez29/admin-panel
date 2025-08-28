import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// This is a fallback API route for when direct uploads to the backend fail due to CORS
export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    
    // Extract the image file
    const image = formData.get('image') as File;
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' }, 
        { status: 400 }
      );
    }
    
    // Create a new FormData to forward
    const forwardFormData = new FormData();
    forwardFormData.append('image', image);
    
    // Usar la URL del backend desde las variables de entorno del archivo .env
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    
    // Forward the request to the backend
    const response = await axios.post(
      `${backendUrl}/products/upload-image`,
      forwardFormData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    // Return the response from the backend
    return NextResponse.json(response.data);
    
  } catch (error: any) {
    console.error('Error forwarding image upload:', error);
    
    // In development mode, return a fallback
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        url: `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/300/300`,
        path: 'sample/image.jpg',
        message: 'Image upload fallback (development only)'
      });
    }
    
    return NextResponse.json(
      { error: error.message || 'Error uploading image' },
      { status: 500 }
    );
  }
}
