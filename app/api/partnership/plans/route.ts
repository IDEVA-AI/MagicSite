import { NextResponse } from "next/server"
import { getPartnershipPlans, seedPartnershipPlans } from "@/lib/partnership"

export async function GET() {
  try {
    await seedPartnershipPlans()
    const plans = await getPartnershipPlans()
    return NextResponse.json(plans)
  } catch {
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
