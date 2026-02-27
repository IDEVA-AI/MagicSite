import { NextResponse } from "next/server"
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"
import { getActiveInstitution, queryPartnerDatabase } from "@/lib/partnership"

function getAdminClient() {
  return createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { found: false, error: "Email é obrigatório" },
        { status: 400 }
      )
    }

    const trimmedEmail = email.trim().toLowerCase()
    const supabase = getAdminClient()

    // Check if user already exists in auth.users — if so, it's a wrong password issue
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const userExists = existingUsers?.users?.some(
      (u) => u.email?.toLowerCase() === trimmedEmail
    )
    if (userExists) {
      return NextResponse.json({ found: false })
    }

    // Check partner database
    const institution = await getActiveInstitution()
    if (!institution) {
      return NextResponse.json({ found: false })
    }

    const partnerData = await queryPartnerDatabase(institution, trimmedEmail)
    if (!partnerData) {
      return NextResponse.json({ found: false })
    }

    // Check if validation was already used
    const { data: existingValidation } = await supabase
      .from("partnership_validations")
      .select("id")
      .eq("validated_email", partnerData.email)
      .eq("is_used", true)
      .limit(1)

    if (existingValidation && existingValidation.length > 0) {
      return NextResponse.json({ found: false })
    }

    // Create validation record
    const { data: validation, error } = await supabase
      .from("partnership_validations")
      .insert({
        institution_id: institution.id,
        input_email_or_cpf: trimmedEmail,
        validated_name: partnerData.name,
        validated_email: partnerData.email,
        validated_cpf: null,
        is_used: false,
        validated_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (error || !validation) {
      return NextResponse.json({ found: false })
    }

    return NextResponse.json({
      found: true,
      validationId: validation.id,
      name: partnerData.name,
      email: partnerData.email,
    })
  } catch {
    return NextResponse.json(
      { found: false, error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
