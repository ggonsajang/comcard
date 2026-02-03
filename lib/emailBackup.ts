import { Expense } from './types';

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
        console.log('⚠️ 당월 데이터가 없어 메일을 보내지 않습니다.');
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

        // 총액 계산
        const totalAmount = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

        // 탭으로 구분된 표 생성 (엑셀 붙여넣기 가능)
        const tsvTable = headers.join('\t') + '\n' +
            dataRows.map(row => row.join('\t')).join('\n');

        const emailBody = `${currentYear}년 ${currentMonth + 1}월 법인카드 사용내역

총 ${currentMonthExpenses.length}건 | 총액 ${totalAmount.toLocaleString()}원

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 아래 표를 전체 선택 → 복사 → 엑셀에 붙여넣기

${tsvTable}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

※ ComCard 자동 백업`;

        // <a> 태그로 mailto 링크 생성하고 클릭 (팝업 없음)
        const subject = `[ComCard 백업] ${currentYear}년 ${currentMonth + 1}월 법인카드 내역`;
        const mailtoUrl = `mailto:ggonsajang@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

        const link = document.createElement('a');
        link.href = mailtoUrl;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('📬 메일 앱 열기 완료');

    } catch (error) {
        console.error('❌ 백업 이메일 처리 중 오류:', error);
    }
};
