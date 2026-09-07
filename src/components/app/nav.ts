import {
  LayoutGrid,
  BarChart3,
  ArrowLeftRight,
  ShieldCheck,
  Target,
  TrendingUp,
  Landmark,
  GraduationCap,
  Calculator,
  Link2,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const NAV: NavItem[] = [
  { href: "/app", label: "Início", icon: LayoutGrid },
  { href: "/app/visao-geral", label: "Visão geral", icon: BarChart3 },
  { href: "/app/orcamento", label: "Orçamento", icon: ArrowLeftRight },
  { href: "/app/reserva", label: "Reserva de emergência", icon: ShieldCheck },
  { href: "/app/metas", label: "Metas", icon: Target },
  { href: "/app/investimentos", label: "Investimentos", icon: TrendingUp },
  { href: "/app/patrimonio", label: "Patrimônio", icon: Landmark },
  { href: "/app/escola", label: "Escola", icon: GraduationCap },
  { href: "/app/calculadoras", label: "Calculadoras", icon: Calculator },
  { href: "/app/conexoes", label: "Contas conectadas", icon: Link2 },
  { href: "/app/configuracoes", label: "Configurações", icon: Settings },
];
