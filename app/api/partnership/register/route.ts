import { NextResponse } from "next/server"
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"
import { getValidation, markValidationAsUsed } from "@/lib/partnership"

function getAdminClient() {
  return createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: Request) {
  try {
    const { validationId, password } = await request.json()

    if (!validationId || !password) {
      return NextResponse.json(
        { success: false, error: "Todos os campos são obrigatórios" },
        { status: 400 }
      )
    }

    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      )
    }

    const validation = await getValidation(validationId)
    if (!validation) {
      return NextResponse.json(
        { success: false, error: "Validação não encontrada ou expirada" },
        { status: 400 }
      )
    }

    if (validation.is_used) {
      return NextResponse.json(
        { success: false, error: "Esta validação já foi utilizada" },
        { status: 400 }
      )
    }

    const supabase = getAdminClient()

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: validation.validated_email,
      password,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      const msg = authError?.message || "Erro ao criar conta"
      return NextResponse.json({ success: false, error: msg }, { status: 400 })
    }

    const userId = authData.user.id

    // Create profile
    await supabase.from("profiles").insert({
      id: userId,
      name: validation.validated_name,
      partnership_source: "escola_negocios",
      email_verified: true,
    })

    // Mark validation as used
    await markValidationAsUsed(validationId, userId)

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        name: validation.validated_name,
        email: validation.validated_email,
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
