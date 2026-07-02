import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateBalance(transactions: { amount: number, type: 'gave' | 'got' }[]) {
  return transactions.reduce((acc, curr) => {
    if (curr.type === 'gave') return acc + curr.amount; // You gave money -> someone owes you (+ balance)
    return acc - curr.amount; // You got money -> you owe them (- balance)
  }, 0);
}
