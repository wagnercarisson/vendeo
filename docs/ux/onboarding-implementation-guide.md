# 🛠️ Onboarding Progressivo — Guia de Implementação Técnica
**Agent:** @ux-design-expert (Uma) → @dev  
**Data:** 2026-04-30  
**Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase

---

## 📁 Estrutura de Arquivos Proposta

```
app/
  onboarding/
    store/
      page.tsx ← Redireciona para /identity (ou mantém form simples como fallback)
      identity/
        page.tsx ← Tela 1/4 (nome + segmento)
      location/
        page.tsx ← Tela 2/4 (cidade + estado + bairro)
      contact/
        page.tsx ← Tela 3/4 (telefone + Instagram)
      branding/
        page.tsx ← Tela 4/4 (logo + cores)
      layout.tsx ← Layout compartilhado (progress bar, voltar)

components/
  onboarding/
    ProgressBar.tsx
    SegmentSelector.tsx
    PhoneMaskInput.tsx
    LogoUploader.tsx
    ColorPicker.tsx
    IntelligenceCalibrationModal.tsx ← Fase 2 completa
    IntelligenceScoreBadge.tsx

lib/
  onboarding/
    store.ts ← Tipos e validações (Zod schemas)
    api.ts ← Chamadas à API (/api/onboarding/*)
    localStorage.ts ← Auto-save e recovery
    colorExtractor.ts ← Vibrant.js / ColorThief
    
api/
  onboarding/
    store/
      route.ts ← POST (cria store + intelligence)
    intelligence/
      route.ts ← PATCH (atualiza context JSONB)
    logo/
      generate/
        route.ts ← POST (Replicate API - geração IA)
      upload/
        route.ts ← POST (Supabase Storage)
      extract-colors/
        route.ts ← POST (extração de cores de logo)
```

---

## 🎨 Design Tokens (Tailwind Config)

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        'vendeo-bg': '#F9FAFB',
        'vendeo-text': '#111827',
        'vendeo-muted': '#6B7280',
        'vendeo-border': '#E5E7EB',
        'vendeo-green': '#16A34A',
        'vendeo-greenLight': '#22C55E',
        // Adicionar cores de status
        'vendeo-success': '#10B981',
        'vendeo-warning': '#F59E0B',
        'vendeo-error': '#EF4444',
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      },
      spacing: {
        '18': '4.5rem', // Touch target size (72px)
        '20': '5rem',   // Touch target size (80px)
      },
      fontSize: {
        'mobile': '16px', // iOS anti-zoom
      },
    },
  },
}
```

---

## 📦 Tipos TypeScript

```typescript
// lib/onboarding/store.ts
import { z } from 'zod';

