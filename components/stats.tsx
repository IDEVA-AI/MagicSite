const stats = [
  {
    value: "50-100x",
    label: "mais barato",
    description: "que agências tradicionais",
  },
  {
    value: "40-60x",
    label: "mais rápido",
    description: "minutos vs semanas",
  },
  {
    value: "47",
    label: "variáveis",
    description: "análise estratégica profunda",
  },
  {
    value: "200",
    label: "créditos/mês",
    description: "no plano inicial",
  },
]

export function Stats() {
  return (
    <section className="py-20 border-y border-border/40">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-lg font-semibold mb-1">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
