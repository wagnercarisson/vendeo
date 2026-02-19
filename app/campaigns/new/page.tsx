'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

type Store = {
  id: string;
  name: string;
};

export default function NewCampaignPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [storeId, setStoreId] = useState('');
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState<string>('4.99');
  const [audience, setAudience] = useState('Jovem / Festa');
  const [objective, setObjective] = useState('Divulgar novidade');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    (async () => {
      setError(null);
      const { data, error } = await supabase
        .from('stores')
        .select('id,name')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
        return;
      }
      setStores((data ?? []) as Store[]);
      if ((data ?? []).length > 0) setStoreId((data ?? [])[0].id);
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // validações simples
    if (!storeId) {
      setLoading(false);
      setError('Selecione uma loja.');
      return;
    }
    if (!productName.trim()) {
      setLoading(false);
      setError('Informe o nome do produto.');
      return;
    }

    // price no banco é numeric; vamos converter com segurança
    const parsedPrice = Number(String(price).replace(',', '.'));
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setLoading(false);
      setError('Preço inválido.');
      return;
    }

    const { error } = await supabase.from('campaigns').insert({
      store_id: storeId,
      product_name: productName.trim(),
      price: parsedPrice,
      audience,
      objective,
      image_url: imageUrl.trim() || null,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push('/campaigns');
    router.refresh();
  }

  return (
    <div style={{ padding: 24, maxWidth: 520 }}>
      <h1 style={{ fontSize: 40, marginBottom: 16 }}>Nova Campanha</h1>

      {error && (
        <p style={{ color: 'crimson', marginBottom: 12 }}>
          Erro: {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label>
          Loja
          <select
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            style={{ display: 'block', width: '100%', marginBottom: 12 }}
          >
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Produto
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            style={{ display: 'block', width: '100%', marginBottom: 12 }}
            placeholder="Ex: Energético Baly Tadala 250ml"
          />
        </label>

        <label>
          Preço (R$)
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={{ display: 'block', width: '100%', marginBottom: 12 }}
            placeholder="4.99"
          />
        </label>

        <label>
          Público
          <input
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            style={{ display: 'block', width: '100%', marginBottom: 12 }}
            placeholder="Ex: Jovem / Festa"
          />
        </label>

        <label>
          Objetivo
          <input
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            style={{ display: 'block', width: '100%', marginBottom: 12 }}
            placeholder="Ex: Divulgar novidade"
          />
        </label>

        <label>
          URL da imagem (opcional)
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            style={{ display: 'block', width: '100%', marginBottom: 16 }}
            placeholder="https://..."
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar campanha'}
        </button>
      </form>

      <p style={{ marginTop: 16 }}>
        <a href="/campaigns">← Voltar para campanhas</a>
      </p>
    </div>
  );
}
