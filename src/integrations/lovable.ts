import {
  createLovableAuth,
  type OAuthProvider,
  type SignInWithOAuthOptions,
} from "@lovable.dev/cloud-auth-js";
import { supabase } from "@/integrations/supabase/client";

const lovableAuth = createLovableAuth();

type LovableSignInResult =
  | { error: Error; redirected: false }
  | { error: null; redirected: true }
  | { error: null; redirected: false };

export const lovable = {
  auth: {
    async signInWithOAuth(
      provider: OAuthProvider,
      opts?: SignInWithOAuthOptions,
    ): Promise<LovableSignInResult> {
      const result = await lovableAuth.signInWithOAuth(provider, opts);
      if (result.error) return { error: result.error, redirected: false };
      if (result.redirected) return { error: null, redirected: true };
      const { error } = await supabase.auth.setSession(result.tokens);
      if (error) return { error, redirected: false };
      return { error: null, redirected: false };
    },
  },
};
