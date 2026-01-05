
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  type?: 'text' | 'order' | 'map';
  data?: any;
  links?: { title: string; uri: string }[];
}

export interface FoodOrder {
  restaurantName: string;
  items: Array<{ name: string; price: number; quantity: number }>;
  total: number;
  deliveryAddress: string;
  eta: string;
}

export interface Restaurant {
  name: string;
  rating: number;
  description: string;
  location: string;
}
