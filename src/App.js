/* eslint-disable no-unused-vars */
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Trash2, 
  Wallet, 
  History, 
  Pencil, 
  Utensils, 
  Car, 
  ShoppingBag, 
  Gamepad2, 
  MoreHorizontal,
  Landmark,
  Gift,
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
  X
} from 'lucide-react';

const App = () => {
  const [initialBalance, setInitialBalance] = useState(() => {
    const saved = localStorage.getItem('min_balance');
    return saved ? Number(saved) : 0;
  });
  const [isBalanceSet, setIsBalanceSet] = useState(() => !!localStorage.getItem('min_balance'));
  const [transactions, setTransactions] = useState([]);
  const [tempBalance, setTempBalance] = useState('');
  const [type, setType] = useState('expense');
  const [selectedIcon, setSelectedIcon] = useState('Utensils');
  const [formData, setFormData] = useState({ amount: '', note: '' });
  
  const [editingItem, setEditingItem] = useState(null);

  const expenseIcons = {
    Utensils: { icon: <Utensils size={20} /> },
    ShoppingBag: { icon: <ShoppingBag size={20} /> },
    Car: { icon: <Car size={20} /> },
    Gamepad2: { icon: <Gamepad2 size={20} /> },
    MoreHorizontal: { icon: <MoreHorizontal size={20} /> }
  };

  const incomeIcons = {
    Landmark: { icon: <Landmark size={20} /> },
    Gift: { icon: <Gift size={20} /> },
    Search: { icon: <Search size={20} /> }
  };

  const currentIcons = type === 'expense' ? expenseIcons : incomeIcons;

  useEffect(() => {
    if (!editingItem) {
      const firstIcon = type === 'expense' ? 'Utensils' : 'Landmark';
      setSelectedIcon(firstIcon);
    }
  }, [type, editingItem]);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      input[type=number] { -moz-appearance: textfield; }
      
      /* 定義動畫軌跡 */
      @keyframes iconPop {
        0% { transform: scale(0.5); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }

      /* 將動畫綁定到 class 名稱上 */
      .icon-btn-animate {
        animation: iconPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }

      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes modalIn {
        from { opacity: 0; transform: scale(0.9) translateY(40px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
        padding: 20px;
        animation: fadeIn 0.3s ease;
      }

      .modal-content {
        background: white;
        width: 100%;
        max-width: 400px;
        border-radius: 35px;
        padding: 32px;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.2);
        animation: modalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .list-item-container {
        position: relative;
        overflow: hidden;
        border-radius: 28px;
        margin-bottom: 12px;
        background-color: #f8fafc;
      }

      .list-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        background: white;
        position: relative;
        z-index: 2;
        border-radius: 28px;
      }

      .list-item-container:hover .list-content {
        transform: translateX(-110px);
        mask-image: linear-gradient(to right, transparent 0%, black 15%);
        -webkit-mask-image: linear-gradient(to right, transparent 0%, black 15%);
      }

      .action-buttons {
        position: absolute;
        right: 12px;
        top: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        opacity: 0;
        transform: translateX(10px);
        transition: all 0.4s ease;
        z-index: 1;
      }

      .list-item-container:hover .action-buttons {
        opacity: 1;
        transform: translateX(0);
      }

      .submit-btn {
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .submit-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 24px rgba(0,0,0,0.15);
      }

      .submit-btn:active {
        transform: scale(0.95) translateY(0);
      }

      .tap-animate { transition: transform 0.2s ease; }
      .tap-animate:active { transform: scale(0.92); }
      .list-item-entry { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

      .type-indicator {
        position: absolute;
        height: calc(100% - 12px);
        width: calc(50% - 6px);
        background: white;
        border-radius: 15px;
        top: 6px;
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        z-index: 0;
      }
    `;
    document.head.appendChild(style);
  }, []);

  const currentBalance = useMemo(() => {
    const diff = transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
    return initialBalance + diff;
  }, [initialBalance, transactions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.note) return;
    setTransactions([{
      id: Date.now(),
      type,
      icon: selectedIcon,
      amount: Number(formData.amount),
      note: formData.note,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }, ...transactions]);
    setFormData({ amount: '', note: '' });
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setSelectedIcon(item.icon);
  };

  const saveEdit = (e) => {
    e.preventDefault();
    setTransactions(transactions.map(t => 
      t.id === editingItem.id 
      ? { ...t, note: editingItem.note, amount: Number(editingItem.amount), icon: selectedIcon } 
      : t
    ));
    setEditingItem(null);
  };

  if (!isBalanceSet) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fdfdff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ width: '100%', maxWidth: '350px', backgroundColor: 'white', borderRadius: '40px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <div style={{ backgroundColor: '#f0f9ff', width: '80px', height: '80px', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#0ea5e9' }}>
            <Wallet size={40} />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '900', margin: '0 0 8px', color: '#0f172a' }}>設定本金</h2>
          <form onSubmit={(e) => { e.preventDefault(); setInitialBalance(Number(tempBalance)); setIsBalanceSet(true); localStorage.setItem('min_balance', tempBalance); }}>
            <input type="number" inputMode="decimal" placeholder="0" style={{ width: '100%', padding: '20px', borderRadius: '24px', border: '2px solid #f1f5f9', textAlign: 'center', fontSize: '32px', fontWeight: '900', marginBottom: '24px', boxSizing: 'border-box', outline: 'none' }} value={tempBalance} onChange={(e) => setTempBalance(e.target.value)} autoFocus />
            <button type="submit" className="tap-animate submit-btn" style={{ width: '100%', backgroundColor: '#0f172a', color: 'white', padding: '20px', borderRadius: '24px', border: 'none', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' }}>進入錢包</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', fontFamily: 'sans-serif', paddingBottom: '80px' }}>
      
      {editingItem && (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '950', margin: 0 }}>編輯紀錄</h2>
              <button onClick={() => setEditingItem(null)} style={{ border: 'none', background: '#f8fafc', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            
            <form onSubmit={saveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="no-scrollbar" style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '4px 0' }}>
                {Object.entries(editingItem.type === 'expense' ? expenseIcons : incomeIcons).map(([key, value]) => (
                  <button
                    key={`edit-${key}`}
                    type="button"
                    onClick={() => setSelectedIcon(key)}
                    className="icon-btn-animate tap-animate"
                    style={{ 
                      minWidth: '58px', height: '58px', borderRadius: '20px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', 
                      backgroundColor: selectedIcon === key ? '#0f172a' : '#f8fafc', 
                      color: selectedIcon === key ? 'white' : '#cbd5e1'
                    }}
                  >
                    {value.icon}
                  </button>
                ))}
              </div>
              <input type="text" style={{ padding: '18px', backgroundColor: '#f8fafc', border: 'none', borderRadius: '20px', fontSize: '16px', fontWeight: '700', outline: 'none' }} value={editingItem.note} onChange={(e) => setEditingItem({...editingItem, note: e.target.value})} />
              <input type="number" style={{ padding: '18px', backgroundColor: '#f8fafc', border: 'none', borderRadius: '20px', fontSize: '16px', fontWeight: '900', outline: 'none' }} value={editingItem.amount} onChange={(e) => setEditingItem({...editingItem, amount: e.target.value})} />
              <button type="submit" className="submit-btn" style={{ padding: '20px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '20px', fontWeight: '950', fontSize: '18px', cursor: 'pointer', marginTop: '8px' }}>確認修改</button>
            </form>
          </div>
        </div>
      )}

      <div style={{ padding: '50px 24px 30px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '6px 14px', borderRadius: '100px', marginBottom: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', letterSpacing: '1px' }}>WALLETS BALANCE</span>
        </div>
        <h1 style={{ fontSize: '56px', fontWeight: '950', margin: '0', color: currentBalance < 0 ? '#ef4444' : '#0f172a', letterSpacing: '-2px', transition: 'color 0.4s ease' }}>
          ${currentBalance.toLocaleString()}
        </h1>
        <button onClick={() => setIsBalanceSet(false)} style={{ marginTop: '16px', color: '#cbd5e1', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', margin: '16px auto' }}>
          <Pencil size={12} /> 編輯本金
        </button>
      </div>

      <main style={{ maxWidth: '440px', margin: '0 auto', padding: '0 20px' }}>
        <section style={{ backgroundColor: 'white', padding: '28px', borderRadius: '35px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', marginBottom: '32px', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', background: '#f8fafc', padding: '6px', borderRadius: '20px', marginBottom: '24px', position: 'relative' }}>
            <div className="type-indicator" style={{ transform: type === 'income' ? 'translateX(100%)' : 'translateX(0)' }} />
            <button onClick={() => setType('expense')} style={{ flex: 1, padding: '14px', borderRadius: '15px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', zIndex: 1, transition: 'color 0.3s ease', backgroundColor: 'transparent', color: type === 'expense' ? '#ef4444' : '#94a3b8' }}>
              <ArrowDownCircle size={16} /> 支出
            </button>
            <button onClick={() => setType('income')} style={{ flex: 1, padding: '14px', borderRadius: '15px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', zIndex: 1, transition: 'color 0.3s ease', backgroundColor: 'transparent', color: type === 'income' ? '#22c55e' : '#94a3b8' }}>
              <ArrowUpCircle size={16} /> 收入
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="no-scrollbar" style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '4px 0' }}>
              {Object.entries(currentIcons).map(([key, value]) => (
                <button
                  key={`${type}-${key}`}
                  type="button"
                  onClick={() => setSelectedIcon(key)}
                  className="icon-btn-animate tap-animate"
                  style={{ 
                    minWidth: '58px', height: '58px', borderRadius: '20px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', 
                    backgroundColor: selectedIcon === key ? '#0f172a' : '#f8fafc', 
                    color: selectedIcon === key ? 'white' : '#cbd5e1'
                  }}
                >
                  {value.icon}
                </button>
              ))}
            </div>

            <input type="text" placeholder="這一筆紀錄是什麼？" style={{ padding: '20px', backgroundColor: '#f8fafc', border: 'none', borderRadius: '22px', fontSize: '16px', fontWeight: '700', outline: 'none' }} value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} />
            <input type="number" inputMode="decimal" placeholder="金額" style={{ padding: '20px', backgroundColor: '#f8fafc', border: 'none', borderRadius: '22px', fontSize: '16px', fontWeight: '900', outline: 'none' }} value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
            <button type="submit" className="submit-btn" style={{ padding: '22px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '22px', fontWeight: '950', fontSize: '18px', cursor: 'pointer', marginTop: '6px' }}>記一筆</button>
          </form>
        </section>

        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 10px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '950', color: '#1e293b', margin: 0 }}>最近明細</h3>
            <History size={18} color="#cbd5e1" />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {transactions.map(t => (
              <div key={t.id} className="list-item-container list-item-entry">
                <div className="action-buttons">
                  <button onClick={() => startEdit(t)} className="tap-animate" style={{ width: '42px', height: '42px', borderRadius: '50%', border: 'none', backgroundColor: 'white', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}><Pencil size={18} /></button>
                  <button onClick={() => setTransactions(transactions.filter(i => i.id !== t.id))} className="tap-animate" style={{ width: '42px', height: '42px', borderRadius: '50%', border: 'none', backgroundColor: '#fee2e2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(239, 68, 68, 0.1)' }}><Trash2 size={18} /></button>
                </div>
                <div className="list-content">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '50px', height: '50px', backgroundColor: '#f8fafc', color: t.type === 'income' ? '#22c55e' : '#fb7185', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {(expenseIcons[t.icon] || incomeIcons[t.icon])?.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: '900', color: '#0f172a', fontSize: '16px' }}>{t.note}</div>
                      <div style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 'bold', marginTop: '2px' }}>{t.date}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: '950', color: t.type === 'income' ? '#22c55e' : '#ef4444', fontSize: '18px' }}>
                    {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
