import { NextResponse } from "next/server"
import { validatePartnerUser } from "@/lib/partnership"

export async function POST(request: Request) {
  try {
    const { emailOrCpf } = await request.json()

    if (!emailOrCpf || typeof emailOrCpf !== "string") {
      return NextResponse.json(
        { success: false, error: "Email ou CPF é obrigatório" },
        { status: 400 }
      )
    }

    const result = await validatePartnerUser(emailOrCpf.trim())
    return NextResponse.json(result, { status: result.success ? 200 : 400 })
  } catch {
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
