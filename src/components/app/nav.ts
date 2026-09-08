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
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  locked?: boolean;
};

export type NavSection = { title: string; items: NavItem[] };

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Dia a dia",
    items: [
      { href: "/app", label: "Início", icon: LayoutGrid },
      { href: "/app/orcamento", label: "Orçamento", icon: ArrowLeftRight },
      { href: "/app/contas", label: "Contas e cartões", icon: Wallet },
      { href: "/app/metas", label: "Metas", icon: Target },
    ],
  },
  {
    title: "Planejar",
    items: [
      { href: "/app/visao-geral", label: "Visão geral", icon: BarChart3 },
      { href: "/app/reserva", label: "Reserva de emergência", icon: ShieldCheck },
      { href: "/app/patrimonio", label: "Patrimônio", icon: Landmark },
    ],
  },
  {
    title: "Crescer",
    items: [
      { href: "/app/investimentos", label: "Investimentos", icon: TrendingUp },
      { href: "/app/calculadoras", label: "Calculadoras", icon: Calculator },
      { href: "/app/escola", label: "Escola", icon: GraduationCap },
    ],
  },
  {
    title: "Conta",
    items: [
      { href: "/app/conexoes", label: "Contas conectadas", icon: Link2, locked: true },
      { href: "/app/configuracoes", label: "Configurações", icon: Settings },
    ],
  },
];

/** Lista plana, na ordem — usada pelo bottom nav mobile e pelo mock da landing. */
export const NAV: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);
