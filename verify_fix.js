function getStandardizedStrategy(positioning = "") {
  const p = (positioning || "").toLowerCase();
  
  if (p.includes("promo") || p.includes("promoção") || p.includes("promocao") || 
      p.includes("desconto") || p.includes("oferta") || p.includes("liquidação") || 
      p.includes("liquidacao") || p.includes("barato") || p.includes("oportunidade")) {
    return "OFERTA";
  }
  
  if (p.includes("combo") || p.includes("kit") || p.includes("pack") || 
      p.includes("leve mais") || p.includes("conjunto")) {
    return "COMBO";
  }
  
  if (p.includes("momento") || p.includes("ocasião") || p.includes("familia") || p.includes("família") || 
      p.includes("jantar") || p.includes("especial") || p.includes("celebração") || 
      p.includes("celebracao") || p.includes("festa")) {
    return "MOMENTO";
  }
  
  if (p.includes("presente") || p.includes("gift") || p.includes("surpreender")) {
    return "PRESENTE";
  }
  
  return "DESTAQUE";
}

console.log("Testing with null:", getStandardizedStrategy(null));
console.log("Testing with undefined:", getStandardizedStrategy(undefined));
console.log("Testing with empty string:", getStandardizedStrategy(""));
console.log("Testing with 'Promoção':", getStandardizedStrategy("Promoção"));
console.log("Testing with 'Especial':", getStandardizedStrategy("Especial"));
console.log("Test finished.");
