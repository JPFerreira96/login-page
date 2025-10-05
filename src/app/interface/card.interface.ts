import { CardType } from "../types/card.type";

export interface Card {
  id: string;
  type: CardType;
  serial?: string;         
  numeroCartao?: string;   
  nome?: string;           
  status: 'ATIVO' | 'BLOQUEADO';
  balance?: number;        
  favorite?: boolean;
}