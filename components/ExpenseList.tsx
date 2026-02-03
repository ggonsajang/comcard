'use client';

import { Expense } from '@/lib/types';
import { Edit2, Trash2, Calendar, User, FileText } from 'lucide-react';

interface ExpenseListProps {
    expenses: Expense[];
    onEdit: (expense: Expense) => void;
    onDelete: (id: string) => void;
}

export default function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
    if (expenses.length === 0) {
        return (
            <div className="flex-center" style={{ height: '300px', flexDirection: 'column', color: 'var(--text-muted)' }}>
                <p>등록된 내역이 없습니다.</p>
                <p style={{ fontSize: '14px', marginTop: '8px' }}>+ 버튼을 눌러 추가하세요.</p>
            </div>
        );
    }

    return (
        <div style={{ paddingBottom: '80px' }}>
            {expenses.map((expense) => (
                <div key={expense.id} className="card" style={{ position: 'relative' }}>
                    <div className="flex-between mb-4">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                                background: 'rgba(108, 93, 211, 0.2)',
                                color: '#8f75ff',
                                padding: '4px 8px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}>
                                {expense.category}
                            </span>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                {new Date(expense.date).toLocaleDateString()} {new Date(expense.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => onEdit(expense)}
                                style={{ padding: '8px', color: 'var(--text-main)' }}
                            >
                                <Edit2 size={18} />
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm('정말 삭제하시겠습니까?')) onDelete(expense.id);
                                }}
                                style={{ padding: '8px', color: 'var(--error)' }}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-between mb-4">
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>
                            {expense.amount.toLocaleString()}원
                        </h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: '#ccc' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText size={14} style={{ minWidth: '16px' }} />
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {expense.projectName || '-'}
                            </span>
                        </div>
                        {expense.participants && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <User size={14} style={{ minWidth: '16px' }} />
                                <span>{expense.participants}</span>
                            </div>
                        )}
                    </div>

                    {expense.receiptImage && (
                        <div style={{
                            position: 'absolute',
                            bottom: '20px',
                            right: '20px',
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            background: `url(${expense.receiptImage}) center/cover`,
                            border: '1px solid var(--border-light)'
                        }} />
                    )}
                </div>
            ))}
        </div>
    );
}
