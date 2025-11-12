// Deno type definitions for VS Code
// This file silences TypeScript errors in Supabase Edge Functions

declare namespace Deno {
  export const env: {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    toObject(): { [key: string]: string };
  };
}

declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(
    handler: (req: Request) => Response | Promise<Response>
  ): void;
}

declare module "https://esm.sh/stripe@14.21.0?target=deno" {
  import Stripe from "stripe";
  export default Stripe;
}

declare module "https://esm.sh/@supabase/supabase-js@2.39.7" {
  export * from "@supabase/supabase-js";
}
