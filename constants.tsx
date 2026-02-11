
import React from 'react';
import { FAQItem } from './types';

export const PRIMARY_COLOR = 'blue-600';
export const PRICE_ORIGINAL = 'R$ 97,00';
export const PRICE_DISCOUNT = 'R$ 29,90';
export const PIX_KEY = "financeiro@guiadealuguel.com.br";
export const PRODUCT_LINK = "https://seu-dominio.com/download/guia-aluguel-pdf";

export const FAQS: FAQItem[] = [
  {
    question: "Funciona para pessoa física?",
    answer: "Sim, o guia é focado 100% em proprietários pessoa física que recebem aluguéis e precisam declarar no carnê-leão ou no ajuste anual."
  },
  {
    question: "Preciso ser contador?",
    answer: "De forma alguma. O guia utiliza uma linguagem simples e direta para que qualquer pessoa consiga seguir o passo a passo."
  },
  {
    question: "Serve para quem nunca declarou?",
    answer: "Sim, inclusive ensinamos como regularizar situações de anos anteriores de forma a minimizar as multas por atraso."
  },
  {
    question: "Quanto tempo tenho acesso?",
    answer: "O acesso é imediato e vitalício. Você pode consultar sempre que precisar fazer uma nova declaração."
  }
];

export const CheckIcon = () => (
  <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

export const WarningIcon = () => (
  <svg className="w-8 h-8 text-red-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