// Fase 1: Dados básicos da loja (8 campos)
export const Phase1Schema = z.object({
  // Tela 1/4
  name: z.string().min(2, 'Nome muito curto').max(100),
  main_segment: z.enum(['adega', 'farmacia', 'moda', 'beauty', 'home']),
  
  // Tela 2/4
  city: z.string().min(2).max(100),
  state: z.string().length(2, 'Use sigla do estado (ex: SC)'),
  neighborhood: z.string().max(100).optional(),
  
  // Tela 3/4
  phone: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Formato inválido'),
  whatsapp: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/).optional(),
  instagram: z.string().regex(/^@?[\w.]+$/, 'Instagram inválido').optional(),
  
  // Tela 4/4
  logo_url: z.string().url().optional(),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export type Phase1Data = z.infer<typeof Phase1Schema>;

// Fase 2: Intelligence context (15 campos - JSONB v2.1)
export const IntelligenceContextSchema = z.object({
  schema_version: z.literal('2.1'),
  
  // v2.0 fields (5 critical)
  brand_voice: z.enum(['formal', 'informal', 'technical', 'playful']).optional(),
  target_audience: z.string().max(200).optional(),
  seasonal_peaks: z.array(z.string()).max(10).optional(),
  main_differentiation: z.string().max(300).optional(),
  top_products: z.array(z.string()).max(5).optional(),
  price_positioning: z.enum(['economic', 'medium', 'premium', 'luxury']).optional(),
  competitors: z.array(z.string()).max(3).optional(),
  
  // v2.1 additions (10 important)
  customer_pain_points: z.array(z.string()).optional(),
  conversion_triggers: z.object({
    urgency_preference: z.number().min(0).max(10),
    scarcity_comfortable: z.number().min(0).max(10),
    social_proof_available: z.boolean(),
    guarantee_offered: z.boolean(),
  }).optional(),
  successful_past_ctas: z.array(z.object({
    cta: z.string(),
    context: z.string(),
    approval_speed_seconds: z.number().optional(),
  })).max(3).optional(),
  unique_selling_proposition: z.object({
    primary_usp: z.string(),
    supporting_points: z.array(z.string()).optional(),
    proof_elements: z.array(z.string()).optional(),
  }).optional(),
  average_ticket_brl: z.number().positive().optional(),
  local_events_calendar: z.array(z.string()).optional(),
  segment_specific_context: z.record(z.unknown()).optional(),
  language_specifics: z.object({
    uses_regional_slang: z.boolean(),
    formality_level: z.enum(['very_formal', 'formal', 'neutral', 'informal', 'very_informal']),
    emoji_comfort: z.number().min(0).max(10),
    max_exclamations_per_copy: z.number().min(0).max(5),
  }).optional(),
  copy_length_preferences: z.object({
    headline_max_words: z.number(),
    body_max_words: z.number(),
    prefers_brevity: z.boolean(),
  }).optional(),
  store_location_context: z.object({
    neighborhood_type: z.string().optional(),
    foot_traffic: z.enum(['low', 'medium', 'high']).optional(),
    near_competitors: z.boolean().optional(),
    parking_available: z.boolean().optional(),
  }).optional(),
});

export type IntelligenceContext = z.infer<typeof IntelligenceContextSchema>;

// API Response types
export interface OnboardingStoreResponse {
  success: boolean;
  store_id: string;
  intelligence_id: string;
  error?: string;
}

export interface IntelligenceScoreResponse {
  score: number; // 0-100
  badge: 'basic' | 'medium' | 'advanced';
  fields_filled: number;
  fields_total: number;
}
```

---

## 🔌 APIs Backend

### 1. POST /api/onboarding/store

**Payload:**
```typescript
{
  name: string;
  main_segment: 'adega' | 'farmacia' | 'moda' | 'beauty' | 'home';
  city: string;
  state: string;
  neighborhood?: string;
  phone: string;
  whatsapp?: string;
  instagram?: string;
  logo_url?: string;
  primary_color: string; // HEX
  secondary_color: string; // HEX
}
```

**Response:**
```typescript
{
  success: true,
  store_id: "uuid",
  intelligence_id: "uuid"
}
```

**Lógica:**
```typescript
// api/onboarding/store/route.ts
export async function POST(req: Request) {
  const supabase = createServerClient();
  const user = await supabase.auth.getUser();
  
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  const data = await req.json();
  const validated = Phase1Schema.parse(data); // Zod validation
  
  // 1. Criar store
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .insert({
      owner_user_id: user.id,
      name: validated.name,
      main_segment: validated.main_segment,
      city: validated.city,
      state: validated.state,
      neighborhood: validated.neighborhood,
      phone: validated.phone,
      whatsapp: validated.whatsapp || validated.phone, // Default: phone
      instagram: validated.instagram,
      logo_url: validated.logo_url,
      primary_color: validated.primary_color,
      secondary_color: validated.secondary_color,
    })
    .select('id')
    .single();
  
  if (storeError) throw storeError;
  
  // 2. Criar store_intelligence (context vazio v2.0)
  const { data: intelligence, error: intelligenceError } = await supabase
    .from('store_intelligence')
    .insert({
      store_id: store.id,
      context: { schema_version: '2.0' }, // JSONB vazio
      learned_patterns: { schema_version: '2.0' },
    })
    .select('id')
    .single();
  
  if (intelligenceError) throw intelligenceError;
  
  // 3. Background job: Validar logo/cores com @brand-designer
  // (Opcional: usar queue como BullMQ ou apenas log)
  await fetch('/api/background/validate-brand', {
    method: 'POST',
    body: JSON.stringify({ store_id: store.id }),
  });
  
  return Response.json({
    success: true,
    store_id: store.id,
    intelligence_id: intelligence.id,
  });
}
```

---

### 2. PATCH /api/onboarding/intelligence

**Payload:**
```typescript
{
  store_id: string;
  context: IntelligenceContext; // JSONB parcial (merge com existente)
}
```

**Response:**
```typescript
{
  success: true,
  intelligence_score: number; // 0-100
}
```

**Lógica:**
```typescript
// api/onboarding/intelligence/route.ts
export async function PATCH(req: Request) {
  const supabase = createServerClient();
  const user = await supabase.auth.getUser();
  
  const { store_id, context } = await req.json();
  
  // Validar ownership
  const { data: store } = await supabase
    .from('stores')
    .select('owner_user_id')
    .eq('id', store_id)
    .single();
  
  if (store?.owner_user_id !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Merge context (preserva campos existentes)
  const { data: current } = await supabase
    .from('store_intelligence')
    .select('context')
    .eq('store_id', store_id)
    .single();
  
  const merged = {
    ...current?.context,
    ...context,
    schema_version: '2.1', // Upgrade version
  };
  
  // Update
  await supabase
    .from('store_intelligence')
    .update({ context: merged })
    .eq('store_id', store_id);
  
  // Calcular score (0-100)
  const score = calculateIntelligenceScore(merged);
  
  return Response.json({ success: true, intelligence_score: score });
}

function calculateIntelligenceScore(context: any): number {
  const fields = [
    'brand_voice', 'target_audience', 'seasonal_peaks', 'main_differentiation',
    'top_products', 'price_positioning', 'competitors', 'customer_pain_points',
    'conversion_triggers', 'successful_past_ctas', 'unique_selling_proposition',
    'average_ticket_brl', 'local_events_calendar', 'segment_specific_context',
    'language_specifics', 'copy_length_preferences', 'store_location_context',
  ];
  
  const filled = fields.filter(f => context[f] !== undefined && context[f] !== null).length;
  return Math.round((filled / fields.length) * 100);
}
```

---

### 3. POST /api/onboarding/logo/upload

**Payload:** FormData (multipart/form-data)
```typescript
{
  file: File; // PNG/JPG (max 5MB)
  store_id: string;
}
```

**Response:**
```typescript
{
  success: true,
  logo_url: string; // Public URL (Supabase Storage)
}
```

**Lógica:**
```typescript
// api/onboarding/logo/upload/route.ts
export async function POST(req: Request) {
  const supabase = createServerClient();
  const formData = await req.formData();
  
  const file = formData.get('file') as File;
  const store_id = formData.get('store_id') as string;
  
  // Validar tipo e tamanho
  if (!file.type.startsWith('image/')) {
    return Response.json({ error: 'Apenas imagens' }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) { // 5MB
    return Response.json({ error: 'Arquivo muito grande' }, { status: 400 });
  }
  
  // Upload para Supabase Storage
  const fileName = `${store_id}-${Date.now()}.${file.type.split('/')[1]}`;
  const { data, error } = await supabase.storage
    .from('store-logos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });
  
  if (error) throw error;
  
  const { data: publicUrl } = supabase.storage
    .from('store-logos')
    .getPublicUrl(data.path);
  
  // Atualizar store.logo_url
  await supabase
    .from('stores')
    .update({ logo_url: publicUrl.publicUrl })
    .eq('id', store_id);
  
  return Response.json({ success: true, logo_url: publicUrl.publicUrl });
}
```

---

### 4. POST /api/onboarding/logo/generate (Replicate API)

**Payload:**
```typescript
{
  store_id: string;
  prompt: string; // Ex: "Moderna, minimalista, cores vibrantes"
}
```

**Response:**
```typescript
{
  success: true,
  options: [
    { url: string, id: string },
    { url: string, id: string },
    { url: string, id: string },
  ]
}
```

**Lógica:**
```typescript
// api/onboarding/logo/generate/route.ts
import Replicate from 'replicate';

export async function POST(req: Request) {
  const { store_id, prompt } = await req.json();
  
  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
  
  // Modelo: Stable Diffusion XL (ou específico de logos)
  const output = await replicate.run(
    "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    {
      input: {
        prompt: `Logo design: ${prompt}. Professional, clean, minimalist, vector style, no background.`,
        num_outputs: 3,
        aspect_ratio: "1:1",
      }
    }
  );
  
  // Output é array de URLs
  const options = (output as string[]).map((url, i) => ({ url, id: `opt-${i}` }));
  
  return Response.json({ success: true, options });
}
```

**Nota:** Alternativa free: Usar Hugging Face Inference API (SDXL) ou templates estáticos.

---

### 5. POST /api/onboarding/logo/extract-colors

**Payload:**
```typescript
{
  logo_url: string;
}
```

**Response:**
```typescript
{
  success: true,
  primary_color: string; // HEX
  secondary_color: string; // HEX
  palette: string[]; // Array de 5-10 cores dominantes
}
```

**Lógica:**
```typescript
// api/onboarding/logo/extract-colors/route.ts
import { Vibrant } from 'node-vibrant';

export async function POST(req: Request) {
  const { logo_url } = await req.json();
  
  // Extrair paleta com Vibrant
  const palette = await Vibrant.from(logo_url).getPalette();
  
  const primary_color = palette.Vibrant?.hex || '#16A34A';
  const secondary_color = palette.DarkVibrant?.hex || '#2563EB';
  
  const all_colors = Object.values(palette)
    .filter(swatch => swatch !== null)
    .map(swatch => swatch!.hex);
  
  return Response.json({
    success: true,
    primary_color,
    secondary_color,
    palette: all_colors,
  });
}
```

**Dependência:**
```bash
npm install node-vibrant
```

---

## 🎨 Componentes Frontend

### 1. ProgressBar.tsx

```typescript
// components/onboarding/ProgressBar.tsx
interface ProgressBarProps {
  current: number; // 1-4
  total: number;   // 4
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full ${
              i < current ? 'bg-vendeo-green' : 'bg-vendeo-border'
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-vendeo-muted">
        {current}/{total}
      </span>
    </div>
  );
}
```

---

### 2. SegmentSelector.tsx

```typescript
// components/onboarding/SegmentSelector.tsx
interface Option {
  value: string;
  icon: string;
  label: string;
}

interface SegmentSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}

export function SegmentSelector({ value, onChange, options }: SegmentSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`
            flex flex-col items-center justify-center
            h-20 w-full rounded-xl border-2
            transition-all
            ${value === opt.value 
              ? 'border-vendeo-green bg-green-50' 
              : 'border-vendeo-border bg-white hover:border-gray-300'
            }
          `}
        >
          <span className="text-3xl mb-1">{opt.icon}</span>
          <span className="text-xs font-medium text-vendeo-text">
            {opt.label}
          </span>
        </button>
      ))}
    </div>
  );
}
```

---

### 3. PhoneMaskInput.tsx

```typescript
// components/onboarding/PhoneMaskInput.tsx
import { forwardRef } from 'react';

