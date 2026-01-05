
import React from 'react';
import { FoodOrder } from '../types';

interface OrderCardProps {
  order: FoodOrder;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  return (
    <div className="glass-panel order-glow rounded-[24px] p-6 w-full mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start mb-5">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-blue-400 font-bold mb-1 block">餐饮确认</span>
          <h3 className="text-xl font-bold text-white">{order.restaurantName}</h3>
        </div>
        <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center text-[14px]">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[10px] text-white/40">{item.quantity}x</span>
              <span className="text-white/80">{item.name}</span>
            </div>
            <span className="font-mono text-white/60">¥{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      
      <div className="space-y-3 pt-4 border-t border-white/5">
        <div className="flex justify-between items-center">
          <span className="text-white/30 text-xs">配送至：{order.deliveryAddress}</span>
        </div>
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[10px] text-white/20 uppercase tracking-tighter">预计时间</span>
            <span className="text-blue-400 text-sm font-medium">{order.eta}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-white/20 uppercase block">总计金额</span>
            <span className="text-2xl font-bold text-white">¥{order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <button className="w-full mt-6 h-14 bg-white text-slate-950 font-bold rounded-2xl hover:bg-blue-50 transition-all active:scale-95 flex items-center justify-center gap-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        确认订单
      </button>
    </div>
  );
};
