/** Dados que a tela do painel pode mostrar. Sem segredo e sem número em claro. */

export type PanelData = {
  enabled: boolean;
  ready: boolean;
  linked: boolean;
  maskedPhone: string | null;
  alerts: boolean;
  daily: boolean;
  weekly: boolean;
  monthly: boolean;
  used: number;
  bonus: number;
  quota: number;
  packSize: number;
  checkoutUrl: string | null;
  publicNumber: string | null;
};
