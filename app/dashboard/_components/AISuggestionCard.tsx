import React from "react";
import Link from "next/link";

// Fetches weather from HG Brasil Weather (Free API, no key required for basic city name search via format=json-cors)
async function fetchWeather(city: string, state?: string) {
    if (!city || city.trim() === "") return null;

    try {
        // HG Brasil Weather allows fetching directly by city name freely. 
        // Best approach is city_name="City, State"
        const query = state ? `${city},${state}` : city;
        const res = await fetch(
            `https://api.hgbrasil.com/weather?format=json-cors&city_name=${encodeURIComponent(query)}`,
            { next: { revalidate: 1800 } } // Cache por 30 mins
        );
        const data = await res.json();

        if (!data || !data.results || data.by !== "city_name") return null;

        const results = data.results;

        // condition_slug maps to simple conditions like rain, clear_day, cloudly_day, etc.
        const slug = results.condition_slug || "";
        const isRaining = slug === "rain" || slug === "storm";
        const isSnowing = slug === "snow";
        const isCloudy = slug === "cloud" || slug === "cloudly_day" || slug === "cloudly_night";
        const isDay = data.results.currently === "dia";

        return {
            cityName: results.city,
            temp: results.temp,
            isRaining,
            isSnowing,
            isCloudy,
            isDay
        };
    } catch (error) {
        console.error("Falha ao buscar clima para IA:", error);
        return null;
    }
}

export async function AISuggestionCard({ storeName, city }: { storeName: string; city: string }) {
    const weather = await fetchWeather(city);

    const now = new Date();
    const hour = now.getHours();

    // Parâmetros baseados na hora local do servidor/usuário (fallback)
    let timeGreeting = "Oportunidade Perfeita!";
    let timeIcon = "☀️";
    let suggestionText = `Que tal focar em produtos que costumam vender bem hoje? Crie uma campanha para engajar seus clientes.`;

    // Se não houver clima, usa lógica baseada APENAS na hora
    if (!weather) {
        if (hour >= 18 || hour < 5) {
            timeGreeting = "Prepare-se para amanhã! ✨";
            timeIcon = "🌙";
            suggestionText = `O dia está terminando, mas amanhã há novas chances. Vamos criar algo de "Bom dia" e surpreender logo cedo?`;
        } else if (hour >= 12 && hour < 18) {
            timeGreeting = "Boa tarde produtiva!";
            timeIcon = "☕";
            suggestionText = `Tarde movimentada? Reforce sua presença digital com um Vídeo Curto dos produtos mais populares da sua loja.`;
        } else {
            timeGreeting = "Bom dia, excelentes vendas!";
            timeIcon = "🌅";
            suggestionText = `Aproveite a energia da manhã. Uma campanha relâmpago hoje atrai clientes para a loja à tarde!`;
        }
    } else {
        // Lógica COMBINADA (Hora + Clima)
        if (weather.isRaining) {
            timeGreeting = "Tempo chuvoso lá fora! 🌧️";
            timeIcon = "☔";
            suggestionText = `A chuva em ${weather.cityName} deixa as pessoas mais conectadas. Destaque produtos de "conforto em casa" ou reforce seu serviço de delivery!`;
        } else if (weather.temp > 30) {
            timeGreeting = "Dia muito quente! 🌡️";
            timeIcon = "🔥";
            suggestionText = `Fazendo incríveis ${weather.temp}°C em ${weather.cityName}! Promova itens refrescantes, de verão ou mais leves. O calor atrai esse desejo imediato!`;
        } else if (weather.temp < 15) {
            timeGreeting = "Esfriou por aí! 🥶";
            timeIcon = "❄️";
            suggestionText = `${weather.temp}°C em ${weather.cityName}... Oportunidade gigante para postar sobre novidades térmicas, conforto e se aquecer neste friozinho!`;
        } else if (!weather.isDay) {
            timeGreeting = "A noite é das ideias! 🌙";
            timeIcon = "🦉";
            suggestionText = `A noite em ${weather.cityName} já chegou (${weather.temp}°C). Muitas pessoas relaxam olhando o feed agora. Agende uma campanha visual para estarem prontos amanhã!`;
        } else {
            timeGreeting = "Dia lindo perfeito para vendas! ☀️";
            timeIcon = "🌞";
            suggestionText = `Aproveite o dia agradável em ${weather.cityName}. Perfeito para convidar clientes a visitarem seu espaço ou mostrar um lançamento exclusivo!`;
        }
    }

    return (
        <div className="group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 shadow-premium text-white transition-all hover:shadow-lg hover:-translate-y-[1px]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-6xl font-bold">{timeIcon}</span>
            </div>

            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                    Dica de IA {weather ? "Contextualizada" : "para sua loja"}
                </div>

                <h3 className="mt-4 text-xl font-bold leading-tight">
                    {timeGreeting}
                </h3>

                <p className="mt-2 text-sm text-emerald-50 leading-relaxed text-pretty max-w-md">
                    <span className="font-semibold text-white">{storeName}</span>, {suggestionText}
                </p>

                <Link
                    href="/dashboard/campaigns/new?source=ai_weather"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-emerald-700 shadow-xl shadow-emerald-900/20 hover:bg-slate-50 transition-all active:scale-95"
                >
                    Preparar campanha <span className="ml-1">→</span>
                </Link>
            </div>
        </div>
    );
}
