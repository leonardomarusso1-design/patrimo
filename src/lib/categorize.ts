// Sugestão de categoria/tipo a partir da descrição do extrato. Heurística por
// palavra-chave — o usuário sempre ajusta antes de confirmar a importação.

type Rule = { cat: string; fixed?: boolean; kw: string[] };

const RULES: Rule[] = [
  { cat: "Mercado", kw: ["mercado", "supermerc", "atacad", "hortifruti", "carrefour", "assai", "assaí", "pao de acucar", "pão de açúcar", "big", "extra", "sams club"] },
  { cat: "Alimentação", kw: ["ifood", "rappi", "restaurante", "lanchonete", "padaria", "pizzaria", "burguer", "burger", "mc donalds", "mcdonald", "bk ", "subway", "cafe", "café", "bar "] },
  { cat: "Transporte", kw: ["uber", "99app", "99 *", "99pop", "cabify", "posto", "shell", "ipiranga", "petrobras", "combustivel", "combustível", "estacionamento", "pedagio", "pedágio", "metro", "metrô", "bilhete unico", "gasolina"] },
  { cat: "Moradia", fixed: true, kw: ["aluguel", "condominio", "condomínio", "iptu", "imobiliaria", "imobiliária"] },
  { cat: "Contas", fixed: true, kw: ["energia", "enel", "cpfl", "light", "cemig", "copel", "sabesp", "agua", "água", "saneamento", "gas ", "comgas", "internet", "vivo fibra", "claro", "tim ", "oi fibra", "net "] },
  { cat: "Assinaturas", fixed: true, kw: ["netflix", "spotify", "amazon prime", "disney", "hbo", "max ", "youtube premium", "globoplay", "deezer", "apple.com/bill", "google play", "chatgpt", "openai"] },
  { cat: "Saúde", kw: ["farmacia", "farmácia", "drogaria", "droga raia", "drogasil", "pacheco", "hospital", "clinica", "clínica", "laboratorio", "laboratório", "unimed", "amil", "hapvida", "psicolog", "dentista"] },
  { cat: "Educação", fixed: true, kw: ["escola", "faculdade", "universidade", "curso", "udemy", "alura", "colegio", "colégio", "mensalidade"] },
  { cat: "Lazer", kw: ["cinema", "ingresso", "show", "teatro", "steam", "playstation", "xbox", "nintendo", "viagem", "hotel", "airbnb", "booking", "latam", "gol ", "azul "] },
  { cat: "Compras", kw: ["amazon", "mercado livre", "mercadolivre", "shopee", "aliexpress", "magazine", "magalu", "americanas", "casas bahia", "renner", "riachuelo", "zara", "shein"] },
  { cat: "Serviços", kw: ["academia", "smartfit", "smart fit", "barbearia", "cabelereiro", "cabeleireiro", "salao", "salão", "lavanderia", "pet shop", "petz"] },
];

function norm(s: string) {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

export function suggestCategory(description: string): string | null {
  const d = norm(description);
  for (const r of RULES) {
    if (r.kw.some((k) => d.includes(k))) return r.cat;
  }
  return null;
}

/** Só devolve "expense_fixed" quando a descrição casa com um gasto recorrente. */
export function suggestKind(description: string): "expense_fixed" | null {
  const d = norm(description);
  for (const r of RULES) {
    if (r.fixed && r.kw.some((k) => d.includes(k))) return "expense_fixed";
  }
  return null;
}
