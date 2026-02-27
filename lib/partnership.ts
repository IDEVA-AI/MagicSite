import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"

function getAdminClient() {
  return createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

interface PartnerInstitution {
  id: string
  name: string
  slug: string
  supabase_url: string
  supabase_table: string
  is_active: boolean
  discount_percentage: number
}

interface PartnerStudentData {
  name: string
  email: string
  isActive: boolean
}

export async function getActiveInstitution(): Promise<PartnerInstitution | null> {
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from("partner_institutions")
    .select("*")
    .eq("is_active", true)
    .limit(1)
    .single()

  if (error || !data) return null
  return data
}

export async function queryPartnerDatabase(
  institution: PartnerInstitution,
  emailOrCpf: string
): Promise<PartnerStudentData | null> {
  try {
    // Read the anon key from partner_institutions or use a convention
    // For now, we fetch from the partner's Supabase using the public REST API
    const PARTNER_ANON_KEY = process.env.PARTNER_SUPABASE_ANON_KEY
    if (!PARTNER_ANON_KEY) {
      console.error("PARTNER_SUPABASE_ANON_KEY not configured")
      return null
    }

    const isEmail = emailOrCpf.includes("@")
    const searchParam = isEmail ? "email" : "document_number"
    const searchValue = isEmail ? emailOrCpf.toLowerCase() : emailOrCpf.replace(/\D/g, "")

    const url = `${institution.supabase_url}/rest/v1/${institution.supabase_table}?${searchParam}=eq.${encodeURIComponent(searchValue)}&plan_active=is.true`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        apikey: PARTNER_ANON_KEY,
        Authorization: `Bearer ${PARTNER_ANON_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) return null

    const students = await response.json()
    if (students && students.length > 0) {
      const student = students[0]
      return {
        name: student.name || student.full_name || "Nome não informado",
        email: student.email || emailOrCpf,
        isActive: student.plan_active === true,
      }
    }

    return null
  } catch (error) {
    console.error("Erro ao consultar base da escola parceira:", error)
    return null
  }
}

export async function validatePartnerUser(emailOrCpf: string): Promise<{
  success: boolean
  data?: { validationId: string; name: string; email: string }
  error?: string
}> {
  const supabase = getAdminClient()

  const institution = await getActiveInstitution()
  if (!institution) {
    return { success: false, error: "Nenhuma instituição parceira ativa encontrada." }
  }

  const partnerData = await queryPartnerDatabase(institution, emailOrCpf)
  if (!partnerData) {
    return { success: false, error: "Aluno não encontrado na base da escola parceira ou inativo." }
  }

  // Check if already used
  const { data: existingValidation } = await supabase
    .from("partnership_validations")
    .select("id")
    .eq("validated_email", partnerData.email)
    .eq("is_used", true)
    .limit(1)

  if (existingValidation && existingValidation.length > 0) {
    return { success: false, error: "Este email já foi utilizado para criar uma conta." }
  }

  // Check if user already exists in auth
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const userExists = existingUsers?.users?.some(
    (u) => u.email?.toLowerCase() === partnerData.email.toLowerCase()
  )
  if (userExists) {
    return { success: false, error: "Já existe uma conta com este email." }
  }

  const isEmail = emailOrCpf.includes("@")

  const { data: validation, error } = await supabase
    .from("partnership_validations")
    .insert({
      institution_id: institution.id,
      input_email_or_cpf: emailOrCpf,
      validated_name: partnerData.name,
      validated_email: partnerData.email,
      validated_cpf: isEmail ? null : emailOrCpf.replace(/\D/g, ""),
      is_used: false,
      validated_at: new Date().toISOString(),
    })
    .select("id")
    .single()

  if (error || !validation) {
    return { success: false, error: "Erro ao registrar validação." }
  }

  return {
    success: true,
    data: {
      validationId: validation.id,
      name: partnerData.name,
      email: partnerData.email,
    },
  }
}

export async function getValidation(validationId: string) {
  const supabase = getAdminClient()
  const { data } = await supabase
    .from("partnership_validations")
    .select("*")
    .eq("id", validationId)
    .single()
  return data
}

export async function markValidationAsUsed(validationId: string, userId: string) {
  const supabase = getAdminClient()
  await supabase
    .from("partnership_validations")
    .update({ is_used: true, used_by_user_id: userId, used_at: new Date().toISOString() })
    .eq("id", validationId)
}

export async function getPartnershipPlans() {
  const supabase = getAdminClient()
  const { data } = await supabase
    .from("partnership_plans")
    .select("*")
    .eq("is_active", true)
    .order("credits_amount", { ascending: true })
  return data || []
}

export async function seedPartnershipPlans() {
  const supabase = getAdminClient()

  const institution = await getActiveInstitution()
  if (!institution) return

  const { data: existing } = await supabase
    .from("partnership_plans")
    .select("id")
    .eq("institution_id", institution.id)
    .limit(1)

  if (existing && existing.length > 0) return

  await supabase.from("partnership_plans").insert([
    {
      institution_id: institution.id,
      plan_name: "smart",
      credits_amount: 200,
      original_price_cents: 3600,
      partnership_price_cents: 0,
      is_active: true,
    },
    {
      institution_id: institution.id,
      plan_name: "pro",
      credits_amount: 600,
      original_price_cents: 6000,
      partnership_price_cents: 6000,
      is_active: true,
    },
    {
      institution_id: institution.id,
      plan_name: "plus",
      credits_amount: 2000,
      original_price_cents: 10000,
      partnership_price_cents: 10000,
      is_active: true,
    },
  ])
}
