import { Expense } from './types';

export const sendBackupEmail = (expenses: Expense[], recipient: string = 'ggonsajang@gmail.com') => {
    // 현재 월의 데이터만 필터링
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    if (currentMonthExpenses.length === 0) {
        console.log('당월 데이터가 없어 메일을 보내지 않습니다.');
        return;
    }

    // 제목
    const subject = `[ComCard 백업] ${currentYear}년 ${currentMonth + 1}월 법인카드 내역`;

    // 총액 계산
    const totalAmount = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    // ========== 1. 모바일용 읽기 쉬운 형식 ==========
    let mobileBody = `📱 ${currentYear}년 ${currentMonth + 1}월 법인카드 내역\n\n`;
    mobileBody += `📊 총 ${currentMonthExpenses.length}건 | 총액 ${totalAmount.toLocaleString()}원\n\n`;
    mobileBody += '='.repeat(60) + '\n\n';

    currentMonthExpenses.forEach((expense, index) => {
        const d = new Date(expense.date);
        const dateStr = `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;

        mobileBody += `[${index + 1}] ${dateStr}\n`;
        mobileBody += `💰 ${expense.amount.toLocaleString()}원 | ${expense.category} (${expense.workType})\n`;
        if (expense.projectName) {
            mobileBody += `📂 ${expense.projectName}\n`;
        }
        if (expense.participants) {
            mobileBody += `👥 ${expense.participants}\n`;
        }
        if (expense.remarks) {
            mobileBody += `📝 ${expense.remarks}\n`;
        }
        mobileBody += '\n';
    });

    // ========== 2. PC용 엑셀 복사 가능한 표 형식 ==========
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
        const amountStr = `${e.amount.toLocaleString()}원`;

        return [
            dateStr,
            e.category,
            amountStr,
            e.workType,
            e.projectName || '',
            e.participants || '',
            e.remarks || ''
        ];
    });

    let tableBody = '\n' + '='.repeat(60) + '\n';
    tableBody += '💻 PC에서 엑셀 복사용 (아래 표 전체 선택 → 복사 → 엑셀 붙여넣기)\n';
    tableBody += '='.repeat(60) + '\n\n';
    tableBody += headers.join('\t') + '\n';
    dataRows.forEach(row => {
        tableBody += row.join('\t') + '\n';
    });

    // 최종 본문 = 모바일 형식 + 표 형식
    const body = mobileBody + tableBody + '\n\n※ ComCard 자동 백업';

    // mailto 링크 생성
    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // 이메일 앱 열기
    window.location.href = mailtoLink;
};