interface PhoneMaskInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const PhoneMaskInput = forwardRef<HTMLInputElement, PhoneMaskInputProps>(
  ({ value, onChange, placeholder }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/\D/g, ''); // Remove non-digits
      
      // Aplica máscara: (XX) XXXXX-XXXX
      if (val.length <= 10) {
        val = val.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      } else {
        val = val.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
      }
      
      onChange(val);
    };
    
    return (
      <input
        ref={ref}
        type="tel"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="
          w-full rounded-xl border border-vendeo-border 
          px-3 py-2 text-mobile outline-none
          focus:ring-2 focus:ring-green-200
        "
      />
    );
  }
);
```

---

### 4. LogoUploader.tsx

```typescript
// components/onboarding/LogoUploader.tsx
import { useState } from 'react';
import { Upload, Sparkles, SkipForward } from 'lucide-react';

interface LogoUploaderProps {
  storeId: string;
  onUploadSuccess: (url: string) => void;
  onSkip: () => void;
}

export function LogoUploader({ storeId, onUploadSuccess, onSkip }: LogoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Preview local
    setPreview(URL.createObjectURL(file));
    
    // Upload
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('store_id', storeId);
    
    const res = await fetch('/api/onboarding/logo/upload', {
      method: 'POST',
      body: formData,
    });
    
    const data = await res.json();
    setUploading(false);
    
    if (data.success) {
      onUploadSuccess(data.logo_url);
    }
  };
  
  const handleGenerate = () => {
    // Abrir modal de geração com IA (não implementado aqui)
    alert('Modal de geração com IA - TODO');
  };
  
  return (
    <div className="space-y-3">
      {preview ? (
        <div className="relative">
          <img src={preview} alt="Logo preview" className="h-32 w-32 mx-auto rounded" />
          <button
            type="button"
            onClick={() => setPreview(null)}
            className="absolute top-0 right-0 text-red-600"
          >
            ✕ Remover
          </button>
        </div>
      ) : (
        <label className="
          flex flex-col items-center justify-center
          h-40 border-2 border-dashed border-vendeo-border
          rounded-xl cursor-pointer hover:border-gray-300
        ">
          <Upload className="h-8 w-8 text-vendeo-muted mb-2" />
          <span className="text-sm text-vendeo-muted">Clique ou arraste sua logo aqui</span>
          <span className="text-xs text-vendeo-muted">PNG ou JPG (max 5MB)</span>
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}
      
      <button
        type="button"
        onClick={handleGenerate}
        className="
          w-full flex items-center justify-center gap-2
          py-2 rounded-xl border border-vendeo-border
          text-sm font-medium text-vendeo-text
          hover:bg-gray-50
        "
      >
        <Sparkles className="h-4 w-4" />
        Gerar logo com IA
      </button>
      
      <button
        type="button"
        onClick={onSkip}
        className="w-full text-sm text-vendeo-muted hover:underline"
      >
        <SkipForward className="inline h-4 w-4" />
        Vou adicionar depois
      </button>
    </div>
  );
}
```

---

### 5. ColorPicker.tsx

```typescript
// components/onboarding/ColorPicker.tsx
import { useState } from 'react';

