import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Wallet, TrendingUp, TrendingDown } from 'lucide-react';

function App() {
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');

  // 初始化載入
  useEffect(() => {
    const savedItems = localStorage.getItem('budgetItems');
    if (savedItems) setItems(JSON.parse(savedItems));
  }, []);

  // 儲存到本地
  useEffect(() => {
    localStorage.setItem('budgetItems', JSON.stringify(items));
  }, [items]);

  const total = items.reduce((acc, item) => acc + item.amount, 0);
  const income = items.filter(i => i.amount > 0).reduce((acc, i) => acc + i.amount, 0);
  const expense = items.filter(i => i.amount < 0).reduce((acc, i) => acc + i.amount, 0);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!text || !amount) return;
    const newItem = {
      id: Date.now(),
      text,
      amount: parseFloat(amount)
    };
    setItems([newItem, ...items]);
    setText('');
    setAmount('');
  };

  const deleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f7f6', borderRadius: '15px' }}>
      <h2 style={{ textAlign: 'center' }}>我的記帳本</h2>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', backgroundColor: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <div>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>總餘額</p>
          <h3 style={{ margin: 0 }}>${total.toFixed(2)}</h3>
        </div>
        <Wallet color="#3b82f6" />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <div style={{ flex: 1, backgroundColor: '#dcfce7', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
          <TrendingUp size={16} color="#16a34a" />
          <p style={{ margin: '5px 0 0', fontSize: '12px' }}>收入</p>
          <strong style={{ color: '#16a34a' }}>+${income.toFixed(2)}</strong>
        </div>
        <div style={{ flex: 1, backgroundColor: '#fee2e2', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
          <TrendingDown size={16} color="#dc2626" />
          <p style={{ margin: '5px 0 0', fontSize: '12px' }}>支出</p>
          <strong style={{ color: '#dc2626' }}>${Math.abs(expense).toFixed(2)}</strong>
        </div>
      </div>

      <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" placeholder="項目名稱 (例如：午餐)" 
          value={text} onChange={(e) => setText(e.target.value)}
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
        />
        <input 
          type="number" placeholder="金額 (正數為收入，負數為支出)" 
          value={amount} onChange={(e) => setAmount(e.target.value)}
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
        />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
          <PlusCircle size={18} /> 新增紀錄
        </button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map(item => (
          <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'white', padding: '10px', marginBottom: '8px', borderRadius: '5px', borderLeft: `5px solid ${item.amount > 0 ? '#16a34a' : '#dc2626'}` }}>
            <span>{item.text}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: item.amount > 0 ? '#16a34a' : '#dc2626' }}>
                {item.amount > 0 ? '+' : ''}{item.amount}
              </span>
              <Trash2 size={16} color="#999" cursor="pointer" onClick={() => deleteItem(item.id)} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
