/**
 * Tipos do banco (Supabase/Postgres). Mantido em sincronia com
 * supabase/migrations/0001_init.sql. Regenerar com:
 *   supabase gen types typescript --linked > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Timestamps = {
  created_at: string;
  updated_at: string;
};

export type PlanId = "free" | "essential" | "pro" | "elite";
export type InvestorProfile = "conservador" | "moderado" | "arrojado";
export type BudgetKind = "income" | "expense_fixed" | "expense_variable";
export type InvestmentClass =
  | "renda_fixa"
  | "acao"
  | "fii"
  | "etf"
  | "cripto"
  | "cash"
  | "outro";
export type PatrimonyKind =
  | "liquidez"
  | "investimento"
  | "imovel"
  | "veiculo"
  | "outro_bem";

interface Table<Row, Insert = Partial<Row>, Update = Partial<Row>> {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
}

export interface Database {
  public: {
    Tables: {
      profiles: Table<
        {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          display_currency: string;
          income_band: string | null;
          occupation: string | null;
          country: string | null;
          state: string | null;
          city: string | null;
          onboarding_completed: boolean;
          plan: PlanId;
          plan_expires_at: string | null;
          marketing_opt_in: boolean;
          investor_profile: InvestorProfile | null;
          investor_profile_at: string | null;
        } & Timestamps
      >;
      budget_categories: Table<{
        id: string;
        user_id: string;
        name: string;
        color: string;
        kind: BudgetKind;
        created_at: string;
      }>;
      budget_entries: Table<
        {
          id: string;
          user_id: string;
          kind: BudgetKind;
          name: string;
          category: string | null;
          amount: number;
          due_day: number | null;
          reference_month: string; // date (yyyy-mm-01)
          entry_date: string | null; // date
          notes: string | null;
          created_at: string;
        }
      >;
      emergency_fund: Table<
        {
          user_id: string;
          protection_level: "basic" | "shield";
          essential_monthly_cost: number;
        } & Timestamps
      >;
      emergency_reserves: Table<{
        id: string;
        user_id: string;
        label: string;
        amount: number;
        created_at: string;
      }>;
      goals: Table<
        {
          id: string;
          user_id: string;
          name: string;
          target_amount: number;
          deadline: string | null;
          where_to_keep: string | null;
          archived: boolean;
        } & Timestamps
      >;
      goal_contributions: Table<{
        id: string;
        user_id: string;
        goal_id: string;
        amount: number;
        contributed_on: string;
        created_at: string;
      }>;
      investments: Table<
        {
          id: string;
          user_id: string;
          name: string;
          broker: string | null;
          asset_class: InvestmentClass;
          currency: string;
          invested_amount: number;
          current_amount: number;
        } & Timestamps
      >;
      patrimony_items: Table<
        {
          id: string;
          user_id: string;
          kind: PatrimonyKind;
          name: string;
          value: number;
          appraised_value: number | null;
          currency: string;
          fipe_code: string | null;
          is_debt: boolean;
          linked_debt_id: string | null;
        } & Timestamps
      >;
      debts: Table<
        {
          id: string;
          user_id: string;
          name: string;
          total_amount: number;
          remaining_amount: number;
          monthly_interest: number | null;
          monthly_payment: number | null;
          due_day: number | null;
        } & Timestamps
      >;
      school_progress: Table<{
        id: string;
        user_id: string;
        lesson_id: number;
        completed: boolean;
        completed_at: string | null;
        created_at: string;
      }>;
      blog_posts: Table<
        {
          id: string;
          slug: string;
          title: string;
          excerpt: string;
          content: string;
          author: string;
          cover_image: string | null;
          tags: string[];
          published: boolean;
          published_at: string | null;
        } & Timestamps
      >;
      analytics_events: Table<{
        id: string;
        user_id: string | null;
        event_name: string;
        event_data: Json | null;
        path: string | null;
        ip_hash: string | null;
        created_at: string;
      }>;
      cookie_consents: Table<{
        id: string;
        user_id: string | null;
        necessary: boolean;
        analytics: boolean;
        marketing: boolean;
        ip_hash: string | null;
        created_at: string;
      }>;
      subscriptions: Table<
        {
          id: string;
          user_id: string;
          plan: PlanId;
          status: "active" | "past_due" | "canceled" | "trialing";
          provider: string;
          provider_ref: string | null;
          current_period_end: string | null;
        } & Timestamps
      >;
      pending_purchases: Table<{
        email: string;
        plan: PlanId;
        expires_at: string;
        provider: string;
        provider_ref: string | null;
        created_at: string;
      }>;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertDto<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
