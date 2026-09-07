export const CURRENCIES = [
  { code: "BRL", label: "Real brasileiro (R$)" },
  { code: "USD", label: "Dólar americano ($)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "GBP", label: "Libra esterlina (£)" },
  { code: "CAD", label: "Dólar canadense (C$)" },
  { code: "AUD", label: "Dólar australiano (A$)" },
] as const;

export const INCOME_BANDS = [
  "Até R$ 2.000",
  "R$ 2.001 – R$ 4.000",
  "R$ 4.001 – R$ 8.000",
  "R$ 8.001 – R$ 15.000",
  "R$ 15.001 – R$ 25.000",
  "R$ 25.001 – R$ 50.000",
  "R$ 50.001 – R$ 100.000",
  "Acima de R$ 100.000",
] as const;

export const OCCUPATIONS = [
  "CLT / Empregado(a)",
  "Autônomo(a) / Freelancer",
  "Empresário(a)",
  "Servidor(a) público(a)",
  "Estudante",
  "Aposentado(a)",
  "Outro",
] as const;

export const COUNTRIES = [
  "Brasil",
  "Portugal",
  "Estados Unidos",
  "Canadá",
  "Reino Unido",
  "Austrália",
  "Outro",
] as const;

export const BR_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

export const ONBOARDING_STEPS = [
  { key: "currency", label: "Moeda", question: "Em qual moeda você quer ver os valores?" },
  { key: "income", label: "Renda", question: "Qual sua faixa de renda mensal?" },
  { key: "occupation", label: "Profissão", question: "O que você faz hoje?" },
  { key: "location", label: "Localidade", question: "Onde você está?" },
  { key: "terms", label: "Termos", question: "Leia e aceite para continuar" },
] as const;