interface ColorPickerProps {
  label: string;
  value: string; // HEX
  onChange: (value: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-vendeo-text">{label}</label>
      <div className="flex items-center gap-2">
        <div
          className="h-12 w-12 rounded-lg border-2 border-vendeo-border"
          style={{ backgroundColor: value }}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-24 rounded border border-vendeo-border cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#16A34A"
          className="
            flex-1 rounded-xl border border-vendeo-border
            px-3 py-2 text-sm outline-none
            focus:ring-2 focus:ring-green-200
          "
        />
      </div>
    </div>
  );
}
```

---

## 💾 Auto-Save & Recovery (localStorage)

```typescript
// lib/onboarding/localStorage.ts
const STORAGE_KEY = 'vendeo_onboarding_draft';

export function saveOnboardingDraft(data: Partial<Phase1Data>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadOnboardingDraft(): Partial<Phase1Data> | null {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : null;
}

export function clearOnboardingDraft() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// Uso em componente:
// useEffect(() => {
//   const draft = loadOnboardingDraft();
//   if (draft) {
//     setName(draft.name || '');
//     setSegment(draft.main_segment || '');
//     // ...
//   }
// }, []);
//
// useEffect(() => {
//   saveOnboardingDraft({ name, main_segment: segment, city, state });
// }, [name, segment, city, state]);
```

---

## 🎯 Performance Optimization

### 1. Lazy Loading do Modal (Fase 2)

```typescript
// app/dashboard/page.tsx
import dynamic from 'next/dynamic';

const IntelligenceModal = dynamic(
  () => import('@/components/onboarding/IntelligenceCalibrationModal'),
  { ssr: false } // Não renderiza no servidor
);

export default function DashboardPage() {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowModal(true)}>
        ⚡ Calibrar inteligência
      </button>
      
      {showModal && <IntelligenceModal onClose={() => setShowModal(false)} />}
    </>
  );
}
```

### 2. Debounce no Auto-Save

```typescript
import { useDebounce } from 'use-debounce';

