export type CardBackend = {
  id: string;
  numeroCartao: string;
  nome: string;
  status: boolean;        
  tipoCartao: 'COMUM'|'ESTUDANTE'|'TRABALHADOR'|string;
};