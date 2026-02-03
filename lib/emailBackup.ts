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
        // 데이터 준비
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

            const dateStr = `${year}.${month}.${day} ${ampm} ${hours}:${minutes.toString().padStart(2, '0')}`;

            return {
                date: dateStr,
                category: e.category,
                amount: `${e.amount.toLocaleString()}원`,
                workType: e.workType,
                project: e.projectName || '-',
                participants: e.participants || '-',
                remarks: e.remarks || '-'
            };
        });

        // 총액 계산
        const totalAmount = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

        // 표 형식 텍스트 생성 (폭 조정)
        const makeLine = (items: string[], widths: number[]) => {
            return '| ' + items.map((item, i) => item.padEnd(widths[i])).join(' | ') + ' |';
        };

        const colWidths = [18, 8, 12, 8, 20, 25, 15]; // 각 열 폭
        const headers = ['결제일자', '사용구분', '사용금액', '근무구분', '감리사업명', '참석자', '비고'];

        const divider = '+' + colWidths.map(w => '-'.repeat(w + 2)).join('+') + '+';
        const headerLine = makeLine(headers, colWidths);

        const dataLines = dataRows.map(row => {
            return makeLine(
                [row.date, row.category, row.amount, row.workType, row.project, row.participants, row.remarks],
                colWidths
            );
        });

        const tableText = [
            divider,
            headerLine,
            divider,
            ...dataLines,
            divider
        ].join('\n');

        const emailBody = `${currentYear}년 ${currentMonth + 1}월 법인카드 사용내역

총 ${currentMonthExpenses.length}건 | 총액 ${totalAmount.toLocaleString()}원

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 아래 표를 복사하여 사용하세요

${tableText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
