import { Expense } from './types';

// CSV 형식으로 데이터를 포맷
const escapeCSV = (value: string): string => {
    if (!value) return '';
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
};

export const sendBackupEmail = (expenses: Expense[]) => {
    console.log('📧 sendBackupEmail 호출됨, 총 데이터:', expenses.length);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    console.log(`📊 당월(${currentYear}년 ${currentMonth + 1}월) 데이터:`, currentMonthExpenses.length, '건');

    if (currentMonthExpenses.length === 0) {
        console.log('⚠️ 당월 데이터가 없어 파일을 생성하지 않습니다.');
        alert('당월 데이터가 없습니다. 항목을 먼저 등록해주세요.');
        return;
    }

    try {
        const headers = [
            '결제일자',
            '사용 구분',
            '사용 금액',
            '근무 구분',
            '감리사업명 or 제안명',
            '결제 포함 직원(본인 포함)',
            '비고'
        ];

        const dataRows = currentMonthExpenses.map(e => {
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

            return [
                dateStr,
                e.category,
                `${e.amount.toLocaleString()}원`,
                e.workType,
                e.projectName || '',
                e.participants || '',
                e.remarks || ''
            ];
        });

        // CSV 파일 생성 (다운로드)
        const csvRows = dataRows.map(row =>
            row.map(cell => escapeCSV(cell)).join(',')
        );
        const csvContent = headers.map(h => escapeCSV(h)).join(',') + '\n' + csvRows.join('\n');
        const BOM = '\uFEFF';
        const csvWithBOM = BOM + csvContent;

        const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const fileName = `법인카드_${currentYear}년${currentMonth + 1}월_백업.csv`;

        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('✅ CSV 파일 다운로드 완료:', fileName);

        // Gmail 본문 (간단하게)
        const totalAmount = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

        const emailBody = `${currentYear}년 ${currentMonth + 1}월 법인카드 사용내역

📊 총 ${currentMonthExpenses.length}건 | 총액 ${totalAmount.toLocaleString()}원

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📎 첨부 파일 사용 방법:

1. 다운로드 폴더에서 "${fileName}" 파일 찾기
2. 파일을 더블클릭하여 엑셀로 열기
3. 또는 이 메일에 파일을 첨부하여 발송

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

※ ComCard 자동 백업 시스템`;

        // 팝업 없이 바로 Gmail 열기
        setTimeout(() => {
            const subject = `[ComCard 백업] ${currentYear}년 ${currentMonth + 1}월 법인카드 내역`;
            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=ggonsajang@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

            console.log('📬 Gmail 자동 열기');
            window.open(gmailUrl, '_blank');
        }, 300);

    } catch (error) {
        console.error('❌ 백업 이메일 처리 중 오류:', error);
        alert('백업 파일 생성 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
    }
};
