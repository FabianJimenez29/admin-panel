"use client";

export default function EnvDebug() {
  return (
    <div className="bg-gray-100 p-4 m-4 rounded-lg">
      <h3 className="font-bold text-lg mb-2">Debug - Variables de Entorno</h3>
      <div className="space-y-2 text-sm">
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ PRESENTE' : '❌ FALTANTE'}
        </div>
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ PRESENTE' : '❌ FALTANTE'}
        </div>
        <div>
          <strong>NEXT_PUBLIC_BACKEND_URL:</strong> {process.env.NEXT_PUBLIC_BACKEND_URL ? '✅ PRESENTE' : '❌ FALTANTE'}
        </div>
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <div>
            <strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}
          </div>
        )}
      </div>
    </div>
  );
}