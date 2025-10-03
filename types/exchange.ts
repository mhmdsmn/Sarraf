export interface Transaction {
  inputCurrency: "usd" | "lbp";
  amount: number;
  result: number;
  rate: number;
  fromCurrency: string;
  toCurrency: string;
  toMyBox: boolean;
  profit: number;
  timestamp: number;
}

export interface ExchangeState {
  buyRate: number;
  sellRate: number;
  transactions: Transaction[];
  myBalance: number;
  hisBalance: number;
  totalProfit: number;
}