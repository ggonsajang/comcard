'use client';

import { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Expense } from '@/lib/types';
import { getExpenses, saveExpense, updateExpense, deleteExpense } from '@/lib/storage';
import { checkPassword, setAuthSession, getAuthSession } from '@/lib/supabase';
import { sendBackupEmail } from '@/lib/emailBackup';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import LoginScreen from '@/components/LoginScreen';
import { Plus, Download, CreditCard, Mail } from 'lucide-react';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);

  // 데이터 로드 함수
  const loadExpenses = useCallback(async () => {
    const data = await getExpenses();
    setExpenses(data);
  }, []);

  // 인증 확인
  useEffect(() => {
    const authenticated = getAuthSession();
    setIsAuthenticated(authenticated);
    setIsLoading(false);
  }, []);

  // 데이터 로드
  useEffect(() => {
    if (isAuthenticated) {
      loadExpenses();
    }
  }, [isAuthenticated, loadExpenses]);

  const handleLogin = (password: string) => {
    if (checkPassword(password)) {
      setAuthSession();
      setIsAuthenticated(true);
    } else {
      alert('패스워드가 올바르지 않습니다.');
    }
  };

  const refreshList = async () => {
    await loadExpenses();
    setView('list');
    setEditingExpense(undefined);
  };

  const handleAdd = async (data: Omit<Expense, 'id' | 'createdAt'>) => {
    await saveExpense(data);
    await refreshList();

    // 저장 직후 업데이트된 데이터로 백업 이메일 발송
    setTimeout(async () => {
      const updatedExpenses = await getExpenses();
      sendBackupEmail(updatedExpenses);
    }, 500);
  };

  const handleUpdate = async (data: Omit<Expense, 'id' | 'createdAt'>) => {
    if (editingExpense) {
      await updateExpense({ ...data, id: editingExpense.id, createdAt: editingExpense.createdAt });
      await refreshList();

      // 수정 직후 업데이트된 데이터로 백업 이메일 발송
      setTimeout(async () => {
        const updatedExpenses = await getExpenses();
        sendBackupEmail(updatedExpenses);
      }, 500);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteExpense(id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const startEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setView('edit');
  };

  // Export State
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Helpers for filtering
  const filterExpenses = (mode: 'all' | 'prev' | 'curr') => {
    const now = new Date();
    const currMonth = now.getMonth();
    const currYear = now.getFullYear();

    // Previous month logic (handles Jan -> Dec prev year)
    let prevMonth = currMonth - 1;
    let prevYear = currYear;
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear = currYear - 1;
    }

    return expenses.filter(e => {
      if (mode === 'all') return true;
      const d = new Date(e.date);
      if (mode === 'curr') {
        return d.getMonth() === currMonth && d.getFullYear() === currYear;
      }
      if (mode === 'prev') {
        return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
      }
      return false;
    });
  };

  const getExportTitle = (mode: 'all' | 'prev' | 'curr') => {
    const now = new Date();
    if (mode === 'all') return '전체_내역';
    if (mode === 'curr') return `${now.getFullYear()}년${now.getMonth() + 1}월_내역`;

    let prevMonth = now.getMonth(); // 0-11. actual month is +1. so prevMonth index is (curr - 1).
    // If we want "Last Month" string:
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${d.getFullYear()}년${d.getMonth() + 1}월_내역`;
  };

  // Excel Export Logic
  const handleExport = (mode: 'all' | 'prev' | 'curr', isMailAction: boolean = false) => {
    const filteredData = filterExpenses(mode);

    if (filteredData.length === 0) {
      alert('선택한 기간에 내보낼 데이터가 없습니다.');
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
    const data = filteredData.map(e => {
      const d = new Date(e.date);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();
      let hours = d.getHours();
      const minutes = d.getMinutes();
      const seconds = d.getSeconds();
      const ampm = hours >= 12 ? '오후' : '오전';
      hours = hours % 12;
      hours = hours ? hours : 12;

      const dateStr = `${year}. ${month}. ${day} ${ampm} ${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
    ws['!cols'] = [
      { wch: 25 }, { wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 30 }, { wch: 25 }, { wch: 30 },
    ];

    // 4. Create Workbook and Download
    const wb = XLSX.utils.book_new();
    const title = getExportTitle(mode);
    XLSX.utils.book_append_sheet(wb, ws, '법인카드사용내역');
    XLSX.writeFile(wb, `법인카드_${title}.xlsx`);

    // 5. Mail Trigger
    if (isMailAction) {
      // Slight delay to allow download to start
      setTimeout(() => {
        const subjectTitle = title.replace(/_/g, ' '); // 2026년2월 내역
        const subject = encodeURIComponent(`${subjectTitle} 법인카드 사용내역 송부`);
        const body = encodeURIComponent(`${subjectTitle} 법인카드 사용내역 엑셀 파일을 송부합니다.\n\n(다운로드된 엑셀 파일을 첨부하여 보내주세요.)`);
        window.location.href = `mailto:dklee@itqi.kr?subject=${subject}&body=${body}`;
      }, 1000); // 1s delay
    } else {
      alert(`${title} 다운로드가 완료되었습니다.`);
    }

    setShowExportMenu(false);
  };


  // 로딩 중
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'var(--text-main)' }}>
          <div className="spinner" style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255, 255, 255, 0.1)',
            borderTop: '4px solid var(--primary)',
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite'
          }} />
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우 로그인 화면
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <main className="container">
      {/* Header */}
      <header className="flex-between" style={{ marginBottom: '24px', padding: '10px 0', position: 'relative' }}>
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
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '10px 16px',
                color: 'var(--text-main)',
                backdropFilter: 'blur(5px)',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Download size={18} />
              내보내기 / 메일
            </button>

            {showExportMenu && (
              <div style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                width: '240px',
                background: '#1c1c21',
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                padding: '8px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{ padding: '8px', fontSize: '12px', color: '#666', fontWeight: 'bold' }}>엑셀 다운로드 (파일저장)</div>
                <button onClick={() => handleExport('all')} className="menu-item" style={{ textAlign: 'left', padding: '10px', borderRadius: '8px', background: 'transparent', color: '#fff', fontSize: '14px' }}>
                  📅 전체 내역 다운로드
                </button>
                <button onClick={() => handleExport('prev')} className="menu-item" style={{ textAlign: 'left', padding: '10px', borderRadius: '8px', background: 'transparent', color: '#fff', fontSize: '14px' }}>
                  ⏮️ 전월 내역 다운로드
                </button>
                <button onClick={() => handleExport('curr')} className="menu-item" style={{ textAlign: 'left', padding: '10px', borderRadius: '8px', background: 'transparent', color: '#fff', fontSize: '14px' }}>
                  ✅ 당월 내역 다운로드
                </button>

                <div style={{ height: '1px', background: '#333', margin: '4px 0' }} />

                <div style={{ padding: '8px', fontSize: '12px', color: '#666', fontWeight: 'bold' }}>메일 발송 (다운로드+메일앱)</div>
                <button onClick={() => handleExport('prev', true)} className="menu-item" style={{ textAlign: 'left', padding: '10px', borderRadius: '8px', background: 'transparent', color: '#a29bfe', fontSize: '14px' }}>
                  📧 전월 내역 제출
                </button>
                <button onClick={() => handleExport('curr', true)} className="menu-item" style={{ textAlign: 'left', padding: '10px', borderRadius: '8px', background: 'transparent', color: '#a29bfe', fontSize: '14px' }}>
                  📧 당월 내역 제출
                </button>
              </div>
            )}

            {/* Click outside closer check could be added here or just toggle */}
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
