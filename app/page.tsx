'use client';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Expense } from '@/lib/types';
import { getExpenses, saveExpense, updateExpense, deleteExpense } from '@/lib/storage';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import { Plus, Download, CreditCard, Mail } from 'lucide-react';

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);

  useEffect(() => {
    setExpenses(getExpenses());
  }, []);

  const refreshList = () => {
    setExpenses(getExpenses());
    setView('list');
    setEditingExpense(undefined);
  };

  const handleAdd = (data: Omit<Expense, 'id' | 'createdAt'>) => {
    saveExpense(data);
    refreshList();
  };

  const handleUpdate = (data: Omit<Expense, 'id' | 'createdAt'>) => {
    if (editingExpense) {
      updateExpense({ ...data, id: editingExpense.id, createdAt: editingExpense.createdAt });
      refreshList();
    }
  };

  const handleDelete = (id: string) => {
    deleteExpense(id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const startEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setView('edit');
  };

  // Excel Export Logic
  const handleExport = () => {
    if (expenses.length === 0) {
      alert('내보낼 데이터가 없습니다.');
      return;
    }

    // 1. Define Headers
    const headers = [
      '결제일자',
      '사용 구분',
      '사용 금액',
      '근무 구분',
      '감리사업명 or 제안명',
      '결제 포함 직원(본인 포함)',
      '비고'
    ];

    // 2. Format Data
    const data = expenses.map(e => {
      const d = new Date(e.date);
      // Format: 2025. 12. 29 오후 12:56:00
      // Simple manual formatting to match korean style roughly
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();
      let hours = d.getHours();
      const minutes = d.getMinutes();
      const seconds = d.getSeconds();
      const ampm = hours >= 12 ? '오후' : '오전';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'

      const dateStr = `${year}. ${month}. ${day} ${ampm} ${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      // Amount with '원'
      const amountStr = `${e.amount.toLocaleString()}원`;

      return [
        dateStr,
        e.category,
        amountStr,
        e.workType,
        e.projectName,
        e.participants,
        e.remarks
      ];
    });

    // 3. Create Worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Adjust column widths (optional but nice)
    ws['!cols'] = [
      { wch: 25 }, // Date
      { wch: 10 }, // Cat
      { wch: 15 }, // Amount
      { wch: 10 }, // Work
      { wch: 30 }, // Project
      { wch: 25 }, // Participants
      { wch: 30 }, // Remarks
    ];

    // 4. Create Workbook and Download
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '법인카드사용내역');
    XLSX.writeFile(wb, `법인카드내역_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <main className="container">
      {/* Header */}
      <header className="flex-between" style={{ marginBottom: '24px', padding: '10px 0' }}>
        <div className="flex-center gap-2">
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--primary), #8f75ff)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(108, 93, 211, 0.3)' }}>
            <CreditCard color="white" size={24} />
          </div>
          <div>
            <h1 className="title" style={{ fontSize: '22px', margin: 0 }}>ComCard</h1>
            <p className="subtitle" style={{ margin: 0, fontSize: '11px' }}>법인카드 관리자</p>
          </div>
        </div>

        {view === 'list' && (
          <div style={{ display: 'flex' }}>
            <button
              onClick={handleExport}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '10px',
                color: 'var(--text-main)',
                backdropFilter: 'blur(5px)'
              }}
            >
              <Download size={20} />
            </button>

            <button
              onClick={() => {
                handleExport();
                setTimeout(() => {
                  const subject = encodeURIComponent("법인카드 사용내역 송부");
                  const body = encodeURIComponent("법인카드 사용내역 엑셀 파일을 첨부하여 송부합니다.\n\n(다운로드된 엑셀 파일을 첨부해주세요.)");
                  window.location.href = `mailto:dkLee@itqi.com?subject=${subject}&body=${body}`;
                  alert("엑셀 파일이 다운로드되었습니다.\n메일 작성 창이 열리면 다운로드된 파일을 첨부해서 보내주세요.");
                }, 1000);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '10px',
                color: 'var(--text-main)',
                backdropFilter: 'blur(5px)',
                marginLeft: '8px'
              }}
            >
              <Mail size={20} />
            </button>
          </div>
        )}
      </header>

      {/* Content */}
      <div className="animate-fade-in">
        {view === 'list' && (
          <ExpenseList
            expenses={expenses}
            onEdit={startEdit}
            onDelete={handleDelete}
          />
        )}

        {(view === 'add' || view === 'edit') && (
          <ExpenseForm
            initialData={editingExpense}
            onSubmit={view === 'add' ? handleAdd : handleUpdate}
            onCancel={() => {
              setView('list');
              setEditingExpense(undefined);
            }}
          />
        )}
      </div>

      {/* Floating Action Button (Only in List) */}
      {
        view === 'list' && (
          <button
            onClick={() => setView('add')}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), #8f75ff)',
              color: 'white',
              boxShadow: '0 8px 24px rgba(108, 93, 211, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              transition: 'transform 0.2s',
            }}
            className="btn-primary"
          >
            <Plus size={28} />
          </button>
        )
      }
    </main >
  );
}
