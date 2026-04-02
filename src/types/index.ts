import { Role, OrderStatus } from '@prisma/client';

export type AuthToken = {
  id: string;
  email: string;
  role: Role;
};

export type ServiceDTO = {
  id: string;
  title: string;
  description: string;
  price: number;
  categoryId: string;
  images: string[];
  seller: {
    id: string;
    name: string;
    avatar?: string;
  };
};

export type OrderDTO = {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  commissionAmount: number;
  sellerAmount: number;
  buyer: {
    id: string;
    name: string;
  };
  seller: {
    id: string;
    name: string;
  };
  items: OrderItemDTO[];
  createdAt: Date;
};

export type OrderItemDTO = {
  id: string;
  serviceId: string;
  quantity: number;
  price: number;
  service: {
    title: string;
  };
};

export type ConversationDTO = {
  id: string;
  initiator: {
    id: string;
    name: string;
    avatar?: string;
  };
  target: {
    id: string;
    name: string;
    avatar?: string;
  };
  lastMessage?: {
    content: string;
    createdAt: Date;
  };
};

export type MessageDTO = {
  id: string;
  content: string;
  fromUser: {
    id: string;
    name: string;
  };
  readAt?: Date;
  createdAt: Date;
};

export type ReviewDTO = {
  id: string;
  rating: number;
  comment?: string;
  reviewer: {
    name: string;
    avatar?: string;
  };
  createdAt: Date;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginationParams = {
  page: number;
  limit: number;
};

export type SearchParams = {
  search?: string;
  category?: string;
  priceRange?: [number, number];
  sortBy?: 'newest' | 'popular' | 'price-asc' | 'price-desc' | 'rating';
  pagination: PaginationParams;
};