const [name, setName] = useState('');
const [debouncedName] = useDebounce(name, 500); // 500ms delay

useEffect(() => {
  saveOnboardingDraft({ name: debouncedName });
}, [debouncedName]);
```

### 3. Image Optimization (Logo Upload)

```typescript
// api/onboarding/logo/upload/route.ts
import sharp from 'sharp';

// Resize logo para max 512x512 (reduz tamanho)
const buffer = await file.arrayBuffer();
const optimized = await sharp(Buffer.from(buffer))
  .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
  .png({ quality: 90 })
  .toBuffer();

// Upload buffer otimizado
const { data } = await supabase.storage
  .from('store-logos')
  .upload(fileName, optimized, { contentType: 'image/png' });
```

---

## ✅ Checklist de Implementação

### Sprint 1: Fase 1 (Básico - SEM geração IA)
- [ ] Estrutura de pastas (`app/onboarding/store/{identity,location,contact,branding}`)
- [ ] Layout compartilhado com ProgressBar
- [ ] Componentes: SegmentSelector, PhoneMaskInput, ColorPicker
- [ ] API POST `/api/onboarding/store` (criar store + intelligence)
- [ ] Auto-save em localStorage
- [ ] Validação Zod nos inputs
- [ ] Mobile-first (font-size 16px, touch targets 48dp)
- [ ] Testes com lojista real (perfil 45-55 anos)

### Sprint 2: Upload de Logo + Extração de Cores
- [ ] Componente LogoUploader (drag & drop, preview)
- [ ] API POST `/api/onboarding/logo/upload` (Supabase Storage)
- [ ] API POST `/api/onboarding/logo/extract-colors` (Vibrant.js)
- [ ] Integração: Extrair cores após upload
- [ ] Fallback: Cores padrão se não fizer upload

### Sprint 3: Geração de Logo com IA (Opcional)
- [ ] API POST `/api/onboarding/logo/generate` (Replicate API)
- [ ] Modal de geração: input prompt + 3 opções
- [ ] Loading state (10-15s de geração)
- [ ] Integração com LogoUploader
- [ ] Custo-benefício: avaliar uso de API paga vs templates estáticos

### Sprint 4: Fase 2 (Intelligence Calibration)
- [ ] Modal IntelligenceCalibrationModal (5 abas, 15 campos)
- [ ] API PATCH `/api/onboarding/intelligence` (merge JSONB context)
- [ ] Score calculator (0-100)
- [ ] Badge visual (Básica/Média/Avançada)
- [ ] Banner no dashboard: "Calibre a IA"
- [ ] Lazy loading do modal (performance)

---

## 🧪 Testes de Usabilidade

### Cenários de Teste (com Lojista Real)

**Perfil do Testador:**
- Idade: 45-55 anos
- Experiência com tech: Baixa (usa WhatsApp/Instagram)
- Tempo disponível: 10-15 minutos
- Dispositivo: Smartphone (70% dos lojistas)

**Cenário 1: Onboarding Completo (Fase 1)**
1. Faça login na plataforma
2. Complete o cadastro da sua loja
3. Meta: ≤5 minutos, sem pedir ajuda

**Observações:**
- [ ] Entendeu o que é "segmento" sem explicação?
- [ ] Conseguiu fazer upload do logo sem ajuda?
- [ ] Entendeu o color picker ou ficou confuso?
- [ ] Pulo alguma etapa por frustração?

**Cenário 2: Intelligence Calibration (Fase 2)**
1. No dashboard, clique "Calibrar inteligência"
2. Preencha pelo menos 5 campos
3. Meta: ≤5 minutos, entender o propósito

**Observações:**
- [ ] Entendeu POR QUE calibrar ajuda?
- [ ] Sentiu-se confortável para pular campos?
- [ ] Score de inteligência motivou a preencher mais?

---

## 📊 Métricas de Sucesso (Analytics)

```typescript
// lib/analytics.ts (Posthog/Mixpanel/GA4)
export function trackOnboardingEvent(event: string, properties?: object) {
  if (typeof window === 'undefined') return;
  
  // Exemplo: Posthog
  window.posthog?.capture(event, properties);
}

