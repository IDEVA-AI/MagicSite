import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MessageCircle, Mail, BookOpen, Video } from "lucide-react"

export default function HelpPage() {
  const faqs = [
    {
      question: "Como funciona o sistema de créditos?",
      answer:
        "Cada ação no sistema consome créditos: criar projeto (5), gerar briefing (10), criar conteúdo (5). O download é gratuito. Seus créditos renovam mensalmente de acordo com seu plano.",
    },
    {
      question: "Posso editar o conteúdo gerado pela IA?",
      answer:
        "Sim! Após a geração, você pode editar qualquer seção do conteúdo antes de fazer o download. As edições não consomem créditos adicionais.",
    },
    {
      question: "Quanto tempo leva para gerar um site completo?",
      answer:
        "O processo completo leva cerca de 10-15 minutos: 5 minutos para preencher informações, 2 minutos para análise estratégica, 3 minutos para criação de conteúdo e 1 minuto para download.",
    },
    {
      question: "Posso usar o conteúdo gerado comercialmente?",
      answer:
        "Sim! Todo conteúdo gerado é 100% seu. Você tem direitos completos para usar, modificar e publicar como desejar.",
    },
    {
      question: "O que acontece se meus créditos acabarem?",
      answer:
        "Você pode fazer upgrade do plano ou comprar créditos extras. Seus projetos salvos permanecem acessíveis mesmo sem créditos.",
    },
    {
      question: "Posso cancelar minha assinatura a qualquer momento?",
      answer:
        "Sim, você pode cancelar quando quiser. Seus créditos e projetos permanecerão ativos até o fim do período pago.",
    },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Central de Ajuda</h1>
        <p className="text-muted-foreground">Encontre respostas e entre em contato com nosso suporte</p>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="p-6 text-center">
            <BookOpen className="w-8 h-8 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-1">Documentação</h3>
            <p className="text-sm text-muted-foreground">Guias completos</p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="p-6 text-center">
            <Video className="w-8 h-8 mx-auto mb-3 text-[oklch(0.6_0.12_280)]" />
            <h3 className="font-semibold mb-1">Tutoriais</h3>
            <p className="text-sm text-muted-foreground">Vídeos passo a passo</p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="p-6 text-center">
            <MessageCircle className="w-8 h-8 mx-auto mb-3 text-[oklch(0.55_0.1_160)]" />
            <h3 className="font-semibold mb-1">Chat ao Vivo</h3>
            <p className="text-sm text-muted-foreground">Suporte imediato</p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="p-6 text-center">
            <Mail className="w-8 h-8 mx-auto mb-3 text-accent" />
            <h3 className="font-semibold mb-1">Email</h3>
            <p className="text-sm text-muted-foreground">Contato direto</p>
          </CardContent>
        </Card>
      </div>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle>Perguntas Frequentes</CardTitle>
          <CardDescription>Respostas para as dúvidas mais comuns</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact Form */}
      <Card>
        <CardHeader>
          <CardTitle>Ainda precisa de ajuda?</CardTitle>
          <CardDescription>Envie sua dúvida e nossa equipe responderá em até 24 horas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" placeholder="Seu nome" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Assunto</Label>
            <Input id="subject" placeholder="Como podemos ajudar?" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea id="message" placeholder="Descreva sua dúvida ou problema..." rows={6} />
          </div>

          <Button className="w-full sm:w-auto">Enviar Mensagem</Button>
        </CardContent>
      </Card>
    </div>
  )
}
