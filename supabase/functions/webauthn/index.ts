import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  generateRegistrationOptions,
  generateAuthenticationOptions,
  verifyRegistrationResponse,
  verifyAuthenticationResponse,
} from "https://esm.sh/@simplewebauthn/server@13.1.2?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ChallengeType = "registration" | "authentication";

type SupabaseClient = ReturnType<typeof createClient>;

type RegistrationResponseJSON = Record<string, unknown> & { id: string };
type AuthenticationResponseJSON = Record<string, unknown> & { id: string };

const siteOrigin =
  Deno.env.get("WEBAUTHN_ORIGIN") ??
  Deno.env.get("SITE_URL") ??
  "http://localhost:5173";
const rpID = Deno.env.get("WEBAUTHN_RP_ID") ?? new URL(siteOrigin).hostname;
const rpName = Deno.env.get("WEBAUTHN_RP_NAME") ?? "Chimera Security";
const allowedOrigins = (Deno.env.get("WEBAUTHN_ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);
const expectedOrigins = allowedOrigins.length > 0 ? allowedOrigins : [siteOrigin];

function bufferToBase64Url(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

function base64UrlToUint8Array(value: string): Uint8Array {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function persistChallenge(
  client: SupabaseClient,
  userId: string,
  challenge: string,
  type: ChallengeType,
) {
  const { error } = await client
    .from("webauthn_challenges")
    .upsert({ user_id: userId, type, challenge }, { onConflict: "user_id,type" });

  if (error) {
    throw new Error(error.message ?? "Failed to persist challenge");
  }
}

async function readChallenge(
  client: SupabaseClient,
  userId: string,
  type: ChallengeType,
) {
  const { data, error } = await client
    .from("webauthn_challenges")
    .select("challenge")
    .eq("user_id", userId)
    .eq("type", type)
    .maybeSingle();

  if (error) {
    throw new Error(error.message ?? "Failed to fetch challenge");
  }

  if (!data?.challenge) {
    throw new Error(`No ${type} challenge found for user`);
  }

  return data.challenge as string;
}

async function clearChallenge(
  client: SupabaseClient,
  userId: string,
  type: ChallengeType,
) {
  const { error } = await client
    .from("webauthn_challenges")
    .delete()
    .eq("user_id", userId)
    .eq("type", type);

  if (error) {
    throw new Error(error.message ?? "Failed to clear challenge");
  }
}

async function mintSessionTokens(userId: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase credentials are not configured");
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}/tokens`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({ claims: {} }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error_description ?? payload?.message ?? "Failed to mint session");
  }

  const { access_token: accessToken, refresh_token: refreshToken, expires_in: expiresIn } = payload ?? {};

  if (!accessToken || !refreshToken) {
    throw new Error("Supabase did not return session tokens");
  }

  return { accessToken, refreshToken, expiresIn: expiresIn ?? null };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const action = body?.action as string | undefined;

    if (!action) {
      throw new Error("Action is required");
    }

    switch (action) {
      case "generate-registration-options": {
        const userId = body?.userId as string | undefined;
        const email = body?.email as string | undefined;
        const displayName = body?.displayName as string | undefined;

        if (!userId) {
          throw new Error("userId is required");
        }

        const { data: credentials, error: credentialError } = await supabaseClient
          .from("webauthn_credentials")
          .select("credential_id")
          .eq("user_id", userId);

        if (credentialError) {
          throw new Error(credentialError.message ?? "Failed to load credentials");
        }

        const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(userId);

        if (userError) {
          throw new Error(userError.message ?? "Unable to load user");
        }

        const identifier = email ?? user?.email;

        if (!identifier) {
          throw new Error("An email address is required for registration");
        }

        const excludeCredentials = (credentials ?? []).map(({ credential_id }) => ({
          id: base64UrlToUint8Array(credential_id as string),
          type: "public-key" as const,
        }));

        const options = await generateRegistrationOptions({
          rpName,
          rpID,
          userID: userId,
          userName: identifier,
          userDisplayName: displayName ?? identifier,
          attestationType: "none",
          authenticatorSelection: {
            residentKey: "preferred",
            userVerification: "required",
          },
          excludeCredentials,
        });

        await persistChallenge(supabaseClient, userId, options.challenge, "registration");

        return new Response(
          JSON.stringify({ success: true, options }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      case "generate-authentication-options": {
        const userId = body?.userId as string | undefined;

        if (!userId) {
          throw new Error("userId is required");
        }

        const { data: credentials, error } = await supabaseClient
          .from("webauthn_credentials")
          .select("credential_id")
          .eq("user_id", userId);

        if (error) {
          throw new Error(error.message ?? "Failed to load credentials");
        }

        if (!credentials || credentials.length === 0) {
          throw new Error("No WebAuthn credentials registered");
        }

        const allowCredentials = credentials.map(({ credential_id }) => ({
          id: base64UrlToUint8Array(credential_id as string),
          type: "public-key" as const,
        }));

        const options = await generateAuthenticationOptions({
          rpID,
          userVerification: "required",
          allowCredentials,
        });

        await persistChallenge(supabaseClient, userId, options.challenge, "authentication");

        return new Response(
          JSON.stringify({ success: true, options }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      case "register": {
        const userId = body?.userId as string | undefined;
        const registrationResponse = body?.response as RegistrationResponseJSON | undefined;
        const deviceName = (body?.deviceName as string | undefined) ?? "Unknown Device";

        if (!userId || !registrationResponse) {
          throw new Error("userId and response are required");
        }

        const expectedChallenge = await readChallenge(supabaseClient, userId, "registration");

        const verification = await verifyRegistrationResponse({
          response: registrationResponse,
          expectedChallenge,
          expectedOrigin: expectedOrigins,
          expectedRPID: rpID,
          requireUserVerification: true,
        });

        if (!verification.verified || !verification.registrationInfo) {
          throw new Error("Registration verification failed");
        }

        const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;

        const credentialIdString = bufferToBase64Url(credentialID);
        const credentialPublicKeyString = bufferToBase64Url(credentialPublicKey);

        const { data: existingCredential } = await supabaseClient
          .from("webauthn_credentials")
          .select("id")
          .eq("credential_id", credentialIdString)
          .maybeSingle();

        if (existingCredential) {
          throw new Error("Credential already registered");
        }

        const insertResult = await supabaseClient
          .from("webauthn_credentials")
          .insert({
            user_id: userId,
            credential_id: credentialIdString,
            public_key: credentialPublicKeyString,
            counter,
            device_name: deviceName,
            created_at: new Date().toISOString(),
            last_used_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertResult.error) {
          throw new Error(insertResult.error.message ?? "Failed to store credential");
        }

        await clearChallenge(supabaseClient, userId, "registration");

        return new Response(
          JSON.stringify({ success: true, credential: insertResult.data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      case "authenticate": {
        const userId = body?.userId as string | undefined;
        const authenticationResponse = body?.response as AuthenticationResponseJSON | undefined;

        if (!userId || !authenticationResponse?.id) {
          throw new Error("userId and response are required");
        }

        const expectedChallenge = await readChallenge(supabaseClient, userId, "authentication");

        const { data: storedCredential, error: fetchError } = await supabaseClient
          .from("webauthn_credentials")
          .select("id, credential_id, public_key, counter")
          .eq("user_id", userId)
          .eq("credential_id", authenticationResponse.id)
          .maybeSingle();

        if (fetchError) {
          throw new Error(fetchError.message ?? "Failed to fetch credential");
        }

        if (!storedCredential) {
          throw new Error("Credential not found");
        }

        const verification = await verifyAuthenticationResponse({
          response: authenticationResponse,
          expectedChallenge,
          expectedOrigin: expectedOrigins,
          expectedRPID: rpID,
          requireUserVerification: true,
          authenticator: {
            credentialID: base64UrlToUint8Array(storedCredential.credential_id),
            credentialPublicKey: base64UrlToUint8Array(storedCredential.public_key),
            counter: storedCredential.counter ?? 0,
          },
        });

        if (!verification.verified || !verification.authenticationInfo) {
          throw new Error("Authentication verification failed");
        }

        const { newCounter } = verification.authenticationInfo;

        const { error: updateError } = await supabaseClient
          .from("webauthn_credentials")
          .update({
            counter: newCounter,
            last_used_at: new Date().toISOString(),
          })
          .eq("id", storedCredential.id);

        if (updateError) {
          throw new Error(updateError.message ?? "Failed to update credential");
        }

        await clearChallenge(supabaseClient, userId, "authentication");

        const tokens = await mintSessionTokens(userId);

        return new Response(
          JSON.stringify({
            success: true,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      case "list": {
        const userId = body?.userId as string | undefined;

        if (!userId) {
          throw new Error("userId is required");
        }

        const { data: credentials, error } = await supabaseClient
          .from("webauthn_credentials")
          .select("id, credential_id, device_name, created_at, last_used_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) {
          throw new Error(error.message ?? "Failed to load credentials");
        }

        return new Response(
          JSON.stringify({ success: true, credentials: credentials ?? [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      case "remove": {
        const userId = body?.userId as string | undefined;
        const credentialId = body?.credentialId as string | undefined;

        if (!userId || !credentialId) {
          throw new Error("userId and credentialId are required");
        }

        const { error } = await supabaseClient
          .from("webauthn_credentials")
          .delete()
          .eq("user_id", userId)
          .eq("credential_id", credentialId);

        if (error) {
          throw new Error(error.message ?? "Failed to remove credential");
        }

        return new Response(
          JSON.stringify({ success: true, message: "Credential removed successfully" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error("WebAuthn function error", error);
    const message = error instanceof Error ? error.message : "Unexpected error";

    return new Response(
      JSON.stringify({ success: false, error: message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