// Uso:
trackOnboardingEvent('onboarding_phase1_started');
trackOnboardingEvent('onboarding_phase1_completed', { duration_seconds: 145 });
trackOnboardingEvent('onboarding_logo_uploaded', { method: 'drag_drop' });
trackOnboardingEvent('onboarding_phase2_opened');
trackOnboardingEvent('onboarding_intelligence_score', { score: 80 });
```

**Eventos Críticos:**
- `onboarding_phase1_started`
- `onboarding_phase1_completed` (duration_seconds)
- `onboarding_phase1_abandoned` (last_step)
- `onboarding_logo_uploaded` (method: drag_drop | click)
- `onboarding_logo_skipped`
- `onboarding_colors_extracted`
- `onboarding_phase2_opened`
- `onboarding_phase2_completed` (fields_filled, score)
- `onboarding_phase2_abandoned` (fields_filled, duration_seconds)

---

**🛠️ Guia criado por:** @ux-design-expert (Uma)  
**👨‍💻 Para:** @dev  
**📄 Referências:**
- `docs/ux/onboarding-progressive-redesign.md` (Análise completa)
- `docs/ux/onboarding-wireframes.md` (Wireframes detalhados)
- `docs/ux/onboarding-executive-summary.md` (Resumo executivo)

**🚀 Status:** Pronto para implementação
