'use client';

import { useState, useRef, useEffect } from 'react';
import { Expense, ExpenseCategory, WorkType } from '@/lib/types';
import { Camera, Save, X } from 'lucide-react';

interface ExpenseFormProps {
    initialData?: Expense;
    onSubmit: (data: Omit<Expense, 'id' | 'createdAt'>) => void;
    onCancel: () => void;
}

const CATEGORIES: ExpenseCategory[] = ['중식', '석식', '숙박비', 'KTX', '택시', '자차', '회식비', '기타'];
const WORK_TYPES: WorkType[] = ['감리', '내근', '기타'];

export default function ExpenseForm({ initialData, onSubmit, onCancel }: ExpenseFormProps) {
    const [date, setDate] = useState(initialData?.date || new Date().toISOString().slice(0, 16));
    const [category, setCategory] = useState<ExpenseCategory>(initialData?.category || '중식');
    const [amount, setAmount] = useState<string>(initialData?.amount?.toString() || '');
    const [workType, setWorkType] = useState<WorkType>(initialData?.workType || '감리');
    const [projectName, setProjectName] = useState(initialData?.projectName || '');
    const [participants, setParticipants] = useState(initialData?.participants || '');
    const [remarks, setRemarks] = useState(initialData?.remarks || '');
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.receiptImage || null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load defaults
    useEffect(() => {
        if (!initialData) {
            const lastProject = localStorage.getItem('comcard_last_project');
            const lastParticipants = localStorage.getItem('comcard_last_participants');
            if (lastProject) setProjectName(lastProject);
            if (lastParticipants) setParticipants(lastParticipants);
        }
    }, [initialData]);

    // Helper to resize image
    const resizeImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_SIZE = 800; // Resize to max 800px

                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        resolve(canvas.toDataURL('image/jpeg', 0.7));
                    } else {
                        resolve(reader.result as string); // Fallback
                    }
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const resized = await resizeImage(file);
                setImagePreview(resized);
            } catch (err) {
                console.error("Image error", err);
                alert("이미지 처리 실패");
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Save defaults
        localStorage.setItem('comcard_last_project', projectName);
        localStorage.setItem('comcard_last_participants', participants);

        onSubmit({
            date,
            category,
            amount: parseInt(amount) || 0,
            workType,
            projectName,
            participants,
            remarks,
            receiptImage: imagePreview
        });
    };

    return (
        <form onSubmit={handleSubmit} className="card">
            <h2 className="title" style={{ fontSize: '20px', marginBottom: '20px' }}>
                {initialData ? '내역 수정' : '내역 등록'}
            </h2>

            <div className="form-group">
                <label className="label">결제일자</label>
                <input
                    type="datetime-local"
                    className="input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <label className="label">영수증 업로드</label>
                <div
                    className="image-preview flex-center"
                    style={{ cursor: 'pointer', background: imagePreview ? `url(${imagePreview}) center/cover` : 'var(--bg-secondary)' }}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {!imagePreview && (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Camera size={32} />
                            <div style={{ marginTop: '8px', fontSize: '14px' }}>터치하여 촬영/선택</div>
                        </div>
                    )}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageChange}
                    hidden
                />
                {imagePreview && (
                    <div style={{ textAlign: 'right', marginTop: '8px' }}>
                        <button type="button" onClick={() => setImagePreview(null)} style={{ color: 'var(--error)', fontSize: '14px' }}>삭제</button>
                    </div>
                )}
            </div>

            <div className="flex-between gap-4">
                <div className="form-group" style={{ flex: 1 }}>
                    <label className="label">사용 구분</label>
                    <select
                        className="select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                    <label className="label">근무 구분</label>
                    <select
                        className="select"
                        value={workType}
                        onChange={(e) => setWorkType(e.target.value as WorkType)}
                    >
                        {WORK_TYPES.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label className="label">사용 금액 (원)</label>
                <input
                    type="number"
                    className="input"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    required
                />
            </div>

            <div className="form-group">
                <label className="label">감리사업명 or 제안명</label>
                <input
                    type="text"
                    className="input"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="프로젝트명을 입력하세요"
                />
            </div>

            <div className="form-group">
                <label className="label">결제 포함 직원 (본인 포함)</label>
                <input
                    type="text"
                    className="input"
                    value={participants}
                    onChange={(e) => setParticipants(e.target.value)}
                    placeholder="예: 김OO, 이OO"
                />
            </div>

            <div className="form-group">
                <label className="label">비고</label>
                <textarea
                    className="textarea"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="기타 특이사항 (출발/도착지 등)"
                    rows={3}
                />
            </div>

            <div className="flex-between gap-4 mt-4">
                <button type="button" onClick={onCancel} className="btn" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                    취소
                </button>
                <button type="submit" className="btn btn-primary">
                    <Save size={18} style={{ marginRight: '8px' }} />
                    저장하기
                </button>
            </div>
        </form>
    );
}
