
import React from 'react';
import { FAQItem, Benefit } from './types';

export const PRIMARY_COLOR = 'blue-600';
export const PRICE_ORIGINAL = 'R$ 97,00';
export const PRICE_DISCOUNT = 'R$ 29,90';
export const PIX_KEY = "financeiro@guiadealuguel.com.br";
export const PRODUCT_LINK = "https://seu-dominio.com/download/guia-aluguel-pdf";

export interface Testimonial {
  name: string;
  role: string;
  text: string;
  stars: number;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Ricardo Mendes",
    role: "Proprietário de 2 imóveis",
    text: "Eu estava desesperado com o Carnê-Leão. O guia me mostrou como deduzir despesas que eu nem imaginava. Economizei mais de R$ 2.000 logo no primeiro mês.",
    stars: 5
  },
  {
    name: "Dra. Helena Silva",
    role: "Médica e Investidora",
    text: "Material direto ao ponto. Consegui regularizar meus aluguéis de 2024 sem precisar gastar fortunas com consultoria especializada. Recomendo muito!",
    stars: 5
  },
  {
    name: "Carlos Alberto",
    role: "Aposentado",
    text: "Simples de entender para quem não entende nada de computador ou impostos. O passo a passo do preenchimento é perfeito.",
    stars: 5
  }
];

export const LEARNING_POINTS = [
  "Como preencher o Carnê-Leão passo a passo",
  "Lista de despesas que você pode abater legalmente",
  "Como evitar cair na Malha Fina da Receita Federal",
  "Diferença entre declarar como Pessoa Física ou Jurídica",
  "Como regularizar aluguéis recebidos em anos anteriores",
  "Modelos de recibos e contratos prontos para uso"
];

export const FAQS: FAQItem[] = [
  {
    question: "O guia funciona para pessoa física?",
    answer: "Sim, o guia é focado 100% em proprietários pessoa física que recebem aluguéis e precisam declarar no carnê-leão ou no ajuste anual."
  },
  {
    question: "Preciso ser contador para entender?",
    answer: "De forma alguma. O guia utiliza uma linguagem simples e direta para que qualquer pessoa consiga seguir o passo a passo, mesmo sem conhecimento contábil."
  },
  {
    question: "O pagamento é único?",
    answer: "Sim! Você paga apenas uma vez R$ 29,90 e tem acesso vitalício ao material e todas as atualizações futuras para as declarações de 2026 e 2027."
  },
  {
    question: "Como recebo o acesso?",
    answer: "Imediatamente após a confirmação do pagamento. Você receberá um link por e-mail e também poderá baixar aqui no site usando seu código de pedido."
  }
];

export const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
  </svg>
);

export const WarningIcon = () => (
  <svg className="w-8 h-8 text-red-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
